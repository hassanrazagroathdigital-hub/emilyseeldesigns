import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { InquiryError, submitInquiry, useSiteSettings } from "@/lib/cms/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Formspree still sends the owner an email notification for each message. */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvznwaka";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function notifyByEmail(body: Record<string, string>) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to send");
}

export default function ContactPage() {
  const { contact_page: page, contact, seo } = useSiteSettings();
  useDocumentTitle(seo.contactTitle, seo.contactDescription);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = name.trim() && email.trim() && message.trim();

  const handleSend = async () => {
    if (!canSend || sending) return;
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (name.length > 120 || subject.length > 200 || message.length > 5000) {
      setError("Your message is too long. Please shorten it and try again.");
      return;
    }
    setSending(true);
    setError(null);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };
    const fallbackMsg = `Something went wrong. Please email ${contact.email} directly.`;

    let stored = false;
    try {
      if (isSupabaseConfigured) {
        try {
          await submitInquiry({ ...payload, website });
          stored = true;
        } catch (e) {
          // Validation / rate-limit rejections are shown to the visitor.
          if (e instanceof InquiryError && e.rejected) {
            setError(e.message);
            return;
          }
          // Otherwise fall through: the email notification may still work.
        }
      }
      if (website) {
        setSent(true); // bot: pretend success
        return;
      }
      try {
        await notifyByEmail(payload);
      } catch {
        if (!stored) throw new Error("both channels failed");
      }
      setSent(true);
    } catch {
      setError(fallbackMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader title={page.title} subtitle={page.subtitle} />

      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.18)]">
            {sent ? (
              <div className="py-12 text-center" role="status">
                <div className="w-14 h-14 rounded-full bg-terracotta/15 text-terracotta mx-auto flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h2 className="font-display text-3xl mt-5 text-ink">{page.thankYouTitle}</h2>
                <p className="mt-3 text-ink/75">{page.thankYouBody}</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl text-ink">{page.formTitle}</h2>
                <div className="mt-6 space-y-5">
                  <Field label="Name" required>
                    <input
                      value={name}
                      maxLength={120}
                      autoComplete="name"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      value={email}
                      maxLength={254}
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      value={subject}
                      maxLength={200}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Message" required>
                    <textarea
                      rows={6}
                      value={message}
                      maxLength={5000}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors resize-none"
                    />
                  </Field>
                  {/* Honeypot: hidden from people, tempting for bots. */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] w-px h-px overflow-hidden"
                  >
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </label>
                  </div>
                  {error && (
                    <p className="text-sm text-terracotta" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "sending…" : "send message"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
            <h2 className="font-display text-3xl text-ink">{page.detailsTitle}</h2>
            <div className="mt-8 space-y-7">
              {contact.email && (
                <Info label="Email">
                  <a href={`mailto:${contact.email}`} className="text-terracotta hover:underline">
                    {contact.email}
                  </a>
                </Info>
              )}
              {contact.instagramUrl && (
                <Info label="Instagram">
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-terracotta hover:underline"
                  >
                    {contact.instagramHandle || contact.instagramUrl}
                  </a>
                </Info>
              )}
              {contact.responseTime && <Info label="Response time">{contact.responseTime}</Info>}
              {contact.location && <Info label="Location">{contact.location}</Info>}
            </div>
          </div>
        </div>
      </section>

      <FolkDivider />

      <section className="bg-linen py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border-[6px] border-terracotta/20 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
            <img
              src={page.aboutImage}
              alt="Emily Seel in her studio"
              loading="lazy"
              width={1024}
              height={1280}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">{page.aboutEyebrow}</span>
            <h2 className="font-display text-ink text-4xl md:text-5xl mt-3">{page.aboutTitle}</h2>
            <p className="mt-6 text-ink/80 whitespace-pre-line">{page.aboutBody}</p>
          </div>
        </div>
      </section>

      <FolkDivider />
    </PageShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">
        {label}
        {required && <span className="text-terracotta ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="eyebrow block mb-1.5">{label}</span>
      <div className="text-ink/85">{children}</div>
    </div>
  );
}
