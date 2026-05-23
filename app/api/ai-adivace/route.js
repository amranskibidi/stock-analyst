export async function POST(request) {
  try {
    const body = await request.json();
    const { stockData, analysisResult } = body;

    const prompt = `You are an expert stock market analyst and trading coach with 20 years of experience. Analyze this stock and provide a precise, actionable trading strategy.

STOCK DATA:
- Symbol: ${stockData.ticker || "Unknown"}
- Name: ${stockData.name || "Unknown"}
- Current Price: $${stockData.currentPrice}
- P/E Ratio: ${stockData.peRatio || "N/A"}
- PBV Ratio: ${stockData.pbvRatio || "N/A"}
- ROE: ${stockData.roe || "N/A"}%
- EPS: ${stockData.eps || "N/A"}
- Book Value Per Share: ${stockData.bvps || "N/A"}
- Debt/Equity: ${stockData.der || "N/A"}
- Revenue Growth: ${stockData.revenueGrowth || "N/A"}%
- Dividend Yield: ${stockData.dividendYield || "N/A"}%
- Net Margin: ${stockData.netMargin || "N/A"}%
- 52W High: ${stockData.week52High || "N/A"}
- 52W Low: ${stockData.week52Low || "N/A"}

FUNDAMENTAL ANALYSIS RESULT:
- Score: ${analysisResult.score}/100
- Rating: ${analysisResult.rating}
- Average Fair Value: $${analysisResult.avgFairValue || "N/A"}
- Graham Number: $${analysisResult.grahamNumber || "N/A"}
- Margin of Safety: ${analysisResult.marginOfSafety || "N/A"}%

Based on this data, provide a detailed trading strategy. Respond ONLY with a valid JSON object, no markdown, no explanation outside JSON:

{
  "summary": "2-3 sentence overall assessment of this stock right now",
  "verdict": "BUY_NOW or WAIT_FOR_DIP or ACCUMULATE or AVOID",
  "entryStrategy": {
    "ideal_entry": <number>,
    "entry_zone_low": <number>,
    "entry_zone_high": <number>,
    "rationale": "explanation of why this entry price based on the fundamentals"
  },
  "exitStrategy": {
    "target_1": <number>,
    "target_1_return": <number>,
    "target_2": <number>,
    "target_2_return": <number>,
    "stop_loss": <number>,
    "stop_loss_pct": <number>,
    "rationale": "explanation of targets based on fair value and technical levels"
  },
  "timeHorizon": "SHORT (weeks) or MEDIUM (3-12 months) or LONG (1-3 years)",
  "riskLevel": "LOW or MEDIUM or HIGH",
  "positionSizing": "recommended % of portfolio e.g. 5-8%",
  "keyRisks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "catalysts": ["specific catalyst 1", "specific catalyst 2"],
  "tradingTips": ["specific actionable tip 1", "specific actionable tip 2", "specific actionable tip 3"],
  "dca_suggestion": "specific DCA plan if applicable, e.g. buy X% now, X% at Y price",
  "accuracy_confidence": <number 0-100>
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "You are an expert quantitative analyst. Always respond with valid JSON only. No markdown, no code blocks, no extra text. Just the raw JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return Response.json({ success: false, error: "Groq API error: " + response.status }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse JSON from response");
      }
    }

    return Response.json({ success: true, advice: parsed });
  } catch (err) {
    console.error("AI advice error:", err);
    return Response.json(
      { success: false, error: "Failed to generate AI advice. Check your GROQ_API_KEY." },
      { status: 500 }
    );
  }
}
