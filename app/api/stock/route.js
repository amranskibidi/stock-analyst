export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return Response.json({ error: "Symbol required" }, { status: 400 });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com/",
    "Origin": "https://finance.yahoo.com",
  };

  const safe = (v) => {
    if (v === null || v === undefined || v === "N/A" || v === "" || v === "None") return null;
    if (typeof v === "number") return isNaN(v) || !isFinite(v) ? null : v;
    if (typeof v === "object" && "raw" in v) {
      const r = v.raw;
      return typeof r === "number" && isFinite(r) ? r : null;
    }
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  try {
    const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,regularMarketDayHigh,regularMarketDayLow,trailingPE,forwardPE,priceToBook,trailingEps,bookValue,dividendYield,beta,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,longName,shortName,fullExchangeName,sector,industry`;

    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,summaryProfile`;

    let quoteData = null;
    let summaryData = null;

    const [quoteRes, summaryRes] = await Promise.allSettled([
      fetch(quoteUrl, { headers, signal: AbortSignal.timeout(10000) }),
      fetch(summaryUrl, { headers, signal: AbortSignal.timeout(10000) }),
    ]);

    if (quoteRes.status === "fulfilled" && quoteRes.value.ok) {
      const j = await quoteRes.value.json();
      quoteData = j?.quoteResponse?.result?.[0] || null;
    }

    if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
      const j = await summaryRes.value.json();
      summaryData = j?.quoteSummary?.result?.[0] || null;
    }

    let chartMeta = null;
    if (!quoteData || !safe(quoteData.regularMarketPrice)) {
      try {
        const chartRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { headers, signal: AbortSignal.timeout(8000) }
        );
        if (chartRes.ok) {
          const cj = await chartRes.value?.json?.() || await chartRes.json();
          chartMeta = cj?.chart?.result?.[0]?.meta || null;
        }
      } catch {}
    }

    const q   = quoteData    || {};
    const fin = summaryData?.financialData        || {};
    const stat= summaryData?.defaultKeyStatistics || {};
    const prof= summaryData?.summaryProfile       || {};

    const currentPrice =
      safe(q.regularMarketPrice) ??
      safe(chartMeta?.regularMarketPrice) ??
      null;

    if (!currentPrice) {
      return Response.json(
        { error: `"${symbol}" not found. Try: AAPL, MSFT, NVDA, TSLA, GOOGL` },
        { status: 404 }
      );
    }

    const peRatio  = safe(q.trailingPE)    ?? safe(q.forwardPE)           ?? safe(stat.trailingPE)    ?? null;
    const pbvRatio = safe(q.priceToBook)   ?? safe(stat.priceToBook)      ?? null;
    const eps      = safe(q.trailingEps)   ?? safe(stat.trailingEps)      ?? null;
    const bvps     = safe(q.bookValue)     ?? safe(stat.bookValue)        ?? null;
    const beta     = safe(q.beta)          ?? safe(stat.beta)             ?? null;
    const divYield = safe(q.dividendYield) != null
      ? safe(q.dividendYield) * 100
      : null;
    const week52High = safe(q.fiftyTwoWeekHigh) ?? safe(stat["52WeekHigh"]) ?? null;
    const week52Low  = safe(q.fiftyTwoWeekLow)  ?? safe(stat["52WeekLow"])  ?? null;

    const roeRaw    = safe(fin.returnOnEquity);
    const marginRaw = safe(fin.profitMargins);
    const growthRaw = safe(fin.revenueGrowth);
    const derRaw    = safe(fin.debtToEquity);

    const roe       = roeRaw    != null ? roeRaw    * 100 : null;
    const netMargin = marginRaw != null ? marginRaw * 100 : null;
    const revGrowth = growthRaw != null ? growthRaw * 100 : null;
    const der       = derRaw;

    const change    = safe(q.regularMarketChange);
    const changePct = safe(q.regularMarketChangePercent);

    console.log(`[Stock API] ${symbol} — price:${currentPrice} pe:${peRatio} pbv:${pbvRatio} roe:${roe} eps:${eps} bvps:${bvps} der:${der} margin:${netMargin}`);

    return Response.json({
      symbol,
      name:          q.longName          || q.shortName          || symbol,
      exchange:      q.fullExchangeName  || "US",
      sector:        q.sector            || prof.sector           || "—",
      industry:      q.industry          || prof.industry         || "—",
      currentPrice,
      change,
      changePercent: changePct,
      prevClose:     safe(q.regularMarketPreviousClose) ?? null,
      high:          safe(q.regularMarketDayHigh)       ?? null,
      low:           safe(q.regularMarketDayLow)        ?? null,
      peRatio,
      pbvRatio,
      eps,
      bvps,
      roe,
      der,
      revenueGrowth: revGrowth,
      dividendYield: divYield,
      netMargin,
      week52High,
      week52Low,
      beta,
      marketCap:     safe(q.marketCap) ?? null,
    });

  } catch (err) {
    console.error("Stock API error:", err?.message);
    return Response.json(
      { error: "Failed to fetch. Check your internet or try again." },
      { status: 500 }
    );
  }
}
