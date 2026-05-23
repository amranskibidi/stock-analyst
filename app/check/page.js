"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function analyzeStock(data) {
  const price  = parseFloat(data.currentPrice) || 0;
  const eps    = parseFloat(data.eps) || 0;
  const bvps   = parseFloat(data.bvps) || 0;
  const pe     = parseFloat(data.peRatio) || 0;
  const pbv    = parseFloat(data.pbvRatio) || 0;
  const roe    = parseFloat(data.roe) || 0;
  const der    = parseFloat(data.der) || 0;
  const revG   = parseFloat(data.revenueGrowth) || 0;
  const divY   = parseFloat(data.dividendYield) || 0;
  const margin = parseFloat(data.netMargin) || 0;
  const w52h   = parseFloat(data.week52High) || 0;
  const w52l   = parseFloat(data.week52Low) || 0;
  const beta   = parseFloat(data.beta) || 1;

  const grahamNumber = eps > 0 && bvps > 0 ? Math.sqrt(22.5 * eps * bvps) : null;
  const peFair       = eps > 0 ? eps * 15 : null;
  const bookFair     = bvps > 0 ? bvps * (roe > 20 ? 2.5 : roe > 12 ? 1.8 : 1.2) : null;
  const fvVals       = [grahamNumber, peFair, bookFair].filter(v => v && v > 0);
  const avgFV        = fvVals.length ? fvVals.reduce((a, b) => a + b, 0) / fvVals.length : null;
  const mos          = avgFV && price ? ((avgFV - price) / avgFV) * 100 : null;

  let score = 0;
  const breakdown = [];
  if (pbv > 0) {
    const s = pbv < 1 ? 25 : pbv < 1.5 ? 20 : pbv < 2.5 ? 14 : pbv < 4 ? 8 : 3;
    const st = pbv < 1 ? "Very Cheap" : pbv < 1.5 ? "Cheap" : pbv < 2.5 ? "Fair" : pbv < 4 ? "Expensive" : "Very Expensive";
    breakdown.push({ label: "PBV Ratio", value: `${pbv.toFixed(2)}x`, score: s, max: 25, status: st });
    score += s;
  }
  if (pe > 0) {
    const s = pe < 10 ? 25 : pe < 18 ? 20 : pe < 25 ? 13 : pe < 35 ? 7 : 2;
    const st = pe < 10 ? "Deep Value" : pe < 18 ? "Undervalued" : pe < 25 ? "Fair" : pe < 35 ? "Overvalued" : "Very Overvalued";
    breakdown.push({ label: "P/E Ratio", value: `${pe.toFixed(2)}x`, score: s, max: 25, status: st });
    score += s;
  }
  if (roe > 0) {
    const s = roe >= 25 ? 25 : roe >= 18 ? 20 : roe >= 12 ? 14 : roe >= 7 ? 7 : 3;
    const st = roe >= 25 ? "Excellent" : roe >= 18 ? "Strong" : roe >= 12 ? "Decent" : roe >= 7 ? "Weak" : "Very Weak";
    breakdown.push({ label: "ROE", value: `${roe.toFixed(1)}%`, score: s, max: 25, status: st });
    score += s;
  }
  if (der >= 0) {
    const s = der < 0.3 ? 25 : der < 0.8 ? 20 : der < 1.5 ? 12 : der < 2.5 ? 5 : 1;
    const st = der < 0.3 ? "Very Safe" : der < 0.8 ? "Safe" : der < 1.5 ? "Moderate" : der < 2.5 ? "Risky" : "Very Risky";
    breakdown.push({ label: "Debt/Equity", value: `${der.toFixed(2)}x`, score: s, max: 25, status: st });
    score += s;
  }
  if (revG > 10)   score = Math.min(100, score + 4);
  if (revG > 20)   score = Math.min(100, score + 3);
  if (divY > 2)    score = Math.min(100, score + 3);
  if (margin > 20) score = Math.min(100, score + 5);

  const maxPossible = breakdown.reduce((a, b) => a + b.max, 0) || 100;
  const finalScore  = Math.min(100, Math.round((score / maxPossible) * 100));

  let rating, ratingColor, ratingBg, ratingEmoji;
  if (finalScore >= 80)      { rating = "STRONG BUY";  ratingColor = "#10b981"; ratingBg = "rgba(16,185,129,0.1)";  ratingEmoji = "🚀"; }
  else if (finalScore >= 63) { rating = "BUY";         ratingColor = "#22c55e"; ratingBg = "rgba(34,197,94,0.1)";   ratingEmoji = "✅"; }
  else if (finalScore >= 44) { rating = "HOLD";        ratingColor = "#f59e0b"; ratingBg = "rgba(245,158,11,0.1)";  ratingEmoji = "⏸️"; }
  else if (finalScore >= 26) { rating = "SELL";        ratingColor = "#ef4444"; ratingBg = "rgba(239,68,68,0.1)";   ratingEmoji = "⚠️"; }
  else                       { rating = "STRONG SELL"; ratingColor = "#dc2626"; ratingBg = "rgba(220,38,38,0.1)";   ratingEmoji = "🔴"; }

  const now        = new Date();
  const dayOfWeek  = now.getDay();
  const hour       = now.getUTCHours();
  const estHour    = (hour - 5 + 24) % 24;
  const isWeekend  = dayOfWeek === 0 || dayOfWeek === 6;
  const isMarketOpen = !isWeekend && estHour >= 9 && estHour < 16;

  const priceRange   = w52h - w52l;
  const pricePos     = priceRange > 0 ? ((price - w52l) / priceRange) * 100 : 50;
  const nearLow      = pricePos < 25;
  const nearHigh     = pricePos > 75;
  const midRange     = pricePos >= 25 && pricePos <= 75;

  const support1     = w52l   > 0 ? w52l * 1.02             : price * 0.92;
  const support2     = w52l   > 0 ? w52l + priceRange * 0.25 : price * 0.85;
  const resistance1  = avgFV  > 0 ? avgFV                   : price * 1.10;
  const resistance2  = w52h   > 0 ? w52h                    : price * 1.20;

  const buyZoneLow   = avgFV  > 0 ? Math.min(avgFV * 0.85, price * 0.90) : price * 0.90;
  const buyZoneHigh  = avgFV  > 0 ? avgFV * 0.95                         : price * 0.98;

  const bestBuyDays  = ["Monday", "Tuesday", "Wednesday"];
  const bestSellDays = ["Thursday", "Friday"];
  const dayNames     = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const buyWindows = [
    { time: "9:30 – 10:30 AM EST", label: "Market Open", reason: "High liquidity, price discovery. Ideal for limit orders near support." },
    { time: "3:00 – 3:30 PM EST", label: "Pre-Close Dip", reason: "Institutional rebalancing often creates brief dips. Watch for volume surge." },
  ];
  const sellWindows = [
    { time: "11:00 AM – 1:00 PM EST", label: "Mid-Day Peak", reason: "Price often peaks mid-session. Good for taking partial profits." },
    { time: "3:45 – 4:00 PM EST", label: "Close Surge", reason: "Momentum stocks often push higher into close. Trail stop recommended." },
  ];

  let timingVerdict, timingColor, timingEmoji;
  if (isWeekend) {
    timingVerdict = "Market Closed — Weekend. Place watchlist orders for Monday open.";
    timingColor   = "#6b6b8a"; timingEmoji = "📅";
  } else if (!isMarketOpen) {
    timingVerdict = "Market Closed — US market opens 9:30 AM EST (Mon–Fri).";
    timingColor   = "#6b6b8a"; timingEmoji = "🔒";
  } else if (estHour >= 9 && estHour < 10) {
    timingVerdict = "Market just opened — High volatility. Use limit orders only.";
    timingColor   = "#f59e0b"; timingEmoji = "⚡";
  } else if (estHour >= 10 && estHour < 12) {
    timingVerdict = "Prime buy window — Liquidity is high. Good time to enter positions.";
    timingColor   = "#10b981"; timingEmoji = "✅";
  } else if (estHour >= 12 && estHour < 14) {
    timingVerdict = "Lunch slowdown — Lower volume, wider spreads. Avoid large orders.";
    timingColor   = "#f59e0b"; timingEmoji = "😴";
  } else if (estHour >= 14 && estHour < 15) {
    timingVerdict = "Afternoon momentum — Trend continuation likely. Watch breakout levels.";
    timingColor   = "#38bdf8"; timingEmoji = "📈";
  } else {
    timingVerdict = "Power hour (3–4 PM EST) — High volume close. Best for momentum entries/exits.";
    timingColor   = "#d4a843"; timingEmoji = "🔥";
  }

  const weeklyBuySignal  = dayOfWeek === 1 || dayOfWeek === 2;
  const weeklySellSignal = dayOfWeek === 4 || dayOfWeek === 5;

  const month = now.getMonth();
  const seasonalNote =
    month === 0  ? "January Effect — Small caps tend to rally in January." :
    month === 3  ? "April — Tax refunds often flow into markets, bullish bias." :
    month === 9  ? "October — Historically volatile. Buy dips of quality stocks." :
    month === 10 ? "November — Pre-holiday rally often begins. Bullish seasonality." :
    month === 11 ? "December — Santa Rally expected. Hold winners into year-end." :
    "No strong seasonal signal this month. Trade based on fundamentals.";

  return {
    score: finalScore, rating, ratingColor, ratingBg, ratingEmoji,
    verdict: {
      "STRONG BUY":  "Strong fundamentals with compelling valuation. Rare opportunity.",
      "BUY":         "Solid fundamentals with reasonable valuation. Worth adding.",
      "HOLD":        "Fairly valued. Hold if you own it; wait for better entry if not.",
      "SELL":        "Valuation stretched vs fundamentals. Consider reducing position.",
      "STRONG SELL": "Weak fundamentals, high valuation. Significant downside risk.",
    }[rating],
    breakdown,
    grahamNumber:   grahamNumber ? grahamNumber.toFixed(2) : null,
    peFairValue:    peFair       ? peFair.toFixed(2)       : null,
    bookFairValue:  bookFair     ? bookFair.toFixed(2)     : null,
    avgFairValue:   avgFV        ? avgFV.toFixed(2)        : null,
    marginOfSafety: mos          ? mos.toFixed(1)          : null,
    isUndervalued:  mos !== null ? mos > 0                 : null,
    timing: {
      isMarketOpen, isWeekend, estHour,
      timingVerdict, timingColor, timingEmoji,
      pricePos: pricePos.toFixed(1),
      nearLow, nearHigh, midRange,
      support1:    support1.toFixed(2),
      support2:    support2.toFixed(2),
      resistance1: resistance1.toFixed(2),
      resistance2: resistance2.toFixed(2),
      buyZoneLow:  buyZoneLow.toFixed(2),
      buyZoneHigh: buyZoneHigh.toFixed(2),
      buyWindows,
      sellWindows,
      weeklyBuySignal, weeklySellSignal,
      currentDay: dayNames[dayOfWeek],
      bestBuyDays, bestSellDays,
      seasonalNote,
      beta: beta.toFixed(2),
    },
  };
}

function ScoreArc({ score, color }) {
  const r = 80, circ = 2 * Math.PI * r;
  const dash = (score / 100) * (circ * 0.75);
  return (
    <svg width="200" height="145" viewBox="0 0 200 145">
      <circle cx="100" cy="115" r={r} fill="none" stroke="#1c1c2e" strokeWidth="10"
        strokeDasharray={`${circ*0.75} ${circ}`} strokeDashoffset={circ*0.125} strokeLinecap="round"/>
      <circle cx="100" cy="115" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ*0.125} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)", filter:`drop-shadow(0 0 10px ${color}70)`}}/>
      <text x="100" y="100" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="44" fontWeight="600" fill={color}>{score}</text>
      <text x="100" y="122" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#6b6b8a" letterSpacing="2">SCORE</text>
    </svg>
  );
}

function MetricRow({ label, value, autoValue, onChange, hint }) {
  const hasAuto = autoValue !== null && autoValue !== undefined;
  const isEmpty = value === "";
  return (
    <div>
      <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"11px",fontWeight:"600",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"8px"}}>
        <span>{label}</span>
        {hint && <span style={{color:"#6b6b8a",fontWeight:"400",letterSpacing:"0",textTransform:"none",fontSize:"10px"}}>{hint}</span>}
      </label>
      <div style={{position:"relative"}}>
        <input type="number" value={value} onChange={e=>onChange(e.target.value)}
          placeholder={hasAuto ? String(autoValue) : "—"}
          style={{width:"100%",padding:"11px 16px",background:hasAuto&&isEmpty?"rgba(212,168,67,0.04)":"rgba(255,255,255,0.03)",border:`1px solid ${hasAuto&&isEmpty?"rgba(212,168,67,0.25)":"#1c1c2e"}`,borderRadius:"8px",color:"#e4e4f0",fontFamily:"Space Mono,monospace",fontSize:"13px",outline:"none",transition:"all 0.2s ease"}}
          onFocus={e=>{e.target.style.borderColor="#8a6e2a";e.target.style.boxShadow="0 0 0 3px rgba(212,168,67,0.08)";}}
          onBlur={e=>{e.target.style.borderColor=hasAuto&&isEmpty?"rgba(212,168,67,0.25)":"#1c1c2e";e.target.style.boxShadow="none";}}
        />
        {hasAuto && isEmpty && (
          <span style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"9px",fontWeight:"600",letterSpacing:"1px",background:"rgba(212,168,67,0.1)",padding:"2px 6px",borderRadius:"4px"}}>AUTO</span>
        )}
      </div>
    </div>
  );
}

function TimingPanel({ timing, ticker }) {
  const [tab, setTab] = useState("now");
  const tabs = [
    { id: "now",     label: "Now" },
    { id: "daily",   label: "Daily Windows" },
    { id: "weekly",  label: "Weekly" },
    { id: "levels",  label: "Price Levels" },
  ];

  return (
    <div style={{background:"#0e0e18",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"20px",overflow:"hidden",marginBottom:"20px"}}>
      {}
      <div style={{padding:"24px 28px",background:"linear-gradient(135deg,rgba(56,189,248,0.06) 0%,rgba(212,168,67,0.04) 100%)",borderBottom:"1px solid #1c1c2e",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
            <span style={{fontSize:"20px"}}>⏰</span>
            <div style={{fontFamily:"DM Sans,sans-serif",color:"#38bdf8",fontSize:"11px",fontWeight:"600",letterSpacing:"2px",textTransform:"uppercase"}}>Spot Trading — Time to Buy / Sell</div>
          </div>
          <div style={{fontFamily:"Cormorant Garamond,serif",color:"#e4e4f0",fontSize:"22px",fontWeight:"600"}}>
            Market Timing Analysis for {ticker}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",background:timing.isMarketOpen?"rgba(16,185,129,0.1)":"rgba(107,107,138,0.1)",border:`1px solid ${timing.isMarketOpen?"rgba(16,185,129,0.3)":"rgba(107,107,138,0.3)"}`,borderRadius:"100px",padding:"6px 14px"}}>
          <span style={{width:"8px",height:"8px",borderRadius:"50%",background:timing.isMarketOpen?"#10b981":"#6b6b8a",boxShadow:timing.isMarketOpen?"0 0 8px #10b981":"none",display:"inline-block",animation:timing.isMarketOpen?"pulse 2s infinite":"none"}}/>
          <span style={{fontFamily:"DM Sans,sans-serif",color:timing.isMarketOpen?"#10b981":"#6b6b8a",fontSize:"12px",fontWeight:"600"}}>
            {timing.isMarketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
          </span>
        </div>
      </div>

      {}
      <div style={{display:"flex",borderBottom:"1px solid #1c1c2e",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 22px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #38bdf8":"2px solid transparent",color:tab===t.id?"#38bdf8":"#6b6b8a",fontFamily:"DM Sans,sans-serif",fontSize:"12px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"24px 28px"}}>

        {}
        {tab==="now" && (
          <div>
            {}
            <div style={{background:`rgba(56,189,248,0.06)`,border:"1px solid rgba(56,189,248,0.2)",borderRadius:"12px",padding:"20px 24px",marginBottom:"20px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"14px"}}>
                <span style={{fontSize:"32px"}}>{timing.timingEmoji}</span>
                <div>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#38bdf8",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>Current Market Status</div>
                  <p style={{fontFamily:"DM Sans,sans-serif",color:"#e4e4f0",fontSize:"15px",lineHeight:"1.6",margin:0,fontWeight:"500"}}>{timing.timingVerdict}</p>
                </div>
              </div>
            </div>

            {}
            <div style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"12px",padding:"20px 24px",marginBottom:"16px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"12px"}}>
                52-Week Price Position
              </div>
              <div style={{position:"relative",height:"32px",background:"#0e0e18",borderRadius:"8px",overflow:"hidden",marginBottom:"8px"}}>
                {}
                <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)",opacity:0.15}}/>
                {}
                <div style={{position:"absolute",top:0,bottom:0,left:"0%",width:"25%",background:"rgba(16,185,129,0.2)",borderRight:"1px dashed rgba(16,185,129,0.4)"}}/>
                {}
                <div style={{position:"absolute",top:0,bottom:0,left:`${Math.min(96,Math.max(2,parseFloat(timing.pricePos)))}%`,width:"3px",background:"#38bdf8",boxShadow:"0 0 10px #38bdf8",borderRadius:"2px"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
                <span style={{fontFamily:"Space Mono,monospace",color:"#10b981",fontSize:"10px"}}>52W Low (Buy Zone)</span>
                <span style={{fontFamily:"Space Mono,monospace",color:"#38bdf8",fontSize:"10px"}}>Current: {timing.pricePos}%</span>
                <span style={{fontFamily:"Space Mono,monospace",color:"#ef4444",fontSize:"10px"}}>52W High</span>
              </div>
              <div style={{padding:"12px 16px",borderRadius:"8px",background:timing.nearLow?"rgba(16,185,129,0.08)":timing.nearHigh?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${timing.nearLow?"rgba(16,185,129,0.25)":timing.nearHigh?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`}}>
                <span style={{fontFamily:"DM Sans,sans-serif",color:timing.nearLow?"#10b981":timing.nearHigh?"#ef4444":"#f59e0b",fontSize:"13px",fontWeight:"600"}}>
                  {timing.nearLow  ? "🟢 Near 52-week low — Historically favorable buy zone" :
                   timing.nearHigh ? "🔴 Near 52-week high — Exercise caution, risk of pullback" :
                                     "🟡 Mid-range — Wait for a dip toward support or breakout above resistance"}
                </span>
              </div>
            </div>

            {}
            <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:"10px",padding:"14px 18px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>📅 Seasonal Pattern</div>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",margin:0}}>{timing.seasonalNote}</p>
            </div>
          </div>
        )}

        {}
        {tab==="daily" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
              {}
              <div>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#10b981",fontSize:"11px",fontWeight:"600",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"14px"}}>🟢 Best Times to BUY (Spot)</div>
                {timing.buyWindows.map((w,i)=>(
                  <div key={i} style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"12px",padding:"16px 20px",marginBottom:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                      <span style={{fontFamily:"Space Mono,monospace",color:"#10b981",fontSize:"13px",fontWeight:"700"}}>{w.time}</span>
                      <span style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",fontSize:"10px",fontWeight:"600",padding:"3px 10px",borderRadius:"100px",fontFamily:"DM Sans,sans-serif"}}>{w.label}</span>
                    </div>
                    <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px",lineHeight:"1.6",margin:0}}>{w.reason}</p>
                  </div>
                ))}
              </div>
              {}
              <div>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"11px",fontWeight:"600",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"14px"}}>🔴 Best Times to SELL (Spot)</div>
                {timing.sellWindows.map((w,i)=>(
                  <div key={i} style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"12px",padding:"16px 20px",marginBottom:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                      <span style={{fontFamily:"Space Mono,monospace",color:"#ef4444",fontSize:"13px",fontWeight:"700"}}>{w.time}</span>
                      <span style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:"10px",fontWeight:"600",padding:"3px 10px",borderRadius:"100px",fontFamily:"DM Sans,sans-serif"}}>{w.label}</span>
                    </div>
                    <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px",lineHeight:"1.6",margin:0}}>{w.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div style={{marginTop:"16px",background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.15)",borderRadius:"10px",padding:"14px 18px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>
                Beta: {timing.beta} — Volatility Note
              </div>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px",lineHeight:"1.7",margin:0}}>
                {parseFloat(timing.beta) > 1.5
                  ? "High beta stock. Moves more than the market — use smaller position size and tighter stop loss."
                  : parseFloat(timing.beta) > 1
                  ? "Moderately volatile. Follows market trend but amplified. Set stop loss at -7% to -10%."
                  : parseFloat(timing.beta) < 0.5
                  ? "Low volatility / defensive stock. Suitable for conservative investors. Wider stop loss acceptable."
                  : "Near market beta. Moves roughly in line with S&P 500. Standard position sizing applies."}
              </p>
            </div>
          </div>
        )}

        {}
        {tab==="weekly" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"10px",marginBottom:"20px"}}>
              {["Mon","Tue","Wed","Thu","Fri"].map((day,i)=>{
                const d = i + 1;
                const isBuy  = d === 1 || d === 2;
                const isSell = d === 4 || d === 5;
                const isCurrent = d === new Date().getDay();
                return (
                  <div key={day} style={{textAlign:"center",background:isCurrent?"rgba(56,189,248,0.08)":isBuy?"rgba(16,185,129,0.06)":isSell?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.02)",border:`1px solid ${isCurrent?"rgba(56,189,248,0.4)":isBuy?"rgba(16,185,129,0.2)":isSell?"rgba(239,68,68,0.2)":"#1c1c2e"}`,borderRadius:"12px",padding:"20px 12px"}}>
                    <div style={{fontFamily:"DM Sans,sans-serif",color:isCurrent?"#38bdf8":isBuy?"#10b981":isSell?"#ef4444":"#6b6b8a",fontSize:"12px",fontWeight:"600",letterSpacing:"1px",marginBottom:"10px"}}>{day}</div>
                    <div style={{fontSize:"20px",marginBottom:"8px"}}>{isBuy?"🟢":isSell?"🔴":"⚪"}</div>
                    <div style={{fontFamily:"DM Sans,sans-serif",color:isCurrent?"#38bdf8":isBuy?"#10b981":isSell?"#ef4444":"#6b6b8a",fontSize:"10px",fontWeight:"600"}}>
                      {isBuy?"BUY":isSell?"SELL":"NEUTRAL"}
                    </div>
                    {isCurrent && <div style={{fontFamily:"DM Sans,sans-serif",color:"#38bdf8",fontSize:"9px",marginTop:"4px"}}>TODAY</div>}
                  </div>
                );
              })}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"14px"}}>
              <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"12px",padding:"18px 20px"}}>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#10b981",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Why Monday–Tuesday?</div>
                <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px",lineHeight:"1.7",margin:0}}>
                  Stocks often dip Monday from weekend news digestion. Tuesday sees accumulation as institutional buyers re-enter. Historically the lowest average prices of the week.
                </p>
              </div>
              <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"12px",padding:"18px 20px"}}>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Why Thursday–Friday?</div>
                <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px",lineHeight:"1.7",margin:0}}>
                  Mid-to-late week often sees profit-taking by short-term traders. Friday sees portfolio rebalancing before the weekend. Prices tend to peak Thursday–Friday.
                </p>
              </div>
              <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:"12px",padding:"18px 20px"}}>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Today's Signal</div>
                <p style={{fontFamily:"DM Sans,sans-serif",color:timing.weeklyBuySignal?"#10b981":timing.weeklySellSignal?"#ef4444":"#9b9bb0",fontSize:"13px",lineHeight:"1.6",margin:0,fontWeight:"600"}}>
                  {timing.weeklyBuySignal  ? `✅ ${timing.currentDay} — Favorable buy day. Consider entering positions.` :
                   timing.weeklySellSignal ? `⚠️ ${timing.currentDay} — Consider taking profits or tightening stops.` :
                   timing.isWeekend        ? `📅 Weekend — Market closed. Prepare orders for Monday.` :
                                            `🟡 ${timing.currentDay} — Neutral day. Hold current positions.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE LEVELS TAB */}
        {tab==="levels" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"20px"}}>
              {[
                {label:"Support 1",    value:`$${timing.support1}`,    color:"#10b981", sub:"Strong buy zone"},
                {label:"Support 2",    value:`$${timing.support2}`,    color:"#22c55e", sub:"Secondary support"},
                {label:"Buy Zone Low", value:`$${timing.buyZoneLow}`,  color:"#38bdf8", sub:"Ideal entry low"},
                {label:"Buy Zone High",value:`$${timing.buyZoneHigh}`, color:"#38bdf8", sub:"Ideal entry high"},
                {label:"Resistance 1", value:`$${timing.resistance1}`, color:"#f59e0b", sub:"First take profit"},
                {label:"Resistance 2", value:`$${timing.resistance2}`, color:"#ef4444", sub:"52W high / max target"},
              ].map((item,i)=>(
                <div key={i} style={{background:"#13131f",border:`1px solid ${item.color}20`,borderRadius:"12px",padding:"18px",textAlign:"center"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"8px"}}>{item.label}</div>
                  <div style={{fontFamily:"Space Mono,monospace",color:item.color,fontSize:"18px",fontWeight:"700",marginBottom:"4px"}}>{item.value}</div>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px"}}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Visual price map */}
            <div style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"12px",padding:"20px 24px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"14px"}}>Spot Entry/Exit Map</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {[
                  {label:"Resistance 2 (52W High / Max Target)", price:timing.resistance2, color:"#ef4444", icon:"🔴"},
                  {label:"Resistance 1 (Fair Value / Target 1)",  price:timing.resistance1, color:"#f59e0b", icon:"🟡"},
                  {label:"Buy Zone High",                          price:timing.buyZoneHigh,color:"#38bdf8", icon:"🔵"},
                  {label:"Buy Zone Low",                           price:timing.buyZoneLow, color:"#38bdf8", icon:"🔵"},
                  {label:"Support 2",                              price:timing.support2,   color:"#22c55e", icon:"🟢"},
                  {label:"Support 1 (Strong Buy)",                 price:timing.support1,   color:"#10b981", icon:"🟢"},
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:`1px solid ${item.color}15`}}>
                    <span style={{fontSize:"14px"}}>{item.icon}</span>
                    <div style={{flex:1,fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"12px"}}>{item.label}</div>
                    <div style={{fontFamily:"Space Mono,monospace",color:item.color,fontSize:"13px",fontWeight:"700"}}>${item.price}</div>
                  </div>
                ))}
              </div>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"11px",marginTop:"14px",fontStyle:"italic",lineHeight:"1.6"}}>
                💡 Spot trading: Buy near Support/Buy Zone. Set stop loss 3-5% below entry. Take partial profits at Resistance 1, trail stop to Resistance 2.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Advice Panel ───────────────────────────────────────────────
function AIAdvicePanel({ advice, currentPrice }) {
  const [tab, setTab] = useState("entry");
  const tabs = [
    { id:"entry", label:"Entry" },
    { id:"exit",  label:"Exit & Targets" },
    { id:"tips",  label:"Tips" },
    { id:"risks", label:"Risks" },
  ];
  const vc = {
    BUY_NOW:      {color:"#10b981",bg:"rgba(16,185,129,0.1)", border:"rgba(16,185,129,0.3)", label:"BUY NOW",      emoji:"🚀"},
    WAIT_FOR_DIP: {color:"#f59e0b",bg:"rgba(245,158,11,0.1)", border:"rgba(245,158,11,0.3)", label:"WAIT FOR DIP", emoji:"⏳"},
    ACCUMULATE:   {color:"#38bdf8",bg:"rgba(56,189,248,0.1)", border:"rgba(56,189,248,0.3)", label:"ACCUMULATE",   emoji:"📈"},
    AVOID:        {color:"#ef4444",bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.3)",  label:"AVOID",        emoji:"⛔"},
  }[advice.verdict] || {color:"#f59e0b",bg:"rgba(245,158,11,0.1)",border:"rgba(245,158,11,0.3)",label:"WAIT",emoji:"⏳"};

  const riskColor = {LOW:"#10b981",MEDIUM:"#f59e0b",HIGH:"#ef4444"}[advice.riskLevel] || "#f59e0b";

  return (
    <div style={{background:"#0e0e18",border:"1px solid rgba(212,168,67,0.2)",borderRadius:"20px",overflow:"hidden",marginBottom:"20px"}}>
      <div style={{padding:"24px 28px",background:"linear-gradient(135deg,rgba(212,168,67,0.08) 0%,rgba(56,189,248,0.04) 100%)",borderBottom:"1px solid #1c1c2e"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <span style={{fontSize:"20px"}}>🤖</span>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"2px",textTransform:"uppercase"}}>AI Trading Coach — Llama 3.3 70B</div>
            </div>
            <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",maxWidth:"520px",margin:0}}>{advice.summary}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"8px"}}>
            <div style={{background:vc.bg,border:`1px solid ${vc.border}`,borderRadius:"10px",padding:"10px 18px",textAlign:"center"}}>
              <div style={{fontSize:"20px",marginBottom:"2px"}}>{vc.emoji}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",color:vc.color,fontSize:"12px",fontWeight:"700",letterSpacing:"2px"}}>{vc.label}</div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              {[
                {label:"Confidence",value:`${advice.accuracy_confidence}%`,color:"#d4a843"},
                {label:"Risk",value:advice.riskLevel,color:riskColor},
                {label:"Horizon",value:advice.timeHorizon?.split(" ")[0],color:"#38bdf8"},
              ].map((m,i)=>(
                <div key={i} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",border:"1px solid #1c1c2e",borderRadius:"8px",padding:"6px 10px"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase"}}>{m.label}</div>
                  <div style={{fontFamily:"Space Mono,monospace",color:m.color,fontSize:"13px",fontWeight:"700"}}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid #1c1c2e",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 22px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #d4a843":"2px solid transparent",color:tab===t.id?"#d4a843":"#6b6b8a",fontFamily:"DM Sans,sans-serif",fontSize:"12px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"24px 28px"}}>
        {tab==="entry" && advice.entryStrategy && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {[
                {label:"Current Price",    value:`$${parseFloat(currentPrice).toFixed(2)}`, color:"#e4e4f0", sub:"Market Now"},
                {label:"Ideal Entry",      value:`$${parseFloat(advice.entryStrategy.ideal_entry).toFixed(2)}`,      color:"#10b981", sub:"Best Buy Price"},
                {label:"Entry Zone Low",   value:`$${parseFloat(advice.entryStrategy.entry_zone_low).toFixed(2)}`,   color:"#22c55e", sub:"Lower Bound"},
                {label:"Entry Zone High",  value:`$${parseFloat(advice.entryStrategy.entry_zone_high).toFixed(2)}`,  color:"#f59e0b", sub:"Upper Bound"},
              ].map((item,i)=>(
                <div key={i} style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"6px"}}>{item.label}</div>
                  <div style={{fontFamily:"Space Mono,monospace",color:item.color,fontSize:"16px",fontWeight:"700",marginBottom:"4px"}}>{item.value}</div>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px"}}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"10px",padding:"14px 18px",marginBottom:"12px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#10b981",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>Why This Entry</div>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",margin:0}}>{advice.entryStrategy.rationale}</p>
            </div>
            {advice.dca_suggestion && (
              <div style={{background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"10px",padding:"14px 18px"}}>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#38bdf8",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>💡 DCA Plan</div>
                <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",margin:0}}>{advice.dca_suggestion}</p>
              </div>
            )}
          </div>
        )}

        {tab==="exit" && advice.exitStrategy && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {[
                {label:"Target 1",      value:`$${parseFloat(advice.exitStrategy.target_1).toFixed(2)}`,   sub:`+${parseFloat(advice.exitStrategy.target_1_return).toFixed(1)}%`, color:"#22c55e"},
                {label:"Target 2",      value:`$${parseFloat(advice.exitStrategy.target_2).toFixed(2)}`,   sub:`+${parseFloat(advice.exitStrategy.target_2_return).toFixed(1)}%`, color:"#10b981"},
                {label:"Stop Loss",     value:`$${parseFloat(advice.exitStrategy.stop_loss).toFixed(2)}`,  sub:`${parseFloat(advice.exitStrategy.stop_loss_pct).toFixed(1)}%`,    color:"#ef4444"},
                {label:"Position Size", value:advice.positionSizing||"5-8%",                               sub:"of portfolio",                                                    color:"#d4a843"},
              ].map((item,i)=>(
                <div key={i} style={{background:"#13131f",border:`1px solid ${item.color}25`,borderRadius:"12px",padding:"16px",textAlign:"center"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"6px"}}>{item.label}</div>
                  <div style={{fontFamily:"Space Mono,monospace",color:item.color,fontSize:"16px",fontWeight:"700",marginBottom:"4px"}}>{item.value}</div>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:`${item.color}99`,fontSize:"11px"}}>{item.sub}</div>
                </div>
              ))}
            </div>
            {/* R:R Ratio */}
            {(() => {
              const entry  = parseFloat(advice.entryStrategy?.ideal_entry || currentPrice);
              const t1     = parseFloat(advice.exitStrategy.target_1);
              const sl     = parseFloat(advice.exitStrategy.stop_loss);
              const reward = ((t1-entry)/entry*100).toFixed(1);
              const risk   = ((entry-sl)/entry*100).toFixed(1);
              const ratio  = (parseFloat(reward)/parseFloat(risk)).toFixed(2);
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"16px"}}>
                  {[
                    {label:"Reward",value:`+${reward}%`,color:"#10b981"},
                    {label:"Risk",  value:`-${risk}%`,  color:"#ef4444"},
                    {label:"R:R",   value:`${ratio}:1`, color:"#d4a843"},
                  ].map((m,i)=>(
                    <div key={i} style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"10px",padding:"14px",textAlign:"center"}}>
                      <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px"}}>{m.label}</div>
                      <div style={{fontFamily:"Space Mono,monospace",color:m.color,fontSize:"20px",fontWeight:"700"}}>{m.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{background:"rgba(212,168,67,0.06)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:"10px",padding:"14px 18px"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>Exit Rationale</div>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",margin:0}}>{advice.exitStrategy.rationale}</p>
            </div>
          </div>
        )}

        {tab==="tips" && (
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {(advice.tradingTips||[]).map((tip,i)=>(
              <div key={i} style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"12px",padding:"16px 20px",display:"flex",gap:"14px",alignItems:"flex-start"}}>
                <div style={{width:"26px",height:"26px",flexShrink:0,background:"linear-gradient(135deg,#d4a843,#c47d0a)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans",fontSize:"12px",fontWeight:"700",color:"#0a0800"}}>{i+1}</div>
                <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.7",margin:0}}>{tip}</p>
              </div>
            ))}
          </div>
        )}

        {tab==="risks" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"20px"}}>
            <div>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"11px",fontWeight:"600",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"14px"}}>⚠️ Key Risks</div>
              {(advice.keyRisks||[]).map((r,i)=>(
                <div key={i} style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:"10px",padding:"12px 16px",marginBottom:"10px",display:"flex",gap:"10px"}}>
                  <span style={{color:"#ef4444",fontSize:"12px",flexShrink:0}}>✕</span>
                  <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.6",margin:0}}>{r}</p>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:"DM Sans,sans-serif",color:"#10b981",fontSize:"11px",fontWeight:"600",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"14px"}}>🚀 Catalysts</div>
              {(advice.catalysts||[]).map((c,i)=>(
                <div key={i} style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"10px",padding:"12px 16px",marginBottom:"10px",display:"flex",gap:"10px"}}>
                  <span style={{color:"#10b981",fontSize:"12px",flexShrink:0}}>↑</span>
                  <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"13px",lineHeight:"1.6",margin:0}}>{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function CheckPage() {
  const [ticker,      setTicker]      = useState("");
  const [fetchedData, setFetchedData] = useState(null);
  const [fetching,    setFetching]    = useState(false);
  const [fetchError,  setFetchError]  = useState("");
  const [overrides,   setOverrides]   = useState({currentPrice:"",peRatio:"",pbvRatio:"",roe:"",eps:"",bvps:"",der:"",revenueGrowth:"",dividendYield:"",netMargin:""});
  const [result,      setResult]      = useState(null);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [aiAdvice,    setAiAdvice]    = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiError,     setAiError]     = useState("");

  const setOv = key => val => setOverrides(p=>({...p,[key]:val}));
  const fd = fetchedData;

  const merged = {
    currentPrice:  overrides.currentPrice  || fd?.currentPrice  || "",
    peRatio:       overrides.peRatio       || fd?.peRatio       || "",
    pbvRatio:      overrides.pbvRatio      || fd?.pbvRatio      || "",
    roe:           overrides.roe           || fd?.roe           || "",
    eps:           overrides.eps           || fd?.eps           || "",
    bvps:          overrides.bvps          || fd?.bvps          || "",
    der:           overrides.der           || fd?.der           || "",
    revenueGrowth: overrides.revenueGrowth || fd?.revenueGrowth || "",
    dividendYield: overrides.dividendYield || fd?.dividendYield || "",
    netMargin:     overrides.netMargin     || fd?.netMargin     || "",
    week52High:    fd?.week52High || "",
    week52Low:     fd?.week52Low  || "",
    beta:          fd?.beta       || "",
  };

  const fetchStock = useCallback(async () => {
    if (!ticker.trim()) return;
    setFetching(true); setFetchError(""); setFetchedData(null); setResult(null); setAiAdvice(null);
    try {
      const res  = await fetch(`/api/stock?symbol=${ticker.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.error) setFetchError(data.error);
      else setFetchedData(data);
    } catch { setFetchError("Network error. You can still enter data manually below."); }
    setFetching(false);
  }, [ticker]);

  const handleAnalyze = () => {
    setSubmitError("");
    if (!merged.currentPrice)                { setSubmitError("Current price is required."); return; }
    if (!merged.peRatio && !merged.pbvRatio) { setSubmitError("Fill in at least P/E Ratio or PBV Ratio."); return; }
    setAnalyzing(true);
    setTimeout(()=>{
      setResult(analyzeStock(merged));
      setAnalyzing(false);
      setTimeout(()=>document.getElementById("result")?.scrollIntoView({behavior:"smooth"}),100);
    },1000);
  };

  const handleGetAIAdvice = async (analysisResult) => {
    setAiLoading(true); setAiError(""); setAiAdvice(null);
    try {
      const res  = await fetch("/api/ai-advice",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          stockData:{...merged,ticker,name:fd?.name,week52High:fd?.week52High,week52Low:fd?.week52Low},
          analysisResult,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAdvice(data.advice);
        setTimeout(()=>document.getElementById("ai-section")?.scrollIntoView({behavior:"smooth"}),100);
      } else { setAiError(data.error||"Failed to get AI advice"); }
    } catch { setAiError("Network error. Please try again."); }
    setAiLoading(false);
  };

  const reset = () => {
    setTicker(""); setFetchedData(null); setFetchError("");
    setOverrides({currentPrice:"",peRatio:"",pbvRatio:"",roe:"",eps:"",bvps:"",der:"",revenueGrowth:"",dividendYield:"",netMargin:""});
    setResult(null); setSubmitError(""); setAiAdvice(null); setAiError("");
  };

  const card = {background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"16px",padding:"32px"};

  return (
    <main style={{minHeight:"100vh",background:"#07070d"}}>
      <Navbar />

      <section style={{paddingTop:"120px",paddingBottom:"48px",paddingLeft:"24px",paddingRight:"24px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(212,168,67,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,67,0.025) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"600px",height:"300px",background:"radial-gradient(ellipse,rgba(212,168,67,0.08) 0%,transparent 70%)"}}/>
        <div style={{maxWidth:"800px",margin:"0 auto",textAlign:"center",position:"relative"}}>
          <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(40px,6vw,72px)",fontWeight:"500",color:"#e4e4f0",lineHeight:"1.1",marginBottom:"16px"}}>
            US Stock Analyzer
          </h1>
          <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"15px",lineHeight:"1.8",maxWidth:"520px",margin:"0 auto"}}>
            Real-time fundamentals · Fair value · AI strategy · Spot buy & sell timing
          </p>
        </div>
      </section>

      <section style={{maxWidth:"960px",margin:"0 auto",padding:"0 24px 80px"}}>

        {/* STEP 1 */}
        <div style={{...card,marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <div style={{width:"28px",height:"28px",background:"linear-gradient(135deg,#d4a843,#c47d0a)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans",fontSize:"13px",fontWeight:"700",color:"#0a0800",flexShrink:0}}>1</div>
            <div>
              <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"22px",fontWeight:"600",color:"#e4e4f0"}}>Fetch Live Data</h2>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"12px"}}>Enter any US ticker — data auto-fills from Yahoo Finance</p>
            </div>
          </div>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
            <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==="Enter"&&fetchStock()}
              placeholder="AAPL, MSFT, NVDA, GOOGL, TSLA..." maxLength={10}
              style={{flex:1,minWidth:"200px",padding:"13px 18px",background:"rgba(255,255,255,0.03)",border:"1px solid #1c1c2e",borderRadius:"8px",color:"#e4e4f0",fontFamily:"Space Mono,monospace",fontSize:"16px",letterSpacing:"2px",outline:"none",transition:"all 0.2s"}}
              onFocus={e=>{e.target.style.borderColor="#8a6e2a";e.target.style.boxShadow="0 0 0 3px rgba(212,168,67,0.08)";}}
              onBlur={e=>{e.target.style.borderColor="#1c1c2e";e.target.style.boxShadow="none";}}
            />
            <button onClick={fetchStock} disabled={fetching||!ticker.trim()}
              style={{padding:"13px 28px",background:fetching||!ticker.trim()?"#1c1c2e":"linear-gradient(135deg,#d4a843,#c47d0a)",color:fetching||!ticker.trim()?"#6b6b8a":"#0a0800",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"700",letterSpacing:"1px",cursor:fetching||!ticker.trim()?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif",transition:"all 0.2s",whiteSpace:"nowrap"}}>
              {fetching?"Fetching...":"↓ Fetch Data"}
            </button>
          </div>
          {fetchError && (
            <div style={{marginTop:"12px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px 14px",fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"13px"}}>
              ⚠️ {fetchError}
            </div>
          )}
          {fd && (
            <div style={{marginTop:"16px",background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:"10px",padding:"16px 20px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"12px"}}>
              <div>
                <div style={{fontFamily:"Space Mono,monospace",color:"#d4a843",fontSize:"16px",fontWeight:"700"}}>{fd.symbol}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#e4e4f0",fontSize:"13px"}}>{fd.name}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"11px"}}>{fd.exchange} · {fd.sector} · {fd.industry}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"Space Mono,monospace",color:"#e4e4f0",fontSize:"24px",fontWeight:"700"}}>${parseFloat(fd.currentPrice).toFixed(2)}</div>
                {fd.changePercent!=null&&<div style={{fontFamily:"Space Mono,monospace",color:fd.changePercent>=0?"#10b981":"#ef4444",fontSize:"13px"}}>{fd.changePercent>=0?"▲":"▼"} {Math.abs(fd.changePercent).toFixed(2)}%</div>}
              </div>
              <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                {[["52W High",fd.week52High?`$${parseFloat(fd.week52High).toFixed(2)}`:"—"],["52W Low",fd.week52Low?`$${parseFloat(fd.week52Low).toFixed(2)}`:"—"],["Beta",fd.beta?parseFloat(fd.beta).toFixed(2):"—"]].map(([l,v])=>(
                  <div key={l}>
                    <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontFamily:"Space Mono,monospace",color:"#e4e4f0",fontSize:"13px",fontWeight:"700"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2 */}
        <div style={{...card,marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
            <div style={{width:"28px",height:"28px",background:"linear-gradient(135deg,#38bdf8,#0284c7)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans",fontSize:"13px",fontWeight:"700",color:"#fff",flexShrink:0}}>2</div>
            <div>
              <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"22px",fontWeight:"600",color:"#e4e4f0"}}>Fundamental Data</h2>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"12px"}}>🟡 Gold border = auto-filled · Type to override</p>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
            <MetricRow label="Current Price"    hint="USD $"              value={overrides.currentPrice}  autoValue={fd?.currentPrice  !=null?parseFloat(fd.currentPrice).toFixed(2) :null} onChange={setOv("currentPrice")} />
            <MetricRow label="P/E Ratio"        hint="Price/Earnings"     value={overrides.peRatio}       autoValue={fd?.peRatio       !=null?parseFloat(fd.peRatio).toFixed(2)       :null} onChange={setOv("peRatio")} />
            <MetricRow label="PBV Ratio"        hint="Price/Book"         value={overrides.pbvRatio}      autoValue={fd?.pbvRatio      !=null?parseFloat(fd.pbvRatio).toFixed(2)      :null} onChange={setOv("pbvRatio")} />
            <MetricRow label="ROE"              hint="Return on Equity %" value={overrides.roe}           autoValue={fd?.roe           !=null?parseFloat(fd.roe).toFixed(2)           :null} onChange={setOv("roe")} />
            <MetricRow label="EPS"              hint="Earnings/Share"     value={overrides.eps}           autoValue={fd?.eps           !=null?parseFloat(fd.eps).toFixed(2)           :null} onChange={setOv("eps")} />
            <MetricRow label="Book Value/Share" hint="BVPS"               value={overrides.bvps}          autoValue={fd?.bvps          !=null?parseFloat(fd.bvps).toFixed(2)          :null} onChange={setOv("bvps")} />
            <MetricRow label="Debt/Equity"      hint="DER"                value={overrides.der}           autoValue={fd?.der           !=null?parseFloat(fd.der).toFixed(2)           :null} onChange={setOv("der")} />
            <MetricRow label="Revenue Growth"   hint="% YoY"              value={overrides.revenueGrowth} autoValue={fd?.revenueGrowth !=null?parseFloat(fd.revenueGrowth).toFixed(2) :null} onChange={setOv("revenueGrowth")} />
            <MetricRow label="Dividend Yield"   hint="%"                  value={overrides.dividendYield} autoValue={fd?.dividendYield !=null?parseFloat(fd.dividendYield).toFixed(2) :null} onChange={setOv("dividendYield")} />
            <MetricRow label="Net Margin"       hint="%"                  value={overrides.netMargin}     autoValue={fd?.netMargin     !=null?parseFloat(fd.netMargin).toFixed(2)     :null} onChange={setOv("netMargin")} />
          </div>
        </div>

        {/* STEP 3 */}
        <div style={{...card,marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <div style={{width:"28px",height:"28px",background:"linear-gradient(135deg,#10b981,#059669)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans",fontSize:"13px",fontWeight:"700",color:"#fff",flexShrink:0}}>3</div>
            <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"22px",fontWeight:"600",color:"#e4e4f0"}}>Analyze</h2>
          </div>
          {submitError&&<div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px 14px",marginBottom:"16px",fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"13px"}}>⚠️ {submitError}</div>}
          <button onClick={handleAnalyze} disabled={analyzing}
            style={{width:"100%",padding:"16px",background:analyzing?"#1c1c2e":"linear-gradient(135deg,#d4a843,#c47d0a)",color:analyzing?"#6b6b8a":"#0a0800",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",cursor:analyzing?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif",transition:"all 0.3s",boxShadow:analyzing?"none":"0 8px 30px rgba(212,168,67,0.2)"}}>
            {analyzing?"⏳ Calculating...":"🔍 Analyze Now"}
          </button>
        </div>

        {/* RESULTS */}
        {result && (
          <div id="result">
            {/* Score */}
            <div style={{...card,border:`1px solid ${result.ratingColor}30`,boxShadow:`0 0 60px ${result.ratingColor}08`,marginBottom:"20px"}}>
              <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"32px"}}>
                <div style={{textAlign:"center"}}>
                  <ScoreArc score={result.score} color={result.ratingColor}/>
                  <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:result.ratingBg,border:`1px solid ${result.ratingColor}40`,borderRadius:"100px",padding:"6px 20px",marginTop:"8px"}}>
                    <span style={{fontSize:"14px"}}>{result.ratingEmoji}</span>
                    <span style={{fontFamily:"DM Sans,sans-serif",color:result.ratingColor,fontSize:"13px",fontWeight:"700",letterSpacing:"2px"}}>{result.rating}</span>
                  </div>
                </div>
                <div style={{flex:1,minWidth:"260px"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#d4a843",fontSize:"11px",fontWeight:"600",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{ticker||"STOCK"} — Analysis Result</div>
                  <h3 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:"600",color:"#e4e4f0",lineHeight:"1.2",marginBottom:"14px"}}>
                    {fd?.name||ticker}{" "}
                    <span style={{color:result.ratingColor}}>
                      {result.rating==="STRONG BUY"||result.rating==="BUY"?"is worth buying":result.rating==="HOLD"?"should be held":"should be avoided"}
                    </span>
                  </h3>
                  <p style={{fontFamily:"DM Sans,sans-serif",color:"#9b9bb0",fontSize:"14px",lineHeight:"1.8",marginBottom:"20px"}}>{result.verdict}</p>
                  {result.marginOfSafety!=null&&(
                    <div style={{background:result.isUndervalued?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${result.isUndervalued?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:"10px",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Margin of Safety</div>
                        <div style={{fontFamily:"Space Mono,monospace",color:result.isUndervalued?"#10b981":"#ef4444",fontSize:"24px",fontWeight:"700"}}>{result.marginOfSafety>0?"+":""}{result.marginOfSafety}%</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Valuation</div>
                        <div style={{fontFamily:"DM Sans,sans-serif",color:result.isUndervalued?"#10b981":"#ef4444",fontSize:"13px",fontWeight:"600"}}>{result.isUndervalued?"📉 UNDERVALUED":"📈 OVERVALUED"}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fair Value Grid */}
            {(result.grahamNumber||result.peFairValue||result.avgFairValue)&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"20px"}}>
                {[
                  {label:"Current Price", value:merged.currentPrice?`$${parseFloat(merged.currentPrice).toFixed(2)}`:"—", sub:"Market Price",       color:"#38bdf8"},
                  {label:"Graham Number", value:result.grahamNumber?`$${result.grahamNumber}`:"—",                        sub:"Fair Value (Graham)", color:"#d4a843"},
                  {label:"P/E Fair Value",value:result.peFairValue?`$${result.peFairValue}`:"—",                          sub:"Fair Value (P/E)",    color:"#d4a843"},
                  {label:"Avg Fair Value",value:result.avgFairValue?`$${result.avgFairValue}`:"—",                        sub:"Average Methods",     color:"#f0c96a"},
                ].map((item,i)=>(
                  <div key={i} style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"12px",padding:"20px",textAlign:"center"}}>
                    <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"8px"}}>{item.label}</div>
                    <div style={{fontFamily:"Space Mono,monospace",color:item.color,fontSize:"clamp(14px,2vw,18px)",fontWeight:"700",marginBottom:"4px"}}>{item.value}</div>
                    <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"10px"}}>{item.sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Breakdown */}
            {result.breakdown.length>0&&(
              <div style={{...card,marginBottom:"20px"}}>
                <h3 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"22px",fontWeight:"600",color:"#e4e4f0",marginBottom:"24px"}}>Metric Breakdown</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
                  {result.breakdown.map((item,i)=>{
                    const pct=(item.score/item.max)*100;
                    const bc=pct>=80?"#10b981":pct>=60?"#22c55e":pct>=40?"#f59e0b":"#ef4444";
                    return (
                      <div key={i}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                            <span style={{fontFamily:"DM Sans,sans-serif",color:"#e4e4f0",fontSize:"14px",fontWeight:"500"}}>{item.label}</span>
                            <span style={{fontFamily:"Space Mono,monospace",color:"#d4a843",fontSize:"12px"}}>{item.value}</span>
                          </div>
                          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                            <span style={{fontFamily:"DM Sans,sans-serif",color:bc,fontSize:"11px",letterSpacing:"1px"}}>{item.status}</span>
                            <span style={{fontFamily:"Space Mono,monospace",color:bc,fontSize:"12px",fontWeight:"700"}}>{item.score}/{item.max}</span>
                          </div>
                        </div>
                        <div style={{height:"6px",background:"#1c1c2e",borderRadius:"3px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${bc}80,${bc})`,borderRadius:"3px",transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 8px ${bc}40`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ⏰ TIMING PANEL */}
            <TimingPanel timing={result.timing} ticker={ticker||"Stock"} />

            {/* 🤖 AI ADVICE */}
            <div id="ai-section">
              {!aiAdvice&&!aiLoading&&(
                <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.06) 0%,rgba(56,189,248,0.04) 100%)",border:"1px solid rgba(212,168,67,0.25)",borderRadius:"16px",padding:"32px",textAlign:"center",marginBottom:"20px"}}>
                  <div style={{fontSize:"40px",marginBottom:"16px"}}>🤖</div>
                  <h3 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"26px",fontWeight:"600",color:"#e4e4f0",marginBottom:"12px"}}>Get AI Trading Strategy</h3>
                  <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"14px",lineHeight:"1.8",marginBottom:"24px",maxWidth:"480px",margin:"0 auto 24px"}}>
                    Entry price, exit targets, stop loss, risk/reward ratio, and trading tips — generated by Llama 3.3 70B via Groq.
                  </p>
                  <button onClick={()=>handleGetAIAdvice(result)}
                    style={{background:"linear-gradient(135deg,#d4a843,#c47d0a)",color:"#0a0800",border:"none",padding:"14px 36px",borderRadius:"8px",fontSize:"14px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",fontFamily:"DM Sans,sans-serif",transition:"all 0.3s",boxShadow:"0 8px 30px rgba(212,168,67,0.25)"}}
                    onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(212,168,67,0.4)";}}
                    onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 30px rgba(212,168,67,0.25)";}}>
                    🤖 Generate AI Strategy
                  </button>
                </div>
              )}

              {aiLoading&&(
                <div style={{background:"#13131f",border:"1px solid #1c1c2e",borderRadius:"16px",padding:"48px",textAlign:"center",marginBottom:"20px"}}>
                  <div style={{width:"48px",height:"48px",border:"3px solid #1c1c2e",borderTop:"3px solid #d4a843",borderRadius:"50%",margin:"0 auto 20px",animation:"spin 1s linear infinite"}}/>
                  <div style={{fontFamily:"Cormorant Garamond,serif",color:"#e4e4f0",fontSize:"22px",marginBottom:"8px"}}>Llama AI is analyzing...</div>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"13px"}}>Calculating entry zones, targets & risk/reward</div>
                </div>
              )}

              {aiError&&(
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"12px",padding:"16px 20px",marginBottom:"20px"}}>
                  <div style={{fontFamily:"DM Sans,sans-serif",color:"#ef4444",fontSize:"13px",marginBottom:"8px"}}>⚠️ {aiError}</div>
                  <button onClick={()=>handleGetAIAdvice(result)} style={{background:"transparent",border:"1px solid #ef4444",color:"#ef4444",padding:"6px 14px",borderRadius:"6px",fontSize:"12px",cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Retry</button>
                </div>
              )}

              {aiAdvice&&<AIAdvicePanel advice={aiAdvice} currentPrice={merged.currentPrice}/>}
            </div>

            {/* Disclaimer */}
            <div style={{background:"rgba(212,168,67,0.04)",border:"1px solid rgba(212,168,67,0.15)",borderRadius:"10px",padding:"14px 18px",marginBottom:"16px"}}>
              <p style={{fontFamily:"DM Sans,sans-serif",color:"#6b6b8a",fontSize:"12px",lineHeight:"1.7"}}>
                ⚠️ <strong style={{color:"#d4a843"}}>Disclaimer:</strong> For educational purposes only. Not financial advice. Always do your own research before investing.
              </p>
            </div>

            <button onClick={reset}
              style={{width:"100%",padding:"14px",background:"transparent",border:"1px solid #1c1c2e",borderRadius:"10px",color:"#6b6b8a",fontSize:"13px",fontWeight:"500",letterSpacing:"1px",cursor:"pointer",fontFamily:"DM Sans,sans-serif",transition:"all 0.3s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#d4a843";e.currentTarget.style.color="#d4a843";}}
              onMouseOut={e=>{e.currentTarget.style.borderColor="#1c1c2e";e.currentTarget.style.color="#6b6b8a";}}>
              ↺ Analyze Another Stock
            </button>
          </div>
        )}
      </section>

      <Footer/>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </main>
  );
}
