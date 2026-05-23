"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FEATURED_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com", sector: "E-Commerce" },
  { symbol: "META", name: "Meta Platforms", sector: "Social Media" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Conglomerate" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Banking" },
  { symbol: "V", name: "Visa Inc.", sector: "Fintech" },
];

const STATS = [
  { value: "5,000+", label: "US Stocks Tracked" },
  { value: "Real-Time", label: "Live Price Data" },
  { value: "3", label: "Valuation Methods" },
  { value: "Free", label: "No Cost Forever" },
];

function formatPrice(p) {
  if (!p) return "—";
  return "$" + parseFloat(p).toFixed(2);
}
function formatChange(c, cp) {
  if (c == null) return null;
  const sign = c >= 0 ? "+" : "";
  return { text: `${sign}${parseFloat(c).toFixed(2)} (${sign}${parseFloat(cp).toFixed(2)}%)`, positive: c >= 0 };
}

function StockCard({ symbol, name, sector }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stock?symbol=${symbol}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [symbol]);

  const change = data ? formatChange(data.change, data.changePercent) : null;

  return (
    <div style={{
      background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "12px",
      padding: "20px 24px", display: "flex", justifyContent: "space-between",
      alignItems: "center", transition: "all 0.3s ease", cursor: "default",
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor = "#8a6e2a"; e.currentTarget.style.background = "#161625"; }}
    onMouseOut={e => { e.currentTarget.style.borderColor = "#1c1c2e"; e.currentTarget.style.background = "#13131f"; }}>
      <div>
        <div style={{ fontFamily: "Space Mono, monospace", color: "#d4a843", fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>{symbol}</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "11px" }}>{sector}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {loading ? (
          <div style={{ fontFamily: "Space Mono, monospace", color: "#6b6b8a", fontSize: "13px" }}>Loading...</div>
        ) : (
          <>
            <div style={{ fontFamily: "Space Mono, monospace", color: "#e4e4f0", fontSize: "15px", fontWeight: "700" }}>
              {formatPrice(data?.currentPrice)}
            </div>
            {change && (
              <div style={{ fontFamily: "Space Mono, monospace", color: change.positive ? "#10b981" : "#ef4444", fontSize: "11px", marginTop: "2px" }}>
                {change.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#07070d", overflowX: "hidden" }}>
      <Navbar />

      {}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: "80px",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(212,168,67,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "600px",
          background: "radial-gradient(ellipse at center, rgba(212,168,67,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div className="animate-fade-up" style={{
            marginBottom: "32px", display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)",
            borderRadius: "100px", padding: "6px 16px",
          }}>
            <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "DM Sans, sans-serif", color: "#d4a843", fontSize: "12px", fontWeight: "500", letterSpacing: "1px" }}>
              Live US Stock Analysis — Real-Time Data
            </span>
          </div>

          <h1 className="animate-fade-up delay-100" style={{
            fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(48px, 8vw, 100px)",
            fontWeight: "300", lineHeight: "1.05", color: "#e4e4f0", marginBottom: "8px", letterSpacing: "-1px",
          }}>
            Invest Smarter
          </h1>
          <h1 className="animate-fade-up delay-200" style={{
            fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(48px, 8vw, 100px)",
            fontWeight: "600", lineHeight: "1.05",
            background: "linear-gradient(135deg, #f0c96a 0%, #d4a843 50%, #c47d0a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: "32px", letterSpacing: "-1px",
          }}>
            in US Markets
          </h1>

          <p className="animate-fade-up delay-300" style={{
            fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px, 2vw, 18px)",
            color: "#6b6b8a", maxWidth: "560px", lineHeight: "1.8", marginBottom: "48px",
          }}>
            Enter any US stock ticker. Get real-time price, fundamental analysis,
            fair value calculation (Graham Number, P/E, Book Value), and a buy/hold/sell verdict — instantly.
          </p>

          <div className="animate-fade-up delay-400" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/check">
              <button
                style={{
                  background: "linear-gradient(135deg, #d4a843, #c47d0a)", color: "#0a0800",
                  border: "none", padding: "14px 32px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.3s ease",
                  boxShadow: "0 8px 30px rgba(212,168,67,0.25)",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,168,67,0.4)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(212,168,67,0.25)"; }}
              >
                ⚡ Analyze a Stock
              </button>
            </Link>
            <Link href="#watchlist">
              <button
                style={{
                  background: "transparent", color: "#e4e4f0", border: "1px solid #1c1c2e",
                  padding: "14px 32px", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
                  letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif", transition: "all 0.3s ease",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#d4a843"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#1c1c2e"; e.currentTarget.style.color = "#e4e4f0"; }}
              >
                Live Prices →
              </button>
            </Link>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          animation: "float 3s ease-in-out infinite",
        }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(#6b6b8a, transparent)" }} />
        </div>
      </section>

      {}
      <section style={{ padding: "80px 24px", background: "#0e0e18" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", border: "1px solid #1c1c2e", borderRadius: "16px", overflow: "hidden",
          }}>
            {STATS.map((s, i) => (
              <div key={i}
                style={{
                  padding: "40px 32px", background: "#13131f",
                  borderRight: i < STATS.length - 1 ? "1px solid #1c1c2e" : "none",
                  textAlign: "center", transition: "background 0.3s",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#161625"}
                onMouseOut={e => e.currentTarget.style.background = "#13131f"}
              >
                <div style={{
                  fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "600",
                  background: "linear-gradient(135deg, #f0c96a, #d4a843)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px",
                }}>{s.value}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section id="watchlist" style={{ padding: "100px 24px", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(212,168,67,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontFamily: "DM Sans, sans-serif", color: "#d4a843", fontSize: "11px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
                Live Data
              </p>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "500", color: "#e4e4f0", lineHeight: "1.1" }}>
                Top US Stocks
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px #10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", color: "#10b981", fontSize: "12px", letterSpacing: "1px" }}>LIVE PRICES</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {FEATURED_STOCKS.map((s) => (
              <StockCard key={s.symbol} {...s} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/check">
              <button
                style={{
                  background: "transparent", border: "1px solid #d4a843", color: "#d4a843",
                  padding: "12px 32px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                  letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif", transition: "all 0.3s ease",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#d4a843"; e.currentTarget.style.color = "#0a0800"; }}
                onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4a843"; }}
              >
                Analyze Any Stock →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: "100px 24px", background: "#0e0e18" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", color: "#d4a843", fontSize: "11px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>How It Works</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: "500", color: "#e4e4f0", lineHeight: "1.1" }}>
              Analysis in 3 Steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "01", icon: "🔍", title: "Enter Ticker", desc: "Type any US stock symbol (AAPL, MSFT, NVDA...). Real-time price and fundamentals are fetched automatically from live market data." },
              { step: "02", icon: "⚙️", title: "Auto Calculation", desc: "System computes Graham Number, P/E Fair Value, and Book Value method. Each metric is scored and weighted." },
              { step: "03", icon: "🎯", title: "Get Verdict", desc: "Receive a 0–100 score, Fair Value range, Margin of Safety, and a Strong Buy / Buy / Hold / Sell rating with full breakdown." },
            ].map((item, i) => (
              <div key={i}
                style={{
                  background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "16px",
                  padding: "40px 32px", position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#8a6e2a"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#1c1c2e"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  position: "absolute", top: "16px", right: "20px",
                  fontFamily: "Cormorant Garamond, serif", fontSize: "72px",
                  fontWeight: "700", color: "rgba(212,168,67,0.06)", lineHeight: 1,
                }}>{item.step}</div>
                <div style={{ fontSize: "32px", marginBottom: "20px" }}>{item.icon}</div>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: "600", color: "#e4e4f0", marginBottom: "12px" }}>{item.title}</h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "14px", lineHeight: "1.7" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 70%)",
        }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "300", color: "#e4e4f0", lineHeight: "1.1", marginBottom: "16px",
          }}>
            Is{" "}
            <em style={{ background: "linear-gradient(135deg, #f0c96a, #d4a843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              your stock
            </em>
            {" "}worth buying?
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: "#6b6b8a", fontSize: "15px", marginBottom: "40px", lineHeight: "1.8" }}>
            Enter any ticker. Get real-time price, fair value, and a data-driven recommendation in seconds.
          </p>
          <Link href="/check">
            <button
              style={{
                background: "linear-gradient(135deg, #d4a843, #c47d0a)", color: "#0a0800",
                border: "none", padding: "16px 48px", borderRadius: "8px", fontSize: "14px",
                fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", transition: "all 0.3s ease",
                boxShadow: "0 8px 40px rgba(212,168,67,0.3)",
              }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 50px rgba(212,168,67,0.4)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,168,67,0.3)"; }}
            >
              Start Free Analysis
            </button>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.7s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </main>
  );
}
