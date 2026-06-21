type WinnerRow = {
  rank: string;
  model: string;
  provider: string;
  headline: string;
  webApp: string;
  repo: string;
  terminal: string;
  costTime: string;
  verdict: string;
};

type SignalCard = {
  label: string;
  winner: string;
  score: string;
  detail: string;
};

type BenchmarkEvidenceRow = {
  benchmark: string;
  winner: string;
  openai: string;
  anthropic: string;
  google: string;
  xai: string;
  source: string;
  sourceUrl: string;
};

const WEBDEV_GENERATED_AT = "2026-06-21";

const WINNER_ROWS: WinnerRow[] = [
  {
    rank: "1",
    model: "Claude Fable 5",
    provider: "Anthropic",
    headline: "Best current public web-app signal",
    webApp: "Vibe Code Bench v1.1: 90.35%",
    repo: "SWE-bench Verified: 95.00%",
    terminal: "Terminal-Bench v2.1 family top line: 84.6%",
    costTime: "Use Artificial Analysis live cost/time for the current agent harness.",
    verdict:
      "Default first model to test for real web-app build quality when cost is secondary.",
  },
  {
    rank: "2",
    model: "Claude Opus 4.8",
    provider: "Anthropic",
    headline: "Strongest broad runner-up",
    webApp: "Vibe Code Bench v1.1: 82.72%",
    repo: "SWE-bench Verified: 88.60%",
    terminal: "Terminal-Bench v2.1 family top line: 84.6%",
    costTime: "High-capability frontier tier; compare cost per task before standardizing.",
    verdict:
      "Best fallback when Fable is unavailable or when Opus behavior is preferred.",
  },
  {
    rank: "3",
    model: "GPT-5.5",
    provider: "OpenAI",
    headline: "Best OpenAI all-rounder",
    webApp: "Vibe Code Bench v1.1: 69.85%",
    repo: "SWE-bench Verified: 82.60%",
    terminal: "Terminal-Bench v2.1: 84.3%",
    costTime: "Near top terminal score; check live agent cost before high-volume use.",
    verdict:
      "Best OpenAI choice for teams already standardized on Codex/OpenAI workflows.",
  },
  {
    rank: "4",
    model: "GPT-5.3 Codex",
    provider: "OpenAI",
    headline: "Best measured full-stack paper run",
    webApp: "Vibe Code Bench paper: 61.8% workflow accuracy",
    repo: "Repository task signal is covered better by GPT-5.5 in public SWE rows.",
    terminal: "Terminal-Bench v2 Codex agent rows reach 78.4%.",
    costTime: "VCB paper: $11.91/test and 75.8 minutes.",
    verdict:
      "Important if the comparison is specifically agentic app generation with browser workflow tests.",
  },
  {
    rank: "5",
    model: "Gemini 3.5 Flash",
    provider: "Google",
    headline: "Best current Gemini repo signal",
    webApp: "No current public Gemini VCB winner surfaced in the text extract.",
    repo: "SWE-bench Verified: 78.80%",
    terminal: "Gemini 3.1 Pro / Gemini 3 Pro rows are competitive but below the top frontier rows.",
    costTime: "Likely attractive where Gemini speed and price matter; verify live agent cost.",
    verdict:
      "Worth testing for cost-sensitive maintenance and repo tasks, not yet a public web-app winner.",
  },
  {
    rank: "6",
    model: "Grok 4.20 Reasoning",
    provider: "xAI",
    headline: "Best current xAI public agent signal",
    webApp: "VCB paper Grok 4.1 Fast Reasoning: 1.2% workflow accuracy.",
    repo: "No current top xAI SWE-bench Verified row surfaced in the public extract.",
    terminal: "Grok CLI Grok 4.20 Reasoning: 57.3% on Terminal-Bench v2.",
    costTime: "VCB paper Grok row was cheap but low accuracy: $0.21/test and 8.8 minutes.",
    verdict:
      "Useful as an xAI baseline, but not a leading web-app development choice yet.",
  },
];

const SIGNAL_CARDS: SignalCard[] = [
  {
    label: "Overall web-app winner",
    winner: "Claude Fable 5",
    score: "90.35%",
    detail: "Top Vibe Code Bench v1.1 result surfaced in the public page text.",
  },
  {
    label: "Repo maintenance winner",
    winner: "Claude Fable 5",
    score: "95.00%",
    detail: "Best listed Vals SWE-bench Verified result among the frontier providers.",
  },
  {
    label: "OpenAI winner",
    winner: "GPT-5.5",
    score: "84.3%",
    detail: "Near-top Terminal-Bench v2.1 plus strong VCB and SWE-bench Verified rows.",
  },
  {
    label: "Measured full-stack agent run",
    winner: "GPT-5.3 Codex",
    score: "61.8%",
    detail: "Best VCB paper workflow-accuracy row among the named frontier providers.",
  },
  {
    label: "Gemini watch",
    winner: "Gemini 3.5 Flash",
    score: "78.80%",
    detail: "Best public Gemini signal here is repo-level SWE-bench Verified.",
  },
  {
    label: "xAI watch",
    winner: "Grok 4.20 Reasoning",
    score: "57.3%",
    detail: "Best public xAI signal here is Terminal-Bench v2, not full-stack web apps.",
  },
];

const BENCHMARK_EVIDENCE_ROWS: BenchmarkEvidenceRow[] = [
  {
    benchmark: "Vibe Code Bench v1.1",
    winner: "Claude Fable 5: 90.35%",
    openai: "GPT-5.5: 69.85%; GPT-5.4: 67.42%.",
    anthropic: "Claude Fable 5: 90.35%; Opus 4.8: 82.72%; Opus 4.7: 71.00%.",
    google: "Included by provider, but no current top Gemini percentage in the text extract.",
    xai: "Included by provider, but no current top xAI percentage in the text extract.",
    source: "Vals AI",
    sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
  },
  {
    benchmark: "Vibe Code Bench paper",
    winner: "GPT-5.3 Codex: 61.8% workflow accuracy",
    openai:
      "GPT-5.3-Codex: 61.8%; $11.91/test; 75.8 minutes; 29.58% on email+Stripe tasks.",
    anthropic:
      "Claude Opus 4.6: 57.6%; $8.69/test; 21.3 minutes; 41.59% on email+Stripe tasks.",
    google:
      "Gemini 3.1 Pro: $3.83/test; 20.2 minutes; 3.57% on email+Stripe tasks.",
    xai:
      "Grok 4.1 Fast Reasoning: 1.2%; $0.21/test; 8.8 minutes.",
    source: "arXiv 2603.04601v3",
    sourceUrl: "https://arxiv.org/html/2603.04601v3",
  },
  {
    benchmark: "SWE-bench Verified",
    winner: "Claude Fable 5: 95.00%",
    openai: "GPT-5.5: 82.60%.",
    anthropic: "Claude Fable 5: 95.00%; Claude Opus 4.8: 88.60%.",
    google: "Gemini 3.5 Flash: 78.80%.",
    xai: "No current top-line xAI row in the Vals page extract.",
    source: "Vals AI",
    sourceUrl: "https://www.vals.ai/benchmarks/swebench",
  },
  {
    benchmark: "Terminal-Bench v2 / v2.1",
    winner: "Claude Fable 5 / Opus 4.8 family: 84.6%",
    openai: "GPT-5.5: 84.3%; GPT-5.3-Codex agent rows reach 78.4%.",
    anthropic: "Claude Fable 5 and Opus 4.8: 84.6%; Opus 4.6 rows above 76%.",
    google: "Gemini 3.1 Pro / Gemini 3 Pro rows range from the low 60s to mid 70s.",
    xai: "Grok CLI Grok 4.20 Reasoning: 57.3%; OpenHands Grok 4: 27.2%.",
    source: "Artificial Analysis",
    sourceUrl: "https://artificialanalysis.ai/evaluations/terminalbench-v2-1",
  },
  {
    benchmark: "Artificial Analysis Coding Agent Index",
    winner: "Use the live AA page for current agent-harness winners.",
    openai: "Tracks Codex/GPT agent variants by score, token use, cost, and time.",
    anthropic: "Tracks Claude Code/Cursor/Opus agent variants by score, token use, cost, and time.",
    google: "Tracks Gemini CLI and related Google agent variants.",
    xai: "Tracks Grok agent variants when included.",
    source: "Artificial Analysis",
    sourceUrl: "https://artificialanalysis.ai/agents/coding-agents",
  },
];

export const WEBDEV_BENCHMARK_HTML = String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web App Development AI Model Winners</title>
  <meta name="description" content="Winner-focused benchmark signals for frontier AI model performance on frontend, backend, full-stack, browser, and repository-level web application development.">
  <style>
    :root {
      --ink: #1a1a1a;
      --paper: #fdfcf7;
      --accent: #d4524a;
      --accent-warm: #e07238;
      --muted: #68645d;
      --soft: #efece2;
      --soft-2: #e7e1d3;
      --line: #ddd8cc;
      --good: #277451;
      --warn: #9a5f00;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0 auto;
      padding: 0.9rem clamp(1rem, 2vw, 3rem) 2rem;
      background: var(--paper);
      color: var(--ink);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      line-height: 1.58;
    }
    a { color: var(--accent); }
    a:hover { background: var(--accent); color: var(--paper); text-decoration: none; }
    main { max-width: 1440px; margin: 0 auto; }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: 1px solid var(--line);
      padding: 0.2rem 0 0.7rem;
    }
    .brand { color: var(--muted); font-size: 0.78rem; text-decoration: none; }
    .nav { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.78rem; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
      gap: clamp(1rem, 3vw, 2.5rem);
      align-items: end;
      padding: clamp(1.6rem, 4vw, 3.6rem) 0 1rem;
    }
    h1 {
      margin: 0;
      max-width: 940px;
      font-size: clamp(2rem, 5vw, 4.8rem);
      line-height: 1;
      letter-spacing: 0;
    }
    h2 {
      margin: 2.2rem 0 0.7rem;
      color: var(--accent);
      font-size: 1.05rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    p { max-width: 900px; }
    .lede {
      color: var(--muted);
      font-size: clamp(1rem, 1.5vw, 1.28rem);
      max-width: 820px;
    }
    .index-panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf6;
      padding: 1rem;
    }
    .index-label {
      color: var(--muted);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .index-model {
      display: block;
      margin: 0.35rem 0;
      color: var(--accent);
      font-size: clamp(1.45rem, 3vw, 2.35rem);
      line-height: 1.05;
    }
    .index-score {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.8rem 0 0;
      color: var(--muted);
      font-size: 0.78rem;
    }
    .pill {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--soft);
      padding: 0.22rem 0.55rem;
    }
    .signal-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.8rem;
      margin: 1rem 0 1.5rem;
    }
    .signal {
      min-height: 138px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      padding: 0.85rem;
    }
    .signal span {
      display: block;
      color: var(--muted);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .signal strong {
      display: block;
      margin: 0.35rem 0;
      color: var(--accent);
      font-size: 1.2rem;
      line-height: 1.15;
    }
    .signal b {
      color: var(--good);
      font-size: 1.55rem;
      font-weight: 700;
    }
    .signal p { margin: 0.35rem 0 0; font-size: 0.78rem; }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin: 0.3rem 0 0.8rem;
    }
    .tab {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--soft);
      padding: 0.28rem 0.65rem;
      color: var(--muted);
      font-size: 0.74rem;
    }
    .tab.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--paper);
    }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf6;
    }
    table {
      width: 100%;
      min-width: 1120px;
      border-collapse: collapse;
      font-size: 0.78rem;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 0.72rem 0.75rem;
      text-align: left;
      vertical-align: top;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--soft-2);
      color: #453f38;
      font-size: 0.68rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      z-index: 1;
    }
    tbody tr:last-child td { border-bottom: 0; }
    .rank {
      color: var(--accent);
      font-size: 1.2rem;
      font-weight: 700;
    }
    .model {
      color: var(--ink);
      font-weight: 700;
    }
    .provider {
      display: block;
      margin-top: 0.16rem;
      color: var(--muted);
      font-size: 0.68rem;
    }
    .source-link {
      display: inline-block;
      margin-top: 0.25rem;
      font-size: 0.72rem;
    }
    .note {
      border-left: 3px solid var(--warn);
      margin: 1rem 0;
      padding: 0.55rem 0 0.55rem 1rem;
      color: var(--muted);
      font-size: 0.84rem;
    }
    .method {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.8rem;
    }
    .method div {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      padding: 0.85rem;
    }
    .method strong { color: var(--accent); }
    .method p { margin: 0.35rem 0 0; font-size: 0.78rem; }
    code {
      background: var(--soft);
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 0.95em;
    }
    @media (max-width: 980px) {
      .hero, .signal-grid, .method { grid-template-columns: 1fr; }
      .topbar { align-items: flex-start; flex-direction: column; }
      table { min-width: 980px; }
    }
  </style>
</head>
<body>
  <main>
    <header class="topbar">
      <a class="brand" href="/">ai.itsolver.au</a>
      <nav class="nav" aria-label="Pages">
        <a href="/">Model registry</a>
        <a href="/its">ITS benchmark</a>
        <a href="/webdev" aria-current="page">Web dev winners</a>
      </nav>
    </header>

    <section class="hero">
      <div>
        <h1>Web App Development Model Winners</h1>
        <p class="lede">A winner-focused view of frontier AI models for building, modifying, debugging, and maintaining real web applications.</p>
      </div>
      <aside class="index-panel" aria-label="Current leader">
        <span class="index-label">Current public winner</span>
        <strong class="index-model">Claude Fable 5</strong>
        <p>Best combined signal from Vibe Code Bench v1.1, SWE-bench Verified, and Terminal-Bench v2.1 family results.</p>
        <div class="index-score">
          <span class="pill">VCB 90.35%</span>
          <span class="pill">SWE Verified 95.00%</span>
          <span class="pill">Updated ${escapeHtml(WEBDEV_GENERATED_AT)}</span>
        </div>
      </aside>
    </section>

    <section class="signal-grid" aria-label="Winning signals">
      ${SIGNAL_CARDS.map(renderSignalCard).join("\n")}
    </section>

    <p class="note">This page now follows the Artificial Analysis pattern: headline winners first, then benchmark breakdown, cost, and runtime context. It still avoids a fake universal score because web-app benchmarks do not share one harness.</p>

    <h2>Leaderboard</h2>
    <div class="tabs" aria-label="Leaderboard views">
      <span class="tab active">Performance</span>
      <span class="tab">Benchmark breakdown</span>
      <span class="tab">Cost</span>
      <span class="tab">Execution time</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Model</th>
            <th>Why it wins</th>
            <th>Web app signal</th>
            <th>Repo signal</th>
            <th>Terminal/browser signal</th>
            <th>Cost / time signal</th>
            <th>Practical verdict</th>
          </tr>
        </thead>
        <tbody>
          ${WINNER_ROWS.map(renderWinnerRow).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Benchmark Breakdown</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>Current winner</th>
            <th>OpenAI best</th>
            <th>Anthropic best</th>
            <th>Gemini best</th>
            <th>xAI best</th>
          </tr>
        </thead>
        <tbody>
          ${BENCHMARK_EVIDENCE_ROWS.map(renderEvidenceRow).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Method</h2>
    <section class="method" aria-label="Scoring method">
      <div>
        <strong>Performance first</strong>
        <p>Rank by the strongest public web-app and software-engineering evidence, not by provider completeness.</p>
      </div>
      <div>
        <strong>Break ties by task type</strong>
        <p>Full-stack app generation, repository maintenance, and terminal workflows are related but not interchangeable.</p>
      </div>
      <div>
        <strong>Cost is separate</strong>
        <p>Use cost and execution time after narrowing to models that can actually pass the workflow.</p>
      </div>
      <div>
        <strong>Missing rows stay visible</strong>
        <p>If a provider has no current public full-stack web-app winner, the page says so instead of filling the gap with generic coding scores.</p>
      </div>
    </section>
  </main>
</body>
</html>`;

function renderSignalCard(row: SignalCard): string {
  return String.raw`<div class="signal">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.winner)}</strong>
        <b>${escapeHtml(row.score)}</b>
        <p>${escapeHtml(row.detail)}</p>
      </div>`;
}

function renderWinnerRow(row: WinnerRow): string {
  return String.raw`<tr>
            <td class="rank">${escapeHtml(row.rank)}</td>
            <td><span class="model">${escapeHtml(row.model)}</span><span class="provider">${escapeHtml(row.provider)}</span></td>
            <td>${escapeHtml(row.headline)}</td>
            <td>${escapeHtml(row.webApp)}</td>
            <td>${escapeHtml(row.repo)}</td>
            <td>${escapeHtml(row.terminal)}</td>
            <td>${escapeHtml(row.costTime)}</td>
            <td>${escapeHtml(row.verdict)}</td>
          </tr>`;
}

function renderEvidenceRow(row: BenchmarkEvidenceRow): string {
  return String.raw`<tr>
            <td><strong>${escapeHtml(row.benchmark)}</strong><br><a class="source-link" href="${escapeAttribute(row.sourceUrl)}">${escapeHtml(row.source)}</a></td>
            <td>${escapeHtml(row.winner)}</td>
            <td>${escapeHtml(row.openai)}</td>
            <td>${escapeHtml(row.anthropic)}</td>
            <td>${escapeHtml(row.google)}</td>
            <td>${escapeHtml(row.xai)}</td>
          </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
