import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#07070d",
      borderTop: "1px solid #1c1c2e",
      padding: "48px 24px 32px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, #d4a843, #c47d0a)",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#0a0800", fontSize: "14px", fontWeight: "700" }}>E</span>
              </div>
              <span style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "18px",
                fontWeight: "600",
                letterSpacing: "4px",
                color: "#e4e4f0",
              }}>EQUINOX</span>
            </div>
            <p style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "13px", lineHeight: "1.7", maxWidth: "240px" }}>
              Platform analisis saham berbasis fundamental untuk investor cerdas Indonesia.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontFamily: "DM Sans, sans-serif", color: "#d4a843", fontSize: "11px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
              Navigasi
            </p>
            {[
              { href: "/", label: "Beranda" },
              { href: "/#recommendations", label: "Rekomendasi" },
              { href: "/check", label: "Cek Saham" },
            ].map((l) => (
              <div key={l.href} style={{ marginBottom: "10px" }}>
                <Link href={l.href} style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => e.target.style.color = "#e4e4f0"}
                  onMouseOut={e => e.target.style.color = "#6b6b8a"}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div>
            <p style={{ fontFamily: "DM Sans, sans-serif", color: "#d4a843", fontSize: "11px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
              Disclaimer
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "12px", lineHeight: "1.7" }}>
              Konten ini bukan saran investasi. Lakukan riset mandiri sebelum berinvestasi. Investasi di pasar saham mengandung risiko.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1c1c2e, transparent)", marginBottom: "24px" }} />

        {/* Bottom */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ fontFamily: "Space Mono, monospace", color: "#6b6b8a", fontSize: "11px", letterSpacing: "1px" }}>
            © {new Date().getFullYear()} EQUINOX. All rights reserved.
          </p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", color: "#d4a843", fontSize: "14px", fontStyle: "italic", letterSpacing: "1px" }}>
            crafted by <span style={{ fontWeight: "600", fontStyle: "normal" }}>Amran</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
