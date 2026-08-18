import {
  ARENA_FRONTEND_WEBDEV_CHECKED_AT,
  ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS,
  ARENA_FRONTEND_WEBDEV_MODELS,
  ARENA_FRONTEND_WEBDEV_SOURCE_URL,
  ARENA_FRONTEND_WEBDEV_UPDATED_ON,
} from "./generated/arena-frontend-webdev";

type ModelRow = {
  model: string;
  provider: string;
  arena: string;
  vibe: string;
  label: string;
};

const ARENA_LEADER = ARENA_FRONTEND_WEBDEV_MODELS[0];

function webdevEvidenceIsFresh(now: Date): boolean {
  const checkedAtMs = Date.parse(ARENA_FRONTEND_WEBDEV_CHECKED_AT);
  const ageMs = now.getTime() - checkedAtMs;
  return (
    Number.isFinite(checkedAtMs) &&
    Number.isFinite(now.getTime()) &&
    ageMs >= 0 &&
    ageMs <= ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  );
}

function arenaSummary(registryModelId: string): string {
  const rows = ARENA_FRONTEND_WEBDEV_MODELS.filter(
    (row) => row.registryModelId === registryModelId,
  );
  if (!rows.length) return "—";
  return rows
    .map(
      (row) =>
        `#${row.rank} · ${row.score} ±${row.confidence} · ${row.configuration?.displayLabel ?? "base"}${row.preliminary ? " · preliminary" : ""}`,
    )
    .join(" / ");
}

const MODEL_ROWS: ModelRow[] = [
  {
    model: "Claude Opus 5",
    provider: "Anthropic",
    arena: arenaSummary("claude-opus-5"),
    vibe: "#2 · 88.40%",
    label: "Best",
  },
  {
    model: "Kimi K3",
    provider: "Moonshot AI",
    arena: arenaSummary("kimi-k3"),
    vibe: "#3",
    label: "Open weight",
  },
  {
    model: "Grok 4.6",
    provider: "xAI",
    arena: arenaSummary("grok-4.6"),
    vibe: "Listed",
    label: "xAI",
  },
  {
    model: "Claude Fable 5",
    provider: "Anthropic",
    arena: arenaSummary("claude-fable-5"),
    vibe: "#1 · 90.35%",
    label: "Functional",
  },
  {
    model: "GPT-5.6 Sol",
    provider: "OpenAI",
    arena: arenaSummary("gpt-5.6-sol"),
    vibe: "Top group",
    label: "OpenAI",
  },
  {
    model: "Gemini 3.7 Flash",
    provider: "Google",
    arena: arenaSummary("gemini-3.7-flash"),
    vibe: "Listed",
    label: "Value",
  },
];

export function webdevBenchmarkHtml(now = new Date()): string {
  const fresh = webdevEvidenceIsFresh(now);
  return String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fresh ? "Best AI Models for Front-End Web Development" : "Front-End Model Snapshot Expired"}</title>
  <meta name="description" content="Current Arena and Vibe Code Bench results for front-end model selection.">
  <style>
    :root {
      --ink: #111;
      --muted: #6b6b68;
      --line: #deded8;
      --paper: #fafaf7;
      --accent: #315efb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.4;
    }
    a { color: inherit; text-underline-offset: 3px; }
    a:hover { color: var(--accent); }
    main {
      width: min(1040px, calc(100% - 40px));
      margin: 0 auto;
      padding-bottom: 64px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 64px;
      border-bottom: 1px solid var(--line);
      font-size: 13px;
    }
    .brand { font-weight: 650; text-decoration: none; }
    nav { display: flex; gap: 20px; }
    nav a { color: var(--muted); text-decoration: none; }
    nav a[aria-current="page"] { color: var(--ink); }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 40px;
      align-items: end;
      padding: 88px 0 72px;
    }
    .eyebrow {
      margin: 0 0 16px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      max-width: 720px;
      font-size: clamp(48px, 8vw, 88px);
      font-weight: 650;
      letter-spacing: -.055em;
      line-height: .94;
    }
    .score {
      margin: 22px 0 0;
      color: var(--muted);
      font-size: 17px;
    }
    .score strong { color: var(--ink); font-weight: 600; }
    .hero-links {
      display: grid;
      gap: 10px;
      min-width: 150px;
      font-size: 13px;
    }
    .hero-links a { text-decoration: none; }
    .hero-links a::after { content: " ↗"; color: var(--muted); }
    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: baseline;
      margin-bottom: 14px;
    }
    h2 { margin: 0; font-size: 18px; letter-spacing: -.02em; }
    .rule { margin: 0; color: var(--muted); font-size: 12px; }
    .table-wrap {
      overflow-x: auto;
      border-top: 1px solid var(--ink);
      border-bottom: 1px solid var(--line);
    }
    table { width: 100%; min-width: 720px; border-collapse: collapse; }
    th, td { padding: 18px 12px; border-bottom: 1px solid var(--line); text-align: left; }
    th:first-child, td:first-child { padding-left: 0; }
    th:last-child, td:last-child { padding-right: 0; text-align: right; }
    th {
      color: var(--muted);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    td { font-size: 13px; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: 0; }
    .model { display: block; font-size: 15px; font-weight: 650; }
    .provider { color: var(--muted); font-size: 11px; }
    .arena { font-variant-numeric: tabular-nums; }
    .tag {
      display: inline-block;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 8px;
      color: var(--muted);
      font-size: 10px;
      white-space: nowrap;
    }
    .sources {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 56px;
      padding-top: 20px;
      border-top: 1px solid var(--ink);
    }
    .source {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 12px;
      font-size: 12px;
    }
    .source span { color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
    .source p { margin: 0; }
    footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      margin-top: 36px;
      color: var(--muted);
      font-size: 11px;
    }
    @media (max-width: 720px) {
      main { width: min(1040px, calc(100% - 28px)); }
      header { min-height: 56px; }
      nav { gap: 12px; font-size: 12px; }
      .hero { grid-template-columns: 1fr; gap: 28px; padding: 64px 0 52px; }
      h1 { font-size: clamp(44px, 15vw, 68px); }
      .hero-links { grid-template-columns: auto auto; justify-content: start; }
      .section-head { align-items: flex-start; flex-direction: column; gap: 6px; }
      .table-wrap { overflow: visible; }
      table { min-width: 0; }
      thead { display: none; }
      tbody, tr, td { display: block; width: 100%; }
      tr {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px 14px;
        padding: 18px 0;
        border-bottom: 1px solid var(--line);
      }
      td, th, td:first-child, td:last-child {
        padding: 0;
        border: 0;
        text-align: left;
      }
      td:nth-child(1) { grid-column: 1; grid-row: 1; }
      td:nth-child(2), td:nth-child(3) { grid-column: 1 / -1; }
      td:nth-child(4) { grid-column: 2; grid-row: 1; text-align: right; }
      td:nth-child(2)::before, td:nth-child(3)::before {
        display: block;
        margin-bottom: 2px;
        color: var(--muted);
        font-size: 9px;
        font-weight: 650;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      td:nth-child(2)::before { content: "Arena"; }
      td:nth-child(3)::before { content: "Vibe"; }
      .sources { grid-template-columns: 1fr; gap: 18px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <a class="brand" href="/">ai.itsolver.au</a>
      <nav aria-label="Pages">
        <a href="/">Registry</a>
        <a href="/its">ITS</a>
        <a href="/webdev" aria-current="page">Web dev</a>
      </nav>
    </header>

    <section class="hero">
      <div>
        <p class="eyebrow">${fresh ? "Current Arena #1" : "Freshness gate expired"}</p>
        <h1>${fresh ? escapeHtml(ARENA_LEADER.label) : "Snapshot expired"}</h1>
        <p class="score">${fresh ? `<strong>${ARENA_LEADER.score} ±${ARENA_LEADER.confidence}</strong> · ${ARENA_LEADER.votes.toLocaleString("en-AU")} votes · ${ARENA_FRONTEND_WEBDEV_UPDATED_ON}` : `Older than ${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS} days · Historical evidence only`}</p>
      </div>
      <div class="hero-links">
        <a href="${escapeAttribute(ARENA_FRONTEND_WEBDEV_SOURCE_URL)}">Arena source</a>
        <a href="/v1/models/recommend?tier=best&amp;useCase=front-end-web-dev">Recommendation API</a>
      </div>
    </section>

    <section aria-labelledby="models-title">
      <div class="section-head">
        <h2 id="models-title">Front-end leaders</h2>
        <p class="rule">Arena ranks. Vibe Code Bench checks.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Arena Frontend</th>
              <th>Vibe Code Bench</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            ${MODEL_ROWS.map((row) => renderModelRow(row, !fresh)).join("\n")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="sources" aria-label="Benchmark sources">
      <div class="source">
        <span>Primary</span>
        <p><a href="${escapeAttribute(ARENA_FRONTEND_WEBDEV_SOURCE_URL)}">Arena Frontend Code</a><br>Human preference · updated 15 Aug</p>
      </div>
      <div class="source">
        <span>Check</span>
        <p><a href="https://www.vals.ai/benchmarks/vibe-code">Vibe Code Bench</a><br>Functional apps · updated 13 Aug</p>
      </div>
    </section>

    <footer>
      <span>Checked ${escapeHtml(ARENA_FRONTEND_WEBDEV_CHECKED_AT)}</span>
      <span>${ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS}-day freshness gate</span>
      <span>Scores are not blended</span>
      ${fresh ? "" : "<span>Historical snapshot only; excluded until refreshed.</span>"}
    </footer>
  </main>
</body>
</html>`;
}

function renderModelRow(row: ModelRow, historical: boolean): string {
  return String.raw`<tr>
            <td><span class="model">${escapeHtml(row.model)}</span><span class="provider">${escapeHtml(row.provider)}</span></td>
            <td class="arena">${escapeHtml(row.arena)}</td>
            <td>${escapeHtml(row.vibe)}</td>
            <td><span class="tag">${escapeHtml(historical ? "Historical" : row.label)}</span></td>
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
