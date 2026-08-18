import {
  ARENA_FRONTEND_WEBDEV_CHECKED_AT,
  ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS,
  ARENA_FRONTEND_WEBDEV_MODEL_COUNT,
  ARENA_FRONTEND_WEBDEV_MODELS,
  ARENA_FRONTEND_WEBDEV_SOURCE_URL,
  ARENA_FRONTEND_WEBDEV_TOTAL_VOTES,
  ARENA_FRONTEND_WEBDEV_UPDATED_ON,
} from "./generated/arena-frontend-webdev";

type WinnerRow = {
  model: string;
  provider: string;
  headline: string;
  arena: string;
  valsIndex: string;
  fullVcb: string;
  designArena: string;
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
  freshness: string;
  measures: string;
  leader: string;
  kimi: string;
  registryUse: string;
  source: string;
  sourceUrl: string;
};

const ARENA_LEADER = ARENA_FRONTEND_WEBDEV_MODELS[0];

function webdevEvidenceIsFresh(now: Date): boolean {
  const checkedAtMs = Date.parse(ARENA_FRONTEND_WEBDEV_CHECKED_AT);
  const nowMs = now.getTime();
  const ageMs = nowMs - checkedAtMs;
  return (
    Number.isFinite(checkedAtMs) &&
    Number.isFinite(nowMs) &&
    ageMs >= 0 &&
    ageMs <= ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  );
}

function arenaSummary(registryModelId: string): string {
  const rows = ARENA_FRONTEND_WEBDEV_MODELS.filter(
    (row) => row.registryModelId === registryModelId,
  );
  if (!rows.length) return "Not listed in the checked Arena top 20";
  return rows
    .map(
      (row) =>
        `${row.configuration?.displayLabel ?? "base"} #${row.rank} at ${row.score} ±${row.confidence}${row.preliminary ? " (preliminary)" : ""}`,
    )
    .join("; ");
}

const WINNER_ROWS: WinnerRow[] = [
  {
    model: "Claude Opus 5",
    provider: "Anthropic",
    headline: "Current Arena leader and Vibe Code Bench runner-up",
    arena: arenaSummary("claude-opus-5"),
    valsIndex: "Vals Index v2 leader at 67.21% across its broader economic task mix",
    fullVcb: "#2 at 88.40% on Vibe Code Bench v1.1",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "Best current front-end preference signal, with strong independent functional support.",
  },
  {
    model: "Claude Fable 5",
    provider: "Anthropic",
    headline: "Current Vibe Code Bench functional leader",
    arena: arenaSummary("claude-fable-5"),
    valsIndex: "#2 on Vals Index v2 at 66.04%",
    fullVcb: "#1 at 90.35% on Vibe Code Bench v1.1",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "Best functional full-app cross-check and the strongest alternative to the Arena winner.",
  },
  {
    model: "Kimi K3",
    provider: "Moonshot AI",
    headline: "Close Arena runner-up and leading open-weight Vibe Code model",
    arena: arenaSummary("kimi-k3"),
    valsIndex: "Included in the current Vals model set",
    fullVcb: "#3; the first open-weight model in the current top tier",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "Best open-weight choice in the current evidence and close to the Arena lead.",
  },
  {
    model: "GPT-5.6 Sol",
    provider: "OpenAI",
    headline: "Best current OpenAI front-end row",
    arena: arenaSummary("gpt-5.6-sol"),
    valsIndex: "#3 on Vals Index v2 at 63.71%",
    fullVcb: "Listed behind Claude Sonnet 5 in the current top group",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "Best OpenAI choice, with the Arena result tied to the explicit Codex harness configuration.",
  },
  {
    model: "Gemini 3.7 Flash",
    provider: "Google",
    headline: "Lowest output price in the current Arena top 10",
    arena: arenaSummary("gemini-3.7-flash"),
    valsIndex: "Included in the current Vals model set",
    fullVcb: "Included in the current Vibe Code Bench table",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "Best value choice for both balanced and fast policy bands in this snapshot.",
  },
  {
    model: "Grok 4.6",
    provider: "xAI",
    headline: "Best current xAI front-end row",
    arena: arenaSummary("grok-4.6"),
    valsIndex: "Included in the current Vals model set",
    fullVcb: "Included in the current Vibe Code Bench table",
    designArena: "The previous DesignArena URL now returns 404 and is excluded",
    verdict:
      "A lower-cost frontier alternative, but its current Arena result is preliminary.",
  },
];

const SIGNAL_CARDS: SignalCard[] = [
  {
    label: "Arena leader",
    winner: ARENA_LEADER.label,
    score: `${ARENA_LEADER.score} ±${ARENA_LEADER.confidence}`,
    detail: `Rank #${ARENA_LEADER.rank} from ${ARENA_LEADER.votes.toLocaleString("en-AU")} votes.`,
  },
  {
    label: "Functional leader",
    winner: "Claude Fable 5",
    score: "90.35%",
    detail: "Rank #1 on Vibe Code Bench v1.1, updated August 13.",
  },
  {
    label: "Open-weight leader",
    winner: "Kimi K3",
    score: "Arena #2",
    detail: "The first open-weight model in the current Vibe Code Bench top tier.",
  },
  {
    label: "Best value band",
    winner: "Gemini 3.7 Flash",
    score: "$3.57/M out",
    detail: "Lowest Arena-listed output price among eligible top-10 models.",
  },
  {
    label: "Best OpenAI row",
    winner: "GPT-5.6 Sol",
    score: "Arena #7",
    detail: "The score uses xhigh effort through the Codex harness.",
  },
  {
    label: "Freshness rule",
    winner: "Checked August boards",
    score: "13–18 Aug",
    detail: "Unavailable and stale boards are excluded from recommendation ranking.",
  },
];

const BENCHMARK_EVIDENCE_ROWS: BenchmarkEvidenceRow[] = [
  {
    benchmark: "Arena Frontend Code",
    freshness: `Updated ${ARENA_FRONTEND_WEBDEV_UPDATED_ON}; ${ARENA_FRONTEND_WEBDEV_TOTAL_VOTES.toLocaleString("en-AU")} votes across ${ARENA_FRONTEND_WEBDEV_MODEL_COUNT} models`,
    measures: "Anonymous pairwise human preference over generated front ends.",
    leader: `${ARENA_LEADER.label}: #${ARENA_LEADER.rank} at ${ARENA_LEADER.score} ±${ARENA_LEADER.confidence}`,
    kimi: arenaSummary("kimi-k3"),
    registryUse: "Primary source for front-end recommendations; scores are not blended.",
    source: "Arena",
    sourceUrl: ARENA_FRONTEND_WEBDEV_SOURCE_URL,
  },
  {
    benchmark: "Vals Index v2",
    freshness: "Updated Aug 14, 2026",
    measures:
      "A broader GDP-weighted mix of finance, coding, and legal tasks that includes Vibe Code Bench.",
    leader: "Claude Opus 5: #1 at 67.21%",
    kimi: "Included, but this composite is not used as a front-end rank",
    registryUse: "Broad capability context only; not numerically combined with Arena.",
    source: "Vals AI",
    sourceUrl: "https://www.vals.ai/benchmarks/vals_index",
  },
  {
    benchmark: "Vibe Code Bench v1.1 — full table",
    freshness: "Updated Aug 13, 2026",
    measures:
      "End-to-end web applications tested through build checks and point-and-click workflows.",
    leader: "Claude Fable 5: #1 at 90.35%; Claude Opus 5: #2 at 88.40%",
    kimi: "Kimi K3: #3 and the leading open-weight model",
    registryUse: "Independent functional corroboration; not numerically combined with Arena.",
    source: "Vals AI",
    sourceUrl: "https://www.vals.ai/benchmarks/vibe-code",
  },
  {
    benchmark: "ByteDance Web-Bench (excluded)",
    freshness: "Newest visible result files are from Jun 2025; last Space commit Jul 23, 2025",
    measures:
      "Sequential feature work across 50 web projects, but with an obsolete model roster.",
    leader: "Roster tops out at 2025-era Claude, Gemini, and Kimi models",
    kimi: "K3 is not present",
    registryUse: "Excluded from the checked ranking because the public board is stale.",
    source: "ByteDance Research",
    sourceUrl:
      "https://huggingface.co/spaces/bytedance-research/Web-Bench-Leaderboard",
  },
];

export function webdevBenchmarkHtml(now = new Date()): string {
  const fresh = webdevEvidenceIsFresh(now);
  return String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fresh ? "Front-End Web Development AI Model Evidence" : "Front-End Web Development Evidence Refresh Required"}</title>
  <meta name="description" content="${fresh ? "Current Arena and Vibe Code Bench evidence for AI front-end development, with incompatible scores kept separate." : "Historical front-end development benchmark snapshot excluded from recommendations until refreshed."}">
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
        <h1>Front-End Web Development Model Evidence</h1>
        <p class="lede">${fresh ? "Checked human-preference and functional web-app snapshots, kept separate and freshness-labeled so old model data does not drive recommendations." : `The last checked Arena snapshot is older than ${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS} days. It is now historical and excluded from API recommendations until refreshed.`}</p>
      </div>
      <aside class="index-panel" aria-label="${fresh ? "Checked snapshot leader" : "Freshness status"}">
        ${fresh ? String.raw`
        <span class="index-label">Checked Arena snapshot leader</span>
        <strong class="index-model">${escapeHtml(ARENA_LEADER.label)}</strong>
        <p>Ranked #${ARENA_LEADER.rank} in the checked August 15 Arena snapshot. Vibe Code Bench independently ranks Claude Fable 5 first and Claude Opus 5 second on functional full-app tests.</p>
        <div class="index-score">
          <span class="pill">Arena ${ARENA_LEADER.score} ±${ARENA_LEADER.confidence}</span>
          <span class="pill">${ARENA_LEADER.votes.toLocaleString("en-AU")} votes</span>
          <span class="pill">${ARENA_LEADER.preliminary ? "preliminary" : "established"}</span>
          <span class="pill">VCB #2</span>
          <span class="pill">Source checked ${escapeHtml(ARENA_FRONTEND_WEBDEV_CHECKED_AT)}</span>
        </div>
        ` : String.raw`
        <span class="index-label">Freshness gate expired</span>
        <strong class="index-model">Refresh required</strong>
        <p>No front-end model is presented as the current winner from this snapshot. The historical rows below remain visible for audit only.</p>
        <div class="index-score">
          <span class="pill">Historical snapshot</span>
          <span class="pill">Arena checked ${escapeHtml(ARENA_FRONTEND_WEBDEV_CHECKED_AT)}</span>
          <span class="pill">${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS}-day maximum age</span>
        </div>
        `}
      </aside>
    </section>

    <section class="signal-grid" aria-label="Winning signals">
      ${fresh ? SIGNAL_CARDS.map(renderSignalCard).join("\n") : String.raw`<div class="signal">
        <span>Freshness gate</span>
        <strong>Historical only</strong>
        <b>Refresh required</b>
        <p>The API has stopped ingesting this Arena snapshot, so its old ranking cannot drive recommendations.</p>
      </div>`}
    </section>

    <p class="note">${fresh ? "Arena Frontend Code is the only score used for the registry recommendation because it directly ranks front-end preference. Vibe Code Bench supplies a separate functional full-app cross-check. The previous DesignArena URL is unavailable, and stale boards are excluded. These incompatible scores are not blended." : `This snapshot no longer feeds the registry. Arena must be rechecked and the extract redeployed before front-end recommendations resume; the ${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS}-day gate fails closed.`}</p>

    <h2>${fresh ? "Evidence Profiles — Not A Composite Rank" : "Historical Evidence Profiles — Excluded From Ranking"}</h2>
    <div class="tabs" aria-label="Leaderboard views">
      <span class="tab active">${fresh ? "Checked evidence" : "Historical evidence"}</span>
      <span class="tab">Scores kept separate</span>
      <span class="tab">Freshness checked</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>${fresh ? "Checked snapshot read" : "Historical snapshot"}</th>
            <th>Arena Frontend</th>
            <th>Vals Index VCB</th>
            <th>Full VCB v1.1</th>
            <th>Other source status</th>
            <th>Practical verdict</th>
          </tr>
        </thead>
        <tbody>
          ${WINNER_ROWS.map((row) => renderWinnerRow(row, !fresh)).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Benchmark Breakdown</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>Freshness</th>
            <th>What it measures</th>
            <th>Snapshot leader</th>
            <th>K3 status</th>
            <th>Registry use</th>
          </tr>
        </thead>
        <tbody>
          ${BENCHMARK_EVIDENCE_ROWS.map((row) => renderEvidenceRow(row, !fresh)).join("\n")}
        </tbody>
      </table>
    </div>

    <h2>Method</h2>
    <section class="method" aria-label="Scoring method">
      <div>
        <strong>Freshness first</strong>
        <p>${fresh ? `Exclude stale public boards and stop ingesting the checked Arena snapshot after ${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS} days.` : `The ${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS}-day gate has expired, so this snapshot is historical until refreshed.`}</p>
      </div>
      <div>
        <strong>Keep harnesses explicit</strong>
        <p>Human preference and functional full-app tests are related but not interchangeable.</p>
      </div>
      <div>
        <strong>One primary rank</strong>
        <p>${fresh ? "The API follows Arena score and rank; other dated boards are corroboration, never hidden inputs to a composite." : "When refreshed, the API follows Arena score and rank; other boards remain separate corroboration."}</p>
      </div>
      <div>
        <strong>Missing rows stay visible</strong>
        <p>If a checked board has not evaluated K3, the page says so instead of borrowing an older Kimi or generic coding result.</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function renderSignalCard(row: SignalCard): string {
  return String.raw`<div class="signal">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.winner)}</strong>
        <b>${escapeHtml(row.score)}</b>
        <p>${escapeHtml(row.detail)}</p>
      </div>`;
}

function renderWinnerRow(row: WinnerRow, historical = false): string {
  return String.raw`<tr>
            <td><span class="model">${escapeHtml(row.model)}</span><span class="provider">${escapeHtml(row.provider)}</span></td>
            <td>${escapeHtml(historical ? "Historical evidence profile" : row.headline)}</td>
            <td>${escapeHtml(row.arena)}</td>
            <td>${escapeHtml(row.valsIndex)}</td>
            <td>${escapeHtml(row.fullVcb)}</td>
            <td>${escapeHtml(row.designArena)}</td>
            <td>${escapeHtml(historical ? "Historical context only; do not use as a current recommendation." : row.verdict)}</td>
          </tr>`;
}

function renderEvidenceRow(
  row: BenchmarkEvidenceRow,
  historical = false,
): string {
  return String.raw`<tr>
            <td><strong>${escapeHtml(row.benchmark)}</strong><br><a class="source-link" href="${escapeAttribute(row.sourceUrl)}">${escapeHtml(row.source)}</a></td>
            <td>${escapeHtml(row.freshness)}</td>
            <td>${escapeHtml(row.measures)}</td>
            <td>${escapeHtml(row.leader)}</td>
            <td>${escapeHtml(row.kimi)}</td>
            <td>${escapeHtml(historical ? "Historical snapshot only; excluded until refreshed." : row.registryUse)}</td>
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
