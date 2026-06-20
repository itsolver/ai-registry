type ProviderSnapshotRow = {
  provider: string;
  models: string;
  frontend: string;
  backend: string;
  fullStack: string;
  repoTask: string;
  browserWorkflow: string;
  costLatency: string;
  tested: string;
};

type BenchmarkRow = {
  benchmark: string;
  measures: string;
  openai: string;
  anthropic: string;
  google: string;
  xai: string;
  notes: string;
  source: string;
  sourceUrl: string;
};

const WEBDEV_GENERATED_AT = "2026-06-21";

const PROVIDER_SNAPSHOT_ROWS: ProviderSnapshotRow[] = [
  {
    provider: "OpenAI",
    models: "GPT-5.5, GPT-5.3 Codex, GPT-5.2 Codex, Codex CLI",
    frontend: "Strong Vibe Code Bench signal; GPT-5.5 is 69.85% on VCB v1.1.",
    backend:
      "Strong on no-integration apps; VCB paper shows GPT-5.3-Codex at 29.58% when both email and Stripe are required.",
    fullStack:
      "GPT-5.3-Codex leads the VCB paper test split at 61.8% workflow accuracy.",
    repoTask:
      "GPT-5.5 scores 82.60% on Vals SWE-bench Verified; GPT-5 is 23.3% on Scale SWE-Bench Pro public.",
    browserWorkflow:
      "VCB shows GPT-5.3-Codex using browser self-tests in 13.2% of raw tool calls.",
    costLatency:
      "VCB paper reports GPT-5.3-Codex at $11.91/test and 75.8 minutes; GPT-5.5 is near the top of Terminal-Bench v2.1 at 84.3%.",
    tested: "Latest source pass: 2026-06-21",
  },
  {
    provider: "Anthropic",
    models: "Claude Fable 5, Claude Opus 4.8/4.7/4.6, Claude Sonnet 4.6",
    frontend:
      "Best current VCB v1.1 signal: Claude Fable 5 at 90.35%, Opus 4.8 at 82.72%.",
    backend:
      "VCB paper reports Opus 4.6 at 41.59% on the email+Stripe integration slice.",
    fullStack:
      "Claude Opus 4.6 is 57.6% in the VCB paper tool-use table; current VCB v1.1 has Anthropic in the top three.",
    repoTask:
      "Claude Fable 5 scores 95.00% and Opus 4.8 scores 88.60% on Vals SWE-bench Verified.",
    browserWorkflow:
      "VCB paper reports Opus 4.6 with 22.9% browser tool-call share and strong self-testing behavior.",
    costLatency:
      "VCB paper reports Opus 4.6 at $8.69/test and 21.3 minutes; Terminal-Bench v2.1 has Fable/Opus 4.8 at 84.6%.",
    tested: "Latest source pass: 2026-06-21",
  },
  {
    provider: "Google / Gemini",
    models: "Gemini 3.5 Flash, Gemini 3.1 Pro, Gemini 3 Pro/Flash",
    frontend:
      "Covered by VCB and Terminal-Bench; exact latest VCB v1.1 provider top-line is not exposed in page text.",
    backend:
      "VCB paper reports Gemini 3.1 Pro at 3.57% when both email and Stripe are required.",
    fullStack:
      "VCB paper reports Gemini 3.1 Pro below GPT-5.3-Codex and Opus 4.6; no hard-app successes in the difficulty table.",
    repoTask:
      "Gemini 3.5 Flash scores 78.80% on Vals SWE-bench Verified.",
    browserWorkflow:
      "VCB paper finds Gemini 3.1 Pro benefits from higher reasoning effort and vision-enabled browser work.",
    costLatency:
      "VCB paper reports Gemini 3.1 Pro at $3.83/test and 20.2 minutes; Terminal-Bench v2 has Gemini 3.1 Pro rows above 60%.",
    tested: "Latest source pass: 2026-06-21",
  },
  {
    provider: "xAI",
    models: "Grok 4.20 Reasoning, Grok 4.1 Fast Reasoning, Grok 4, Grok Code Fast",
    frontend:
      "VCB includes xAI/Grok, but current public top-line web-app results remain sparse versus OpenAI/Anthropic.",
    backend:
      "VCB paper reports Grok 4.1 Fast Reasoning with elevated authorization failures and very low workflow accuracy.",
    fullStack:
      "VCB paper tool-use table shows Grok 4.1 Fast Reasoning at 1.2% workflow accuracy.",
    repoTask:
      "Terminal-Bench v2 reports OpenHands Grok 4 at 27.2%; Grok CLI Grok 4.20 Reasoning reaches 57.3% in later v2 entries.",
    browserWorkflow:
      "VCB paper reports only 1.1% browser tool-call share for Grok 4.1 Fast Reasoning.",
    costLatency:
      "VCB paper reports Grok 4.1 Fast Reasoning at $0.21/test and 8.8 minutes; low cost did not translate to high app accuracy.",
    tested: "Latest source pass: 2026-06-21",
  },
];

const BENCHMARK_ROWS: BenchmarkRow[] = [
  {
    benchmark: "Vibe Code Bench v1.1",
    measures:
      "End-to-end web app generation in a full development environment, then point-and-click workflow tests.",
    openai: "GPT-5.5: 69.85%; GPT-5.4: 67.42%; GPT-5.3 Codex follows.",
    anthropic: "Claude Fable 5: 90.35%; Opus 4.8: 82.72%; Opus 4.7: 71.00%.",
    google:
      "Included in provider filters and trajectories; latest text extract does not expose a top Gemini percentage.",
    xai: "Included in provider filters and trajectories; latest text extract does not expose a top xAI percentage.",
    notes:
      "Best source for full-stack product workflow signal. Treat model rankings as benchmark-specific because app specs and harness matter.",
    source: "Vals AI",
    sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
  },
  {
    benchmark: "Vibe Code Bench paper",
    measures:
      "Fifty app specs with React/Vite, Tailwind, Supabase, Docker Compose, deployment verification, browser workflow scoring, cost, and latency.",
    openai:
      "GPT-5.3-Codex: 61.8% workflow accuracy; $11.91/test; 75.8 minutes.",
    anthropic:
      "Claude Opus 4.6: 57.6% workflow accuracy; $8.69/test; 21.3 minutes.",
    google:
      "Gemini 3.1 Pro: $3.83/test; 20.2 minutes; 3.57% on email+Stripe tasks.",
    xai:
      "Grok 4.1 Fast Reasoning: 1.2% workflow accuracy; $0.21/test; 8.8 minutes.",
    notes:
      "Useful for cost, latency, integration difficulty, browser use, and auth/backend failure modes.",
    source: "arXiv 2603.04601v3",
    sourceUrl: "https://arxiv.org/html/2603.04601v3",
  },
  {
    benchmark: "SWE-WebDevBench / WebDevBench",
    measures:
      "Virtual software-agency app creation and modification across product, engineering, ops, security, schema, backend, frontend, and business readiness metrics.",
    openai: "Not model-normalized in the public paper table.",
    anthropic: "Not model-normalized in the public paper table.",
    google: "Not model-normalized in the public paper table.",
    xai: "Not model-normalized in the public paper table.",
    notes:
      "Best used as a dimension map for production readiness. The paper reports no platform passing more than 5 of 22 primary metrics.",
    source: "SWE-WebDevBench paper",
    sourceUrl: "https://arxiv.org/html/2605.04637v1",
  },
  {
    benchmark: "Web-Bench",
    measures:
      "Sequential web-development tasks across 50 projects, covering web standards and frameworks.",
    openai: "Runnable with OpenRouter/OpenAI models; current README example uses GPT-4o.",
    anthropic: "README reports Claude 3.7 Sonnet as SOTA at 25.1% Pass@1.",
    google: "No current frontier Gemini row in the README text.",
    xai: "No current frontier xAI row in the README text.",
    notes:
      "Good iterative web-dev benchmark shape, but public README results lag current frontier-provider model names.",
    source: "ByteDance web-bench",
    sourceUrl: "https://github.com/bytedance/web-bench",
  },
  {
    benchmark: "SWE-bench Verified",
    measures:
      "Repository-level GitHub issue resolution with tests; useful for maintenance and debugging rather than web-app UI quality.",
    openai: "GPT-5.5: 82.60%.",
    anthropic: "Claude Fable 5: 95.00%; Claude Opus 4.8: 88.60%.",
    google: "Gemini 3.5 Flash: 78.80%.",
    xai: "No current top-line xAI row in the Vals page extract.",
    notes:
      "Strong repo-task signal, but it over-represents Python/library bug fixing compared with full-stack product delivery.",
    source: "Vals AI SWE-bench",
    sourceUrl: "https://www.vals.ai/benchmarks/swebench",
  },
  {
    benchmark: "SWE-Bench Pro",
    measures:
      "Professional-repository issue resolution with fail-to-pass and pass-to-pass tests across public, private, and held-out sets.",
    openai: "GPT-5: 23.3% on the public set.",
    anthropic: "Claude Opus 4.1: 23.1% on the public set.",
    google: "No public top-line Gemini figure in the visible page text.",
    xai: "No public top-line xAI figure in the visible page text.",
    notes:
      "Harder and more industry-like than SWE-bench Verified; still not specifically frontend/full-stack app generation.",
    source: "Scale Labs",
    sourceUrl: "https://labs.scale.com/leaderboard/swe_bench_pro_public",
  },
  {
    benchmark: "Terminal-Bench v2 / v2.1",
    measures:
      "Terminal-based software engineering, system administration, data processing, model training, and security tasks.",
    openai:
      "v2.1: GPT-5.5 at 84.3%; v2: GPT-5.3-Codex agent rows reach 78.4%.",
    anthropic:
      "v2.1: Claude Fable 5 and Opus 4.8 at 84.6%; v2: Opus 4.6 rows above 76%.",
    google:
      "v2: Gemini 3.1 Pro / Gemini 3 Pro rows range from the low 60s to mid 70s in top agent harnesses.",
    xai:
      "v2: Grok CLI Grok 4.20 Reasoning at 57.3%; OpenHands Grok 4 at 27.2%.",
    notes:
      "Important for tool use and runtime correctness, but web UI correctness is indirect.",
    source: "Terminal-Bench and Artificial Analysis",
    sourceUrl: "https://artificialanalysis.ai/evaluations/terminalbench-v2-1",
  },
  {
    benchmark: "Artificial Analysis Coding Agent Index",
    measures:
      "Composite coding-agent score with cost, token usage, and execution time across end-to-end software engineering tasks.",
    openai: "Use the live AA page for current Codex/GPT rows.",
    anthropic: "Use the live AA page for current Claude Code/Cursor/Opus rows.",
    google: "Use the live AA page for current Gemini CLI rows.",
    xai: "Use the live AA page for current Grok rows.",
    notes:
      "Most useful live cost/time companion to benchmark scores. It aggregates several tasks rather than web-app-only work.",
    source: "Artificial Analysis",
    sourceUrl: "https://artificialanalysis.ai/agents/coding-agents",
  },
];

const DIMENSION_ROWS: [string, string][] = [
  ["Frontend quality", "Visual accuracy, responsiveness, accessibility, component structure, state handling, browser workflow success."],
  ["Backend quality", "API correctness, persistence, auth, permissions, validation, errors, security basics."],
  ["Full-stack integration", "Frontend/backend wiring, real workflows, data consistency, environment setup, deploy/run success."],
  ["Iterative development", "Change an existing app while preserving behavior, refactor safely, avoid regressions."],
  ["Production readiness", "Tests, maintainability, logging/observability, dependency choices, security posture."],
  ["Practical cost/performance", "Run cost, tokens, wall-clock time, retry rate, and human intervention required."],
];

export const WEBDEV_BENCHMARK_HTML = String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web App Development AI Benchmark Composite</title>
  <meta name="description" content="Composite benchmark signals for frontier AI model performance on frontend, backend, full-stack, browser, and repository-level web application development.">
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
      --ok: #277451;
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
    main { max-width: 1480px; margin: 0 auto; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
      gap: clamp(1.2rem, 3vw, 3rem);
      align-items: end;
      padding: clamp(1.6rem, 4vw, 3.8rem) 0 1.2rem;
    }
    h1 {
      margin: 0;
      max-width: 980px;
      font-size: clamp(2rem, 5.2vw, 5rem);
      line-height: 1;
      letter-spacing: 0;
    }
    h2 {
      margin: 2.3rem 0 0.7rem;
      color: var(--accent);
      font-size: 1.05rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h3 { margin: 1rem 0 0.35rem; font-size: 0.98rem; }
    p { max-width: 920px; }
    .lede {
      color: var(--muted);
      font-size: clamp(1rem, 1.6vw, 1.35rem);
      max-width: 820px;
    }
    .updated {
      display: grid;
      gap: 0.6rem;
      align-content: start;
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
      color: var(--muted);
      font-size: 0.82rem;
    }
    .updated strong {
      color: var(--ink);
      font-size: 1rem;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.8rem;
      margin: 1rem 0 1.5rem;
    }
    .summary {
      min-height: 118px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      padding: 0.8rem;
    }
    .summary span {
      display: block;
      color: var(--muted);
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .summary strong {
      display: block;
      margin: 0.35rem 0;
      color: var(--accent);
      font-size: 1.4rem;
      line-height: 1.1;
    }
    .summary p { margin: 0; font-size: 0.78rem; }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf6;
    }
    table {
      width: 100%;
      min-width: 1040px;
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
    td:first-child, th:first-child { min-width: 150px; }
    .provider { color: var(--accent); font-weight: 700; }
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
    .dimensions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.8rem;
    }
    .dimension {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      padding: 0.85rem;
    }
    .dimension strong { color: var(--accent); }
    .dimension p { margin: 0.35rem 0 0; font-size: 0.78rem; }
    .recommendation {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8f2e8;
      padding: 1rem;
    }
    .recommendation ol { margin: 0; padding-left: 1.35rem; }
    .recommendation li { margin: 0.4rem 0; }
    code {
      background: var(--soft);
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 0.95em;
    }
    @media (max-width: 960px) {
      .hero, .summary-grid, .dimensions { grid-template-columns: 1fr; }
      .topbar { align-items: flex-start; flex-direction: column; }
      table { min-width: 920px; }
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
        <a href="/webdev" aria-current="page">Web dev composite</a>
      </nav>
    </header>

    <section class="hero">
      <div>
        <h1>Composite Web Development Benchmark Signals</h1>
        <p class="lede">A practical, source-linked view of which frontier AI models are currently strongest at building, modifying, debugging, and maintaining real web applications.</p>
      </div>
      <div class="updated">
        <strong>Updated ${escapeHtml(WEBDEV_GENERATED_AT)}</strong>
        <span>Scope: OpenAI, Anthropic, Gemini, xAI</span>
        <span>Method: public benchmark aggregation, not a normalized leaderboard</span>
        <span>Use: model choice for real frontend/backend/full-stack delivery</span>
      </div>
    </section>

    <section class="summary-grid" aria-label="Current headline signals">
      <div class="summary">
        <span>Full-stack app generation</span>
        <strong>Claude leads VCB v1.1</strong>
        <p>Claude Fable 5 and Opus 4.8 lead the latest public Vibe Code Bench text extract.</p>
      </div>
      <div class="summary">
        <span>Repo maintenance</span>
        <strong>Claude + GPT top SWE</strong>
        <p>SWE-bench Verified favors Claude Fable/Opus, then GPT-5.5, then Gemini 3.5 Flash.</p>
      </div>
      <div class="summary">
        <span>Terminal workflows</span>
        <strong>Near tie at the top</strong>
        <p>Terminal-Bench v2.1 puts Claude Fable/Opus 4.8 and GPT-5.5 within 0.3 points.</p>
      </div>
      <div class="summary">
        <span>Big gap</span>
        <strong>No single web score</strong>
        <p>Frontend, backend, browser, repo, cost, and deploy readiness still need separate columns.</p>
      </div>
    </section>

    <p class="note">Scores below are copied from public benchmark pages or papers as of ${escapeHtml(WEBDEV_GENERATED_AT)}. They are intentionally not averaged into one number because upstream metrics differ by harness, scaffold, task mix, evaluator, tool access, and cost accounting.</p>

    <h2>Provider Snapshot</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Model focus</th>
            <th>Frontend score</th>
            <th>Backend score</th>
            <th>Full-stack score</th>
            <th>Repo/task score</th>
            <th>Browser workflow score</th>
            <th>Cost / latency</th>
            <th>Date tested</th>
          </tr>
        </thead>
        <tbody>
          ${PROVIDER_SNAPSHOT_ROWS.map(renderProviderRow).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Benchmark View</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>What it measures</th>
            <th>OpenAI best</th>
            <th>Anthropic best</th>
            <th>Gemini best</th>
            <th>xAI best</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${BENCHMARK_ROWS.map(renderBenchmarkRow).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Evaluation Dimensions</h2>
    <div class="dimensions">
      ${DIMENSION_ROWS.map(renderDimension).join("\n")}
    </div>

    <h2>How To Use This Page</h2>
    <div class="recommendation">
      <ol>
        <li>For zero-to-one full-stack app generation, start with Vibe Code Bench and SWE-WebDevBench-style dimensions.</li>
        <li>For maintaining an existing repository, weight SWE-bench Verified, SWE-Bench Pro, Terminal-Bench, and the Artificial Analysis Coding Agent Index more heavily.</li>
        <li>For frontend-heavy work, require browser workflow evidence. A repo patch score alone does not prove UI correctness.</li>
        <li>For backend/auth/database work, check integration slices and failure-mode notes. Email, Stripe, auth, row-level security, and role flows remain hard.</li>
        <li>For production delivery, compare cost, latency, deploy success, regression tests, and human intervention instead of using one generic coding score.</li>
      </ol>
    </div>
  </main>
</body>
</html>`;

function renderProviderRow(row: ProviderSnapshotRow): string {
  return String.raw`<tr>
            <td class="provider">${escapeHtml(row.provider)}</td>
            <td>${escapeHtml(row.models)}</td>
            <td>${escapeHtml(row.frontend)}</td>
            <td>${escapeHtml(row.backend)}</td>
            <td>${escapeHtml(row.fullStack)}</td>
            <td>${escapeHtml(row.repoTask)}</td>
            <td>${escapeHtml(row.browserWorkflow)}</td>
            <td>${escapeHtml(row.costLatency)}</td>
            <td>${escapeHtml(row.tested)}</td>
          </tr>`;
}

function renderBenchmarkRow(row: BenchmarkRow): string {
  return String.raw`<tr>
            <td><strong>${escapeHtml(row.benchmark)}</strong><br><a class="source-link" href="${escapeAttribute(row.sourceUrl)}">${escapeHtml(row.source)}</a></td>
            <td>${escapeHtml(row.measures)}</td>
            <td>${escapeHtml(row.openai)}</td>
            <td>${escapeHtml(row.anthropic)}</td>
            <td>${escapeHtml(row.google)}</td>
            <td>${escapeHtml(row.xai)}</td>
            <td>${escapeHtml(row.notes)}</td>
          </tr>`;
}

function renderDimension([label, description]: string[]): string {
  return String.raw`<div class="dimension">
        <strong>${escapeHtml(label)}</strong>
        <p>${escapeHtml(description)}</p>
      </div>`;
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
