"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/#recommendations", label: "Rekomendasi" },
    { href: "/check", label: "Cek Saham" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.4s ease",
        background: scrolled
          ? "rgba(7,7,13,0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(28,28,46,0.8)" : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "linear-gradient(135deg, #d4a843, #c47d0a)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#0a0800", fontSize: "16px", fontWeight: "700" }}>E</span>
              </div>
              <span style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "4px",
                color: "#e4e4f0",
              }}>
                EQUINOX
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: "flex", gap: "40px", alignItems: "center" }}
               className="hidden-mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "13px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: pathname === l.href ? "#d4a843" : "#6b6b8a",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  fontWeight: "500",
                }}>
                {l.label}
              </Link>
            ))}
            <Link href="/check">
              <button style={{
                background: "linear-gradient(135deg, #d4a843, #c47d0a)",
                color: "#0a0800",
                border: "none",
                padding: "8px 20px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={e => e.target.style.opacity = "0.85"}
              onMouseOut={e => e.target.style.opacity = "1"}>
                Analisis Sekarang
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="show-mobile"
            style={{
              background: "transparent",
              border: "1px solid #1c1c2e",
              borderRadius: "6px",
              padding: "8px",
              cursor: "pointer",
              color: "#e4e4f0",
              display: "none",
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            padding: "16px 0 20px",
            borderTop: "1px solid #1c1c2e",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "14px",
                  color: pathname === l.href ? "#d4a843" : "#9b9bb0",
                  textDecoration: "none",
                }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
