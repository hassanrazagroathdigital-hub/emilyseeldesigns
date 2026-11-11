import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Mail, MailOpen, Reply, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  adminKeys,
  deleteInquiry,
  fetchInquiries,
  fetchInquiry,
  friendlyError,
  updateInquiry,
  type InquiryQuery,
} from "@/lib/cms/admin";
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from "@/lib/cms/types";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  TableSkeleton,
  formatDate,
  relativeTime,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-terracotta/10 text-terracotta",
  in_progress: "bg-navy/10 text-navy",
  replied: "bg-forest/10 text-forest",
  archived: "bg-muted text-muted-foreground",
};

function StatusPill({ status }: { status: InquiryStatus }) {
  const label = INQUIRY_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
      )}
    >
      {label}
    </span>
  );
}

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function InquiriesPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput);
  const [status, setStatus] = useState<InquiryQuery["status"]>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sort, setSort] = useState<InquiryQuery["sort"]>("newest");
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<Inquiry | null>(null);

  useEffect(() => setPage(0), [search, status, unreadOnly, sort]);

  const query: InquiryQuery = { search, status, unreadOnly, sort, page, pageSize: PAGE_SIZE };
  const q = useQuery({
    queryKey: adminKeys.inquiries(query),
    queryFn: () => fetchInquiries(query),
    placeholderData: keepPreviousData,
  });

  const openId = params.get("open");
  const opened = useQuery({
    queryKey: [...adminKeys.inquiriesAll, "one", openId],
    queryFn: () => fetchInquiry(openId!),
    enabled: !!openId,
    initialData: () => q.data?.rows.find((r) => r.id === openId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cms", "admin"] });

  const patch = useMutation({
    mutationFn: (v: {
      id: string;
      patch: Partial<Pick<Inquiry, "status" | "is_read">>;
      silent?: boolean;
    }) => updateInquiry(v.id, v.patch),
    onSuccess: (_d, v) => {
      if (!v.silent) toast.success("Inquiry updated");
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  // Opening a message marks it as read.
  const openedData = opened.data;
  useEffect(() => {
    if (openedData && !openedData.is_read) {
      patch.mutate({ id: openedData.id, patch: { is_read: true }, silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedData?.id]);

  const open = (id: string) => setParams({ open: id });
  const close = () => setParams({});

  const total = q.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = q.data?.rows ?? [];
  const filtersActive = !!search || status !== "all" || unreadOnly;

  return (
    <div>
      <AdminPageHeader
        title="Inquiries"
        description="Messages sent through your website's contact form."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, subject or message…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              aria-label="Search inquiries"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as InquiryQuery["status"])}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INQUIRY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as InquiryQuery["sort"])}>
              <SelectTrigger className="w-[130px]" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
              Unread only
            </label>
          </div>
        </div>

        {q.isPending ? (
          <TableSkeleton cols={3} />
        ) : q.isError ? (
          <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-5 w-5" />}
            title={filtersActive ? "No matching inquiries" : "No inquiries yet"}
            description={
              filtersActive
                ? "Try a different search or filter."
                : "When visitors use the contact form, their messages will appear here."
            }
          />
        ) : (
          <ul className={cn("divide-y divide-border", q.isPlaceholderData && "opacity-60")}>
            {rows.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m.id)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-linen/40"
                >
                  <span
                    className={cn(
                      "mt-2 h-2 w-2 shrink-0 rounded-full",
                      m.is_read ? "bg-transparent" : "bg-terracotta",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={cn("text-sm text-ink", !m.is_read && "font-semibold")}>
                        {m.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{m.email}</span>
                    </div>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-sm",
                        m.is_read ? "text-ink/70" : "text-ink",
                      )}
                    >
                      {m.subject ? <span className="font-medium">{m.subject} — </span> : null}
                      <span className="text-muted-foreground">{m.message}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="text-xs text-muted-foreground"
                      title={formatDate(m.created_at, true)}
                    >
                      {relativeTime(m.created_at)}
                    </span>
                    <StatusPill status={m.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                disabled={page + 1 >= pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Sheet open={!!openId} onOpenChange={(o) => !o && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {opened.isPending ? (
            <div className="space-y-3 pt-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-linen" />
              ))}
            </div>
          ) : opened.isError || !opened.data ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-sans">Inquiry not found</SheetTitle>
                <SheetDescription>It may have been deleted.</SheetDescription>
              </SheetHeader>
            </>
          ) : (
            <InquiryDetail
              m={opened.data}
              busy={patch.isPending}
              onPatch={(p) => {
                qc.setQueryData([...adminKeys.inquiriesAll, "one", openId], {
                  ...opened.data!,
                  ...p,
                });
                patch.mutate({ id: opened.data!.id, patch: p });
              }}
              onDelete={() => setToDelete(opened.data!)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this inquiry?"
        description={
          <>
            The message from <strong>{toDelete?.name}</strong> ({toDelete?.email}) will be
            permanently deleted. Consider setting its status to "Archived" instead.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteInquiry(toDelete.id);
            toast.success("Inquiry deleted");
            close();
            void invalidate();
          } catch (e) {
            toast.error(friendlyError(e));
            throw e;
          }
        }}
      />
    </div>
  );
}

function InquiryDetail({
  m,
  busy,
  onPatch,
  onDelete,
}: {
  m: Inquiry;
  busy: boolean;
  onPatch: (p: Partial<Pick<Inquiry, "status" | "is_read">>) => void;
  onDelete: () => void;
}) {
  const replySubject = encodeURIComponent(`Re: ${m.subject || "Your message"}`);
  return (
    <div className="space-y-6">
      <SheetHeader className="text-left">
        <SheetTitle className="font-sans text-lg">{m.subject || "(no subject)"}</SheetTitle>
        <SheetDescription>Received {formatDate(m.created_at, true)}</SheetDescription>
      </SheetHeader>

      <dl className="grid grid-cols-[90px_1fr] gap-y-2 rounded-lg bg-linen/50 p-4 text-sm">
        <dt className="text-muted-foreground">From</dt>
        <dd className="font-medium">{m.name}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd className="break-all">
          <a href={`mailto:${m.email}`} className="text-terracotta hover:underline">
            {m.email}
          </a>
        </dd>
        {m.phone && (
          <>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>
              <a href={`tel:${m.phone}`} className="hover:underline">
                {m.phone}
              </a>
            </dd>
          </>
        )}
      </dl>

      <div>
        <h3 className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Message
        </h3>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
          {m.message}
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Status</span>
          <Select
            value={m.status}
            onValueChange={(v) => onPatch({ status: v as InquiryStatus })}
            disabled={busy}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INQUIRY_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a
              href={`mailto:${m.email}?subject=${replySubject}`}
              onClick={() => m.status === "new" && onPatch({ status: "in_progress" })}
            >
              <Reply /> Reply by email
            </a>
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onPatch({ is_read: !m.is_read })}
          >
            {m.is_read ? <Mail /> : <MailOpen />}
            Mark as {m.is_read ? "unread" : "read"}
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
