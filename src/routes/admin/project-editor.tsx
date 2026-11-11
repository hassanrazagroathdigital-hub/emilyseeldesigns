import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminKeys,
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  friendlyError,
  updateProject,
} from "@/lib/cms/admin";
import { slugify, SLUG_RE } from "@/lib/cms/slug";
import type { Project, ProjectInput } from "@/lib/cms/types";
import { AdminPageHeader, Card, ConfirmDialog, ErrorState, FormField } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { SlidesEditor } from "@/components/admin/SlidesEditor";

const EMPTY: ProjectInput = {
  title: "",
  slug: "",
  description: "",
  category: "industrial-design",
  tags: [],
  cover_image: null,
  gallery: [],
  featured: true,
  published: false,
  sort_order: 0,
};

function toInput(p: Project): ProjectInput {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = p;
  return rest;
}

type Errors = Partial<Record<"title" | "slug" | "description", string>>;

function validate(v: ProjectInput): Errors {
  const e: Errors = {};
  if (!v.title.trim()) e.title = "Title is required.";
  else if (v.title.length > 200) e.title = "Keep the title under 200 characters.";
  if (!v.slug) e.slug = "Slug is required.";
  else if (!SLUG_RE.test(v.slug))
    e.slug = "Use lowercase letters, numbers and single hyphens only.";
  return e;
}

export default function ProjectEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: adminKeys.project(id ?? "new"),
    queryFn: () => fetchProject(id!),
    enabled: !isNew,
  });
  // Needed only to place new projects at the end of the list.
  const all = useQuery({ queryKey: adminKeys.projects, queryFn: fetchProjects, enabled: isNew });

  const [initial, setInitial] = useState<ProjectInput | null>(isNew ? EMPTY : null);
  const [values, setValues] = useState<ProjectInput>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tagsText, setTagsText] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (q.data) {
      const v = toInput(q.data);
      setInitial(v);
      setValues(v);
      setTagsText(v.tags.join(", "));
    }
  }, [q.data]);

  const dirty = useMemo(
    () => initial !== null && JSON.stringify(initial) !== JSON.stringify(values),
    [initial, values],
  );

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function save() {
    const v: ProjectInput = {
      ...values,
      title: values.title.trim(),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const maxOrder = Math.max(-10, ...(all.data ?? []).map((p) => p.sort_order));
        const created = await createProject({ ...v, sort_order: maxOrder + 10 });
        toast.success(v.published ? "Project published" : "Draft saved");
        setInitial(v);
        await qc.invalidateQueries({ queryKey: ["cms"] });
        navigate(`/admin/projects/${created.id}`, { replace: true });
      } else {
        const updated = await updateProject(id!, v);
        const nv = toInput(updated);
        setInitial(nv);
        setValues(nv);
        toast.success("Changes saved");
        await qc.invalidateQueries({ queryKey: ["cms"] });
      }
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "23505") setErrors((x) => ({ ...x, slug: "This slug is already in use." }));
      toast.error(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && q.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }
  if (!isNew && q.isError) {
    return (
      <Card>
        <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
      </Card>
    );
  }
  if (!isNew && q.data === null) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">This project no longer exists.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/projects">Back to projects</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => (dirty ? setConfirmLeave(true) : navigate("/admin/projects"))}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </button>

      <AdminPageHeader
        title={isNew ? "New project" : values.title || "Untitled project"}
        description={
          isNew
            ? "Add a project to your Industrial Design portfolio."
            : dirty
              ? "You have unsaved changes."
              : "All changes saved."
        }
        actions={
          <>
            {!isNew && initial?.published && (
              <Button asChild variant="ghost" size="sm">
                <a href="/industrial-design" target="_blank" rel="noreferrer">
                  <ExternalLink /> View on site
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => (dirty ? setConfirmLeave(true) : navigate("/admin/projects"))}
            >
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || (!isNew && !dirty)}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {isNew ? "Create project" : "Save changes"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <FormField label="Title" htmlFor="title" required error={errors.title}>
              <Input
                id="title"
                value={values.title}
                maxLength={200}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </FormField>
            <FormField
              label="URL slug"
              htmlFor="slug"
              required
              error={errors.slug}
              help="A unique identifier, e.g. sand-city. Generated from the title."
            >
              <Input
                id="slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor="desc"
              help="Shown under the title on the project card."
            >
              <Textarea
                id="desc"
                rows={6}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </FormField>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="font-sans text-sm font-semibold text-ink">Gallery images</h2>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">
              Shown as a carousel on the project card, in this order.
            </p>
            <SlidesEditor value={values.gallery} onChange={(g) => set("gallery", g)} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <h2 className="font-sans text-sm font-semibold text-ink">Visibility</h2>
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Published</span>
                <span className="block text-xs text-muted-foreground">Visible on the website.</span>
              </span>
              <Switch checked={values.published} onCheckedChange={(c) => set("published", c)} />
            </label>
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Show on home page</span>
                <span className="block text-xs text-muted-foreground">
                  Also list it in the home page's work section.
                </span>
              </span>
              <Switch checked={values.featured} onCheckedChange={(c) => set("featured", c)} />
            </label>
          </Card>

          <Card className="space-y-4 p-5">
            <FormField
              label="Cover image"
              help="Used when the project has no gallery images, and as its thumbnail."
            >
              <ImageField
                value={values.cover_image}
                onChange={(r) => set("cover_image", r?.url ?? null)}
                folder="projects"
              />
            </FormField>
          </Card>

          <Card className="space-y-4 p-5">
            <FormField label="Category" htmlFor="category">
              <Input
                id="category"
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </FormField>
            <FormField
              label="Tags"
              htmlFor="tags"
              help="Comma separated, e.g. wood, toddler, outdoor."
            >
              <Input
                id="tags"
                value={tagsText}
                onChange={(e) => {
                  setTagsText(e.target.value);
                  set(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  );
                }}
              />
            </FormField>
          </Card>

          {!isNew && (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 /> Delete project
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${initial?.title}"?`}
        description="This permanently removes the project from your website. Its images stay in the Media Library. This can't be undone."
        onConfirm={async () => {
          try {
            await deleteProject(id!);
            toast.success("Project deleted");
            setInitial(values); // clear dirty state so navigation isn't blocked
            await qc.invalidateQueries({ queryKey: ["cms"] });
            navigate("/admin/projects", { replace: true });
          } catch (e) {
            toast.error(friendlyError(e));
            throw e;
          }
        }}
      />
      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Discard unsaved changes?"
        description="You've made changes that haven't been saved. Leaving now will lose them."
        confirmLabel="Discard changes"
        onConfirm={() => navigate("/admin/projects")}
      />
    </div>
  );
}
