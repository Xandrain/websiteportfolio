/**
 * ProfileBlock — adapted from the glassmorphism-portfolio-block pattern.
 *
 * No shadcn/ui required. Colors map directly to the site's CSS design tokens:
 *   paper  #FAFAF8  ink  #1A1917  ink-soft  #5C5955  ink-muted  #A09D9A
 *
 * Drop in as a React island: <ProfileBlock client:visible />
 */

import { motion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Camera,    // Instagram
  Boxes,     // ArtStation
  Mail,      // Email
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Design tokens (mirrors global.css variables) ──────────────
const C = {
  paper:     "#FAFAF8",
  ink:       "#1A1917",
  inkSoft:   "#5C5955",
  inkMuted:  "#736E68", // AA-legible muted tone (matches --color-ink-muted)
  line:      "rgba(26,25,23,0.08)",
  glass:     "rgba(250,250,248,0.72)",
  glassMid:  "rgba(250,250,248,0.80)",
  glassDeep: "rgba(250,250,248,0.62)",
  shadow:    "0 8px 48px rgba(26,25,23,0.05), 0 1px 4px rgba(26,25,23,0.04)",
  shadowMd:  "0 4px 24px rgba(26,25,23,0.06)",
  shadowSm:  "0 2px 12px rgba(26,25,23,0.05)",
} as const;

// ── Content ────────────────────────────────────────────────────
type Highlight = { title: string; description: string };
type SocialLink = { label: string; handle: string; href: string; icon: LucideIcon };

const highlights: Highlight[] = [
  {
    title: "Photography",
    description:
      "Patient, single-light work spanning landscape, portrait, and architecture. Four continents, one consistent restraint.",
  },
  {
    title: "Graphic Design & 3D",
    description:
      "3D modeling, rigging, and texturing for animated television — Mojo SwopTops (BlueZoo UK) and AZUREUS (BlackSun Entertainment) — alongside personal character and product studies.",
  },
  {
    title: "Tools",
    description:
      "Maya, Blender, ZBrush, Substance 3D Painter, Redshift, Photoshop, DaVinci Resolve.",
  },
  {
    title: "Available for",
    description:
      "Full-time, contract, and freelance work. Based in Luxembourg, remote-friendly across EU and global time zones.",
  },
];

const socialLinks: SocialLink[] = [
  {
    label:  "Instagram",
    handle: "@haineaux_alexandre",
    href:   "https://www.instagram.com/haineaux_alexandre",
    icon:   Camera,
  },
  {
    label:  "ArtStation",
    handle: "xandrain",
    href:   "https://xandrain.artstation.com",
    icon:   Boxes,
  },
  {
    label:  "Email",
    handle: "studio@alexandrehaineaux.com",
    href:   "mailto:studio@alexandrehaineaux.com",
    icon:   Mail,
  },
];

// ── Animation variants ─────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const listVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, duration: 0.4 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ── Sub-components ─────────────────────────────────────────────
function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        border: `1px solid ${C.line}`,
        background: C.glassMid,
        padding: "0.3rem 1rem",
        fontSize: "0.625rem",
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: C.inkMuted,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        height: "3rem",
        padding: "0 2rem",
        borderRadius: "9999px",
        background: C.ink,
        color: C.paper,
        textDecoration: "none",
        fontSize: "0.6875rem",
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        transition: "opacity 0.25s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </a>
  );
}

// ── Main component ─────────────────────────────────────────────
export function ProfileBlock() {
  return (
    <section
      style={{ position: "relative", padding: "3.5rem 1.5rem 0" }}
      aria-label="About Alexandre Haineaux"
    >
      <div style={{ maxWidth: "75rem", marginInline: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "1.5rem",
            border: `1px solid ${C.line}`,
            background: C.glass,
            boxShadow: C.shadow,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            padding: "2rem",
          }}
          className="md:!p-12"
        >
          {/* Subtle inner gradient */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(26,25,23,0.025) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gap: "3rem",
            }}
            className="lg:!grid-cols-2"
          >
            {/* ── Left column ─────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <EyebrowBadge>Graphic Designer / 3D Artist / Photographer</EyebrowBadge>

              {/* Heading + bio */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <motion.h2
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    color: C.ink,
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Alexandre Haineaux
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.75,
                    color: C.inkSoft,
                    maxWidth: "52ch",
                    margin: 0,
                  }}
                >
                  A practice working between the still image and the rendered
                  form. The two disciplines share one sensibility: restraint,
                  attention to light, and a belief that the quietest version of
                  an idea is usually the strongest. On the 3D side, that's taken
                  shape as a props modeler on BBC's Mojo SwopTops and as a
                  rigger / texture artist on the animated series AZUREUS.
                </motion.p>
              </div>

              {/* Highlights */}
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {highlights.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.08 * i }}
                    whileHover={{ y: -3 }}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "1rem",
                      border: `1px solid ${C.line}`,
                      background: C.glassMid,
                      padding: "1.125rem 1.25rem",
                      cursor: "default",
                      transition: "box-shadow 0.3s, border-color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = C.shadowSm;
                      e.currentTarget.style.borderColor = "rgba(26,25,23,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = C.line;
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: C.inkMuted,
                        margin: "0 0 0.4rem",
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
              >
                <PrimaryLink href="/photography">
                  View Photography <ArrowUpRight size={14} />
                </PrimaryLink>
                <PrimaryLink href="/productions">
                  View Graphic Design &amp; 3D <ArrowUpRight size={14} />
                </PrimaryLink>
              </motion.div>
            </div>

            {/* ── Right column — profile card ──────────────── */}
            <div style={{ position: "relative" }}>
              {/* Ambient glow behind card */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "2rem",
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(26,25,23,0.06) 0%, transparent 70%)",
                  filter: "blur(24px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: "1.75rem",
                  border: `1px solid ${C.line}`,
                  background: C.glassDeep,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  padding: "2rem",
                }}
              >
                {/* Avatar + identity */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{ position: "relative", marginBottom: "1.5rem" }}
                  >
                    {/* Subtle halo */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: "-0.5rem",
                        borderRadius: "50%",
                        background: "rgba(26,25,23,0.05)",
                        filter: "blur(16px)",
                      }}
                    />
                    <img
                      src="/about/avatar.jpg"
                      alt="Alexandre Haineaux"
                      width={128}
                      height={128}
                      style={{
                        position: "relative",
                        width: "8rem",
                        height: "8rem",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `1px solid ${C.line}`,
                        boxShadow: "0 16px 48px rgba(26,25,23,0.10)",
                        filter: "grayscale(12%)",
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.18 }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.625rem",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        color: C.ink,
                        margin: "0 0 0.3rem",
                      }}
                    >
                      Alexandre Haineaux
                    </h3>
                    <p
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: C.inkMuted,
                        margin: 0,
                      }}
                    >
                      Graphic Designer · 3D Artist · Photographer
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.28 }}
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.875rem",
                      lineHeight: 1.7,
                      color: C.inkSoft,
                      maxWidth: "32ch",
                    }}
                  >
                    Working between the still image and the rendered form.
                    Luxembourg · Worldwide.
                  </motion.p>
                </div>

                {/* Social links */}
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  style={{
                    marginTop: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        variants={itemVariants}
                        href={social.href}
                        target={social.href.startsWith("http") ? "_blank" : undefined}
                        rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderRadius: "0.875rem",
                          border: `1px solid ${C.line}`,
                          background: C.glassMid,
                          padding: "0.75rem 1rem",
                          textDecoration: "none",
                          transition: "border-color 0.25s, box-shadow 0.25s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(26,25,23,0.16)";
                          e.currentTarget.style.boxShadow = C.shadowSm;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = C.line;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span
                            style={{
                              display: "flex",
                              width: "2.25rem",
                              height: "2.25rem",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              border: `1px solid ${C.line}`,
                              background: C.paper,
                              color: C.inkSoft,
                              boxShadow: "0 2px 8px rgba(26,25,23,0.06)",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={14} />
                          </span>
                          <div>
                            <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: C.ink, margin: 0, lineHeight: 1.3 }}>
                              {social.label}
                            </p>
                            <p style={{ fontSize: "0.6875rem", color: C.inkMuted, margin: 0, lineHeight: 1.4 }}>
                              {social.handle}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={14}
                          style={{ color: C.inkMuted, flexShrink: 0, transition: "transform 0.25s, color 0.25s" }}
                        />
                      </motion.a>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProfileBlock;
