import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminKeys,
  fetchSettingsRows,
  friendlyError,
  saveSettingsSection,
  type SettingsRows,
} from "@/lib/cms/admin";
import {
  SETTINGS_SECTIONS,
  defaultSettings,
  type FieldDef,
  type SectionDef,
  type SettingsKey,
} from "@/lib/cms/settings";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  ErrorState,
  FormField,
  relativeTime,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { cn } from "@/lib/utils";

type Values = Record<string, unknown>;

/**
 * Current form values for a section: stored value when present and valid,
 * otherwise the default. Image fields hold the STORED url ("" = default image).
 */
function sectionValues(def: SectionDef, rows: SettingsRows): Values {
  const stored = rows.find((r) => r.key === def.key)?.value ?? {};
  const defaults = defaultSettings[def.key] as Values;
  const out: Values = {};
  for (const f of def.fields) {
    const s = stored[f.key];
    if (f.type === "image") out[f.key] = typeof s === "string" ? s : "";
    else if (f.type === "list") out[f.key] = Array.isArray(s) ? s : defaults[f.key];
    else if (f.type === "boolean") out[f.key] = typeof s === "boolean" ? s : defaults[f.key];
    else out[f.key] = typeof s === "string" ? s : defaults[f.key];
  }
  return out;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateField(f: FieldDef, v: unknown): string | null {
  if (f.type === "text" || f.type === "textarea" || f.type === "email" || f.type === "url") {
    const s = String(v ?? "").trim();
    if (f.required && !s) return `${f.label} is required.`;
    if (s && f.type === "email" && !EMAIL_RE.test(s)) return "Enter a valid email address.";
    if (s && f.type === "url") {
      try {
        const u = new URL(s);
        if (!/^https?:$/.test(u.protocol)) return "Use a link starting with https://";
      } catch {
        return "Enter a full link, e.g. https://example.com";
      }
    }
    if (s.length > 5000) return "This text is too long.";
  }
  return null;
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const q = useQuery({ queryKey: adminKeys.settings, queryFn: fetchSettingsRows });
  const activeKey = (params.get("s") as SettingsKey) || "general";
  const section = SETTINGS_SECTIONS.find((s) => s.key === activeKey) ?? SETTINGS_SECTIONS[0];

  const initial = useMemo(
    () => (q.data ? sectionValues(section, q.data) : null),
    [q.data, section],
  );
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pendingSection, setPendingSection] = useState<SettingsKey | null>(null);

  useEffect(() => {
    if (initial) {
      setValues(initial);
      setErrors({});
    }
  }, [initial]);

  const changed = useMemo(() => {
    if (!initial) return {};
    const diff: Values = {};
    for (const f of section.fields) {
      if (JSON.stringify(initial[f.key]) !== JSON.stringify(values[f.key]))
        diff[f.key] = values[f.key];
    }
    return diff;
  }, [initial, values, section]);
  const dirty = Object.keys(changed).length > 0;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function goTo(key: SettingsKey) {
    if (key === section.key) return;
    if (dirty) setPendingSection(key);
    else setParams({ s: key });
  }

  async function save() {
    const errs: Record<string, string> = {};
    for (const f of section.fields) {
      const e = validateField(f, values[f.key]);
      if (e) errs[f.key] = e;
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const patch: Values = {};
    for (const [k, v] of Object.entries(changed)) {
      patch[k] =
        typeof v === "string"
          ? v.trim()
          : Array.isArray(v)
            ? v.map((x) => String(x).trim()).filter(Boolean)
            : v;
    }
    setSaving(true);
    try {
      await saveSettingsSection(section.key, patch);
      toast.success(`${section.title} saved`);
      await qc.invalidateQueries({ queryKey: ["cms"] });
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  const updatedAt = q.data?.find((r) => r.key === section.key)?.updated_at;
  const groups = ["Site", "Pages", "SEO"] as const;

  return (
    <div>
      <AdminPageHeader
        title="Website Settings"
        description="Text, images and details used across your website."
      />

      {q.isError ? (
        <Card>
          <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Section navigation */}
          <nav aria-label="Settings sections">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {SETTINGS_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => goTo(s.key)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                    s.key === section.key
                      ? "border-terracotta bg-terracotta/10 text-terracotta"
                      : "border-border bg-card",
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <div className="hidden space-y-5 lg:block">
              {groups.map((g) => (
                <div key={g}>
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g}
                  </p>
                  {SETTINGS_SECTIONS.filter((s) => s.group === g).map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => goTo(s.key)}
                      className={cn(
                        "block w-full rounded-md px-3 py-1.5 text-left text-sm",
                        s.key === section.key
                          ? "bg-terracotta/10 font-medium text-terracotta"
                          : "text-ink/75 hover:bg-linen",
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </nav>

          <Card>
            <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-sans text-base font-semibold text-ink">{section.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                  {updatedAt && ` · Last saved ${relativeTime(updatedAt)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!dirty || saving}
                  onClick={() => initial && setValues(initial)}
                >
                  <RotateCcw /> Discard
                </Button>
                <Button size="sm" onClick={() => void save()} disabled={!dirty || saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}
                  Save
                </Button>
              </div>
            </div>

            {q.isPending || !initial ? (
              <div className="space-y-5 p-5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-linen" />
                    <div className="h-9 animate-pulse rounded bg-linen" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-5 p-5 md:grid-cols-2">
                {section.fields.map((f) => (
                  <SettingField
                    key={`${section.key}.${f.key}`}
                    sectionKey={section.key}
                    field={f}
                    value={values[f.key]}
                    error={errors[f.key]}
                    onChange={(v) => {
                      setValues((prev) => ({ ...prev, [f.key]: v }));
                      if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: "" }));
                    }}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingSection}
        onOpenChange={(o) => !o && setPendingSection(null)}
        title="Discard unsaved changes?"
        description={`You have unsaved changes in "${section.title}".`}
        confirmLabel="Discard changes"
        onConfirm={() => {
          if (pendingSection) setParams({ s: pendingSection });
          setPendingSection(null);
        }}
      />
    </div>
  );
}

function SettingField({
  sectionKey,
  field: f,
  value,
  error,
  onChange,
}: {
  sectionKey: SettingsKey;
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}) {
  const id = `${sectionKey}-${f.key}`;
  const wide = f.type === "textarea" || f.type === "list" || f.type === "image";
  const defaultValue = (defaultSettings[sectionKey] as Values)[f.key];

  if (f.type === "boolean") {
    return (
      <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 md:col-span-2">
        <span className="text-sm font-medium">{f.label}</span>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </label>
    );
  }

  return (
    <FormField
      label={f.label}
      htmlFor={id}
      required={f.required}
      help={f.help}
      error={error || null}
      className={wide ? "md:col-span-2" : undefined}
    >
      {f.type === "image" ? (
        <div className="max-w-sm">
          <ImageField
            id={id}
            value={(value as string) || null}
            fallbackUrl={(defaultValue as string) || undefined}
            onChange={(r) => onChange(r?.url ?? "")}
            folder="settings"
            allowIcon={f.key === "faviconUrl"}
            aspect={f.key === "faviconUrl" || f.key === "logoUrl" ? "aspect-[3/1]" : "aspect-[4/3]"}
          />
        </div>
      ) : f.type === "textarea" ? (
        <Textarea
          id={id}
          rows={f.rows ?? 3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : f.type === "list" ? (
        <Textarea
          id={id}
          rows={8}
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      ) : (
        <Input
          id={id}
          type={f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </FormField>
  );
}
