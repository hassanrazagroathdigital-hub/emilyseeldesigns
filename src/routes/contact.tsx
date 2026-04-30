import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import portrait from "@/assets/emily-selfie.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Emily Seel Designs" },
      {
        name: "description",
        content:
          "Get in touch with Emily Seel — questions, commissions, or custom handmade pieces. Based in Portland, Oregon.",
      },
      { property: "og:title", content: "Say Hello — Emily Seel Designs" },
      {
        property: "og:description",
        content: "Reach out with questions, commissions, or just to connect.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = name.trim() && email.trim() && message.trim();

  const handleSend = () => {
    if (!canSend) return;
    setSent(true);
  };

  return (
    <PageShell>
      <PageHeader
        title="Say Hello"
        subtitle="Reach out with questions, commissions, or just to connect."
      />

      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.18)]">
            {sent ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-terracotta/15 text-terracotta mx-auto flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h2 className="font-display text-3xl mt-5 text-ink">Thank you!</h2>
                <p className="mt-3 text-ink/75">
                  Your message is on its way. Emily typically responds within 1–2 business days.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl text-ink">Send a message</h2>
                <div className="mt-6 space-y-5">
                  <Field label="Name" required>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </Field>
                  <Field label="Message" required>
                    <textarea
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-terracotta transition-colors resize-none"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    send message
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
            <h2 className="font-display text-3xl text-ink">Studio details</h2>
            <div className="mt-8 space-y-7">
              <Info label="Email">
                <a href="mailto:hello@emilyseeldesigns.com" className="text-terracotta hover:underline">
                  hello@emilyseeldesigns.com
                </a>
              </Info>
              <Info label="Instagram">
                <a
                  href="https://instagram.com/emilyseeldesigns"
                  target="_blank"
                  rel="noreferrer"
                  className="text-terracotta hover:underline"
                >
                  @emilyseeldesigns
                </a>
              </Info>
              <Info label="Response time">
                We typically respond within 1 to 2 business days.
              </Info>
              <Info label="Location">Portland, Oregon — Handmade in the USA</Info>
            </div>
          </div>
        </div>
      </section>

      <FolkDivider />

      <section className="bg-linen py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border-[6px] border-terracotta/20 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
            <img
              src={portrait}
              alt="Emily Seel in her studio"
              loading="lazy"
              width={1024}
              height={1280}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">About the Designer</span>
            <h2 className="font-display text-ink text-4xl md:text-5xl mt-3">
              About the Designer
            </h2>
            <p className="mt-6 text-ink/80">
              Emily Seel is a Cabinet Designer based out of Portland, Oregon. She completed her
              Bachelor of Science in Industrial Design from The Art Institute of Seattle. While
              there, she focused her studies on designing and building products for children. She
              enjoys all kinds of creative mediums, including sewing, painting, carpentry, and
              ceramics. Emily also has a passion for nature and loves houseplants and gardening.
            </p>
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
