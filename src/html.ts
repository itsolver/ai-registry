export const HOME_HTML = String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ai.itsolver.au - stop hardcoding model names</title>
  <meta name="description" content="A public IT Solver API that recommends current AI models from OpenAI, Google, xAI, and Anthropic.">
  <style>
    :root {
      --ink: #1a1a1a;
      --paper: #fdfcf7;
      --accent: #d4524a;
      --accent-warm: #e07238;
      --muted: #6b6b6b;
      --soft: #efece2;
      --soft-2: #e6e2d6;
      --line: #ddd8cc;
    }
    * { box-sizing: border-box; }
    body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      max-width: 912px;
      margin: 3rem auto;
      padding: 1.5rem;
      line-height: 1.65;
      color: var(--ink);
      background: var(--paper);
    }
    h1 {
      font-size: 2.35rem;
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin: 0 0 0.5rem;
    }
    h1 .blink { color: var(--accent); }
    h2 {
      color: var(--accent);
      margin-top: 2.5rem;
      font-size: 1.15rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h3 { font-size: 1rem; margin: 1.5rem 0 0.3rem; }
    a { color: var(--accent); }
    a:hover { background: var(--accent); color: var(--paper); text-decoration: none; }
    code {
      background: var(--soft);
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 0.95em;
    }
    pre {
      margin: 0;
      padding: 1rem 1.2rem;
      overflow-x: auto;
      border-radius: 6px;
      background: var(--ink);
      color: #f0eee5;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    pre code { background: none; color: inherit; padding: 0; }
    ul { padding-left: 1.4rem; }
    li { margin: 0.3rem 0; }
    select, input, button {
      font: inherit;
    }
    .tagline {
      font-size: 1.12rem;
      color: var(--muted);
      margin: 0 0 2rem;
    }
    .stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin: 1.2rem 0 2rem;
    }
    .stat {
      flex: 1;
      min-width: 130px;
      background: var(--soft);
      padding: 0.7rem 1rem;
      border-radius: 8px;
      border: 1px solid transparent;
    }
    .stat strong {
      display: block;
      font-size: 1.45rem;
      line-height: 1.2;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
    }
    .stat span {
      display: block;
      font-size: 0.72rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .endpoint {
      border-left: 3px solid var(--accent);
      padding: 0.4rem 0 0.4rem 1.2rem;
      margin: 1.4rem 0;
    }
    .endpoint code:first-child {
      font-weight: 700;
      font-size: 1.05em;
    }
    .pill {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 10px;
      background: #e8d8a0;
      color: var(--ink);
      font-size: 0.8rem;
    }
    .code-tabs { margin: 1.2rem 0; }
    .tab-bar { display: flex; gap: 0.3rem; }
    .tab {
      border: 0;
      border-radius: 6px 6px 0 0;
      padding: 0.34rem 1rem;
      background: #e0dbd2;
      color: #8a8278;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .tab.active {
      background: linear-gradient(110deg, #b83838 0%, #d4524a 45%, #e07238 100%);
      color: #fff;
    }
    .tab-panel pre { border-top-left-radius: 0; border-top-right-radius: 0; }
    .pre-wrap { position: relative; }
    .copy-btn {
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 5px;
      background: rgba(35,35,35,0.92);
      color: #b8b4ac;
      padding: 0.3rem 0.7rem;
      font-size: 0.7rem;
      cursor: pointer;
    }
    .copy-btn.done { color: #8bc34a; }
    .builder {
      margin: 1.5rem 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 10px;
      box-shadow: 0 6px 20px -8px rgba(0,0,0,0.08);
    }
    .builder-form {
      padding: 1.2rem 1.3rem 1.25rem;
      background: linear-gradient(180deg, #f7f4ec 0%, #f3eee4 100%);
    }
    .builder-intro {
      display: flex;
      gap: 0.45rem;
      align-items: center;
      margin: 0 0 1.05rem;
      color: var(--muted);
      font-size: 0.84rem;
    }
    .builder-intro::before { content: '*'; color: var(--accent); font-weight: 700; }
    .builder-controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem 1rem;
    }
    .b-field {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 0.3rem;
    }
    .b-field[hidden] { display: none; }
    .range-field { grid-column: 1 / -1; }
    .range-group {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.9rem;
    }
    .range-group[hidden] { display: none; }
    .range-group .b-field {
      min-width: 0;
    }
    .b-field label {
      color: #9a9286;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .b-field select,
    .b-field input {
      width: 100%;
      min-height: 38px;
      border: 1px solid #d4cfc4;
      border-radius: 6px;
      background: var(--paper);
      color: var(--ink);
      padding: 0.5rem 0.65rem;
      font-size: 0.88rem;
    }
    .check-field {
      justify-content: flex-end;
    }
    .check-row {
      display: flex;
      min-height: 38px;
      align-items: center;
      gap: 0.5rem;
      color: var(--ink);
      font-size: 0.82rem;
    }
    .check-row input {
      width: 16px;
      min-height: 16px;
      accent-color: var(--accent);
    }
    .price-filter-card {
      border: 1px solid #d4cfc4;
      border-radius: 8px;
      background: var(--paper);
      padding: 0.6rem 0.7rem 0.55rem;
    }
    .compact-filter {
      padding: 0.5rem 0.6rem 0.45rem;
    }
    .price-filter-top,
    .price-filter-scale {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .price-filter-top strong {
      color: var(--ink);
      font-size: 0.88rem;
    }
    .compact-filter .price-filter-top strong {
      font-size: 0.78rem;
    }
    .price-filter-top button {
      border: 1px solid #d4cfc4;
      border-radius: 999px;
      background: #f7f4ec;
      color: var(--muted);
      cursor: pointer;
      padding: 0.18rem 0.5rem;
      font: inherit;
      font-size: 0.72rem;
    }
    .price-filter-card input[type="range"] {
      width: 100%;
      min-height: 24px;
      margin: 0.45rem 0 0.25rem;
      padding: 0;
      border: 0;
      background: transparent;
      accent-color: var(--accent);
    }
    .range-stack {
      position: relative;
      min-height: 30px;
      margin: 0.45rem 0 0.25rem;
      cursor: pointer;
      --range-start: 0%;
      --range-end: 100%;
      background:
        linear-gradient(
          to right,
          #d4cfc4 0%,
          #d4cfc4 var(--range-start),
          var(--accent) var(--range-start),
          var(--accent) var(--range-end),
          #d4cfc4 var(--range-end),
          #d4cfc4 100%
        )
        center / 100% 4px no-repeat;
    }
    .range-stack input[type="range"] {
      position: absolute;
      inset: 0;
      margin: 0;
      pointer-events: none;
    }
    .range-stack input[type="range"]::-webkit-slider-thumb { pointer-events: auto; }
    .range-stack input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
    .range-stack input[type="range"]::-moz-range-thumb { pointer-events: auto; }
    .range-stack input[type="range"]::-moz-range-track { background: transparent; }
    .price-filter-scale {
      color: var(--muted);
      font-size: 0.68rem;
    }
    .builder-dark { background: #0e0e0e; }
    .builder-url {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #1f1d1c;
      background: #0a0a0a;
    }
    .builder-method {
      align-self: center;
      padding: 0.7rem 0 0.7rem 1rem;
      color: #777;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .builder-url-text {
      flex: 1;
      min-width: 0;
      padding: 0.65rem 0.75rem;
      overflow-x: auto;
    }
    .builder-url-text a {
      display: inline-block;
      white-space: nowrap;
      color: #d8d4cc;
      text-decoration: none;
      font-size: 0.78rem;
    }
    .builder-actions {
      display: flex;
      gap: 0.3rem;
      align-items: center;
      padding: 0.5rem 0.6rem 0.5rem 0.3rem;
    }
    .builder-action {
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 5px;
      background: rgba(255,255,255,0.06);
      color: #aaa;
      padding: 0.32rem 0.65rem;
      font-size: 0.7rem;
      text-decoration: none;
      cursor: pointer;
    }
    .builder-result {
      display: flex;
      gap: 0.55rem;
      align-items: center;
      flex-wrap: wrap;
      border-top: 1px dashed var(--line);
      background: linear-gradient(180deg, #f3eee4 0%, #ede7da 100%);
      padding: 0.7rem 1rem 0.75rem;
      color: var(--muted);
      font-size: 0.78rem;
    }
    .definitions {
      margin: 1.35rem 0 2.2rem;
      padding: 1rem 1.1rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f6f2e9;
    }
    .definitions h3 {
      margin: 0 0 0.75rem;
      color: var(--ink);
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .definitions dl {
      display: grid;
      grid-template-columns: minmax(120px, 0.34fr) 1fr;
      gap: 0.55rem 0.9rem;
      margin: 0;
      font-size: 0.78rem;
    }
    .definitions dt {
      color: #4c4741;
      font-weight: 700;
    }
    .definitions dd {
      margin: 0;
      color: var(--muted);
    }
    .voice-bench {
      margin: 1.5rem 0 2.2rem;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #f6f2e9;
    }
    .voice-head {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.78rem;
    }
    .voice-head strong { color: var(--ink); }
    .voice-head-meta {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .voice-table-wrap { overflow-x: auto; }
    .voice-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.78rem;
    }
    .voice-table th,
    .voice-table td {
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid var(--line);
      text-align: right;
      white-space: nowrap;
    }
    .voice-table th:first-child,
    .voice-table td:first-child {
      min-width: 220px;
      text-align: left;
      white-space: normal;
    }
    .voice-table th {
      color: #9a9286;
      cursor: pointer;
      font-size: 0.62rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      user-select: none;
    }
    .voice-table tr:last-child td { border-bottom: 0; }
    .voice-table .provider {
      color: var(--muted);
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .voice-table .not-rec {
      display: inline-block;
      margin-top: 0.2rem;
      color: #8d3b28;
      font-size: 0.68rem;
      letter-spacing: 0.02em;
    }
    .voice-table .note-cell {
      max-width: 220px;
      color: var(--muted);
      font-size: 0.72rem;
      line-height: 1.35;
      white-space: normal;
    }
    .voice-table .provider-focus.provider-openai td { background: #eef0f2; }
    .voice-table .provider-focus.provider-google td { background: #e8f4ec; }
    .voice-table .provider-focus.provider-xai td { background: #eeecfb; }
    .voice-table .provider-focus.provider-anthropic td { background: #f7eadf; }
    .voice-table .selected td {
      background: #dff4d8;
      box-shadow: inset 0 1px 0 rgba(63,140,60,0.2), inset 0 -1px 0 rgba(63,140,60,0.2);
    }
    .voice-table .empty {
      color: var(--muted);
      text-align: left;
    }
    .bench-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 2.2rem;
    }
    .bench-note {
      color: var(--muted);
      font-size: 0.78rem;
      margin-top: -0.7rem;
    }
    .benchmark-panels {
      margin-bottom: 2.2rem;
    }
    .benchmark-panel[hidden] {
      display: none;
    }
    .faq {
      margin: 1.2rem 0 2.2rem;
    }
    .faq h3 {
      margin-top: 1.1rem;
      margin-bottom: 0.2rem;
    }
    .faq p {
      margin-top: 0;
      color: var(--muted);
    }
    .pulse {
      width: 7px;
      height: 7px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #6bb96b;
    }
    .hint-label {
      color: #9a9286;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .footnote {
      color: var(--muted);
      font-size: 0.85rem;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px dashed var(--line);
    }
    .legal {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--line);
      color: #888;
      font-size: 0.75rem;
      line-height: 1.8;
    }
    @media (max-width: 600px) {
      body { margin: 1.5rem auto; padding: 1rem; }
      h1 { font-size: 1.85rem; }
      .tagline { font-size: 1.02rem; }
      .builder-controls { grid-template-columns: 1fr; }
      .range-group { grid-template-columns: 1fr; }
      .builder-url { flex-wrap: wrap; }
      .builder-url-text { width: 100%; padding-left: 1rem; }
      .builder-actions { width: 100%; justify-content: flex-end; padding: 0 0.6rem 0.55rem; }
      .definitions dl { grid-template-columns: 1fr; }
      .definitions dt { margin-top: 0.3rem; }
    }
  </style>
</head>
<body>
  <h1>ai<span class="blink">.</span>itsolver<span class="blink">.</span>au</h1>
  <p class="tagline">A public API that tells IT Solver projects which AI model to actually use, so model names stop getting hardcoded across repos.</p>

  <h2>The Problem</h2>
  <p>OpenAI ships a new model. Google ships a new model. Anthropic ships a new model. Your <code>config.ts</code> goes stale by lunchtime. You update it in fourteen places. You miss two.</p>
  <p>This API is the public source of truth.</p>

  <div class="stats">
    <div class="stat"><strong id="modelCount">-</strong><span>models tracked</span></div>
    <div class="stat"><strong id="activeCount">-</strong><span>active right now</span></div>
    <div class="stat"><strong id="providerCount">-</strong><span>providers</span></div>
  </div>

  <h2>Quick Start</h2>
  <div class="code-tabs" data-tabs>
    <div class="tab-bar">
      <button class="tab active" type="button" data-tab="curl">curl</button>
      <button class="tab" type="button" data-tab="js">javascript</button>
      <button class="tab" type="button" data-tab="python">python</button>
    </div>
    <div class="tab-panel pre-wrap" data-panel="curl"><pre><code>curl "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast"</code></pre></div>
    <div class="tab-panel pre-wrap" data-panel="js" hidden><pre><code>const res = await fetch('https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast');
const { recommendation } = await res.json();
console.log(recommendation.id);</code></pre></div>
    <div class="tab-panel pre-wrap" data-panel="python" hidden><pre><code>import requests

r = requests.get(
    'https://ai.itsolver.au/v1/models/recommend',
    params={'useCase': 'customer-support', 'tier': 'fast'}
)
print(r.json()['recommendation']['id'])</code></pre></div>
  </div>
  <p>Returns a benchmark-backed fast model for customer support. Cache it locally and keep a fallback in production clients.</p>

  <h2>Build Your Query</h2>
  <div class="builder">
    <div class="builder-form">
      <p class="builder-intro">Tell the registry what you need. It builds the URL and previews the current answer.</p>
      <div class="builder-controls">
        <div class="b-field">
          <label for="b-endpoint">I want to</label>
          <select id="b-endpoint">
            <option value="recommend">get a recommendation</option>
            <option value="models">browse all models</option>
          </select>
        </div>
        <div class="b-field">
          <label for="b-usecase">For use case</label>
          <select id="b-usecase">
            <option value="customer-support" selected>customer support</option>
            <option value="voice">voice</option>
            <option value="speech-to-text">speech to text</option>
          </select>
        </div>
        <div class="b-field">
          <label for="b-tier">Recommendation priority</label>
          <select id="b-tier">
            <option value="" selected>balanced</option>
            <option value="fast">lower Run AUD</option>
            <option value="best">highest score</option>
          </select>
        </div>
        <div class="b-field">
          <label for="b-provider">Provider</label>
          <select id="b-provider">
            <option value="">any</option>
            <option value="openai">openai</option>
            <option value="google">google</option>
            <option value="xai">xai</option>
            <option value="anthropic">anthropic</option>
            <option value="nvidia">nvidia</option>
            <option value="elevenlabs">elevenlabs</option>
            <option value="groq">groq</option>
          </select>
        </div>
        <div class="b-field">
          <label for="b-capability">Must have</label>
          <select id="b-capability">
            <option value="">any capability</option>
            <option value="vision">vision</option>
            <option value="reasoning">reasoning</option>
            <option value="pdf">pdf</option>
            <option value="toolCalling">tool calling</option>
            <option value="structuredOutput">structured output</option>
          </select>
        </div>
        <div class="b-field check-field" data-filter-scope="text">
          <label for="b-includeits">Benchmark source</label>
          <label class="check-row">
            <input type="checkbox" id="b-includeits" checked>
            <span>Include ITS benchmark</span>
          </label>
        </div>
        <div class="b-field" data-filter-scope="voice">
          <label for="b-audio-input-max-range">Max input audio AUD/hr</label>
          <input type="hidden" id="b-maxaudioinputcost">
          <div class="price-filter-card compact-filter">
            <div class="price-filter-top">
              <strong id="b-audioinputcost-label">Any input audio AUD/hr</strong>
              <button type="button" id="b-audioinputcost-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-audio-input-max-range" min="0" max="20" step="0.1" value="20" aria-label="Maximum input audio AUD per hour">
            </div>
            <div class="price-filter-scale">
              <span>$0</span>
              <span>$20+</span>
            </div>
          </div>
        </div>
        <div class="b-field" data-filter-scope="voice">
          <label for="b-maxaudiooutputcost">Max output audio AUD/hr</label>
          <input type="number" id="b-maxaudiooutputcost" min="0" step="0.1" placeholder="voice only">
        </div>
        <div class="b-field" data-filter-scope="speech-to-text">
          <label for="b-transcription-max-range">Max STT AUD/1k min</label>
          <input type="hidden" id="b-maxtranscriptioncost">
          <div class="price-filter-card compact-filter">
            <div class="price-filter-top">
              <strong id="b-transcriptioncost-label">Any STT AUD/1k min</strong>
              <button type="button" id="b-transcriptioncost-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-transcription-max-range" min="0" max="20" step="0.1" value="20" aria-label="Maximum speech to text AUD per 1000 minutes">
            </div>
            <div class="price-filter-scale">
              <span>$0</span>
              <span>$20+</span>
            </div>
          </div>
        </div>
        <div class="range-group" data-filter-scope="text">
        <div class="b-field" data-filter-scope="text">
          <label for="b-input-min-range">Input AUD/MTok range</label>
          <input type="hidden" id="b-mincost">
          <input type="hidden" id="b-maxcost">
          <div class="price-filter-card compact-filter">
            <div class="price-filter-top">
              <strong id="b-inputcost-label">Any input AUD</strong>
              <button type="button" id="b-inputcost-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-input-min-range" min="0" max="50" step="0.05" value="0" aria-label="Minimum input AUD per million tokens">
              <input type="range" id="b-input-max-range" min="0" max="50" step="0.05" value="50" aria-label="Maximum input AUD per million tokens">
            </div>
            <div class="price-filter-scale">
              <span>$0</span>
              <span>$50+</span>
            </div>
          </div>
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-output-min-range">Output AUD/MTok range</label>
          <input type="hidden" id="b-minoutputcost">
          <input type="hidden" id="b-maxoutputcost">
          <div class="price-filter-card compact-filter">
            <div class="price-filter-top">
              <strong id="b-outputcost-label">Any output AUD</strong>
              <button type="button" id="b-outputcost-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-output-min-range" min="0" max="75" step="0.05" value="0" aria-label="Minimum output AUD per million tokens">
              <input type="range" id="b-output-max-range" min="0" max="75" step="0.05" value="75" aria-label="Maximum output AUD per million tokens">
            </div>
            <div class="price-filter-scale">
              <span>$0</span>
              <span>$75+</span>
            </div>
          </div>
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-context-min-range">Context range</label>
          <input type="hidden" id="b-minctx">
          <input type="hidden" id="b-maxctx">
          <div class="price-filter-card compact-filter">
            <div class="price-filter-top">
              <strong id="b-context-label">Any context</strong>
              <button type="button" id="b-context-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-context-min-range" min="0" max="1200" step="25" value="0" aria-label="Minimum context window in thousands of tokens">
              <input type="range" id="b-context-max-range" min="0" max="1200" step="25" value="1200" aria-label="Maximum context window in thousands of tokens">
            </div>
            <div class="price-filter-scale">
              <span>0k</span>
              <span>1.2M+</span>
            </div>
          </div>
        </div>
        </div>
        <div class="b-field range-field" data-filter-scope="text">
          <label for="b-run-min-range">Run AUD range</label>
          <input type="hidden" id="b-minruncost">
          <input type="hidden" id="b-maxruncost">
          <div class="price-filter-card">
            <div class="price-filter-top">
              <strong id="b-runcost-label">Any Run AUD</strong>
              <button type="button" id="b-runcost-any">Any</button>
            </div>
            <div class="range-stack">
              <input type="range" id="b-run-min-range" min="0" max="8000" step="50" value="0" aria-label="Minimum Run AUD">
              <input type="range" id="b-run-max-range" min="0" max="8000" step="50" value="1300" aria-label="Maximum Run AUD">
            </div>
            <div class="price-filter-scale">
              <span>$0</span>
              <span>$8,000+</span>
            </div>
          </div>
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-minintelligence">Min intelligence</label>
          <input type="number" id="b-minintelligence" min="0" max="100" step="1" value="30">
        </div>
      </div>
    </div>
    <div class="builder-dark">
      <div class="builder-url">
        <span class="builder-method">GET</span>
        <div class="builder-url-text"><a id="b-url" href="/v1/models/recommend">/v1/models/recommend</a></div>
        <div class="builder-actions">
          <button class="builder-action" type="button" id="b-copy">copy</button>
          <a class="builder-action" id="b-open" href="/v1/models/recommend" target="_blank" rel="noopener">open</a>
        </div>
      </div>
      <div class="pre-wrap"><pre><code id="b-code">https://ai.itsolver.au/v1/models/recommend</code></pre></div>
    </div>
    <div class="builder-result">
      <span class="pulse" aria-hidden="true"></span>
      <span class="hint-label">live result</span>
      <code id="b-result">checking...</code>
    </div>
  </div>

  <h2 id="benchmarkTitle">Customer Support Benchmark</h2>
  <p class="bench-note" id="benchmarkHint">Customer support models are ranked for conservative ticket handling, instruction following, telecom workflow signal, output-token efficiency, and AUD output cost.</p>
  <div class="benchmark-panels">
    <div class="benchmark-panel" data-benchmark-panel="customer-support" hidden>
      <p class="bench-note">Customer support rows include cached Artificial Analysis signals plus IT Solver auto-close benchmark results where available. Live recommendations sort false positives first, then accuracy, then Run AUD/token efficiency.</p>
      <div class="voice-bench">
      <div class="voice-head">
        <strong>Customer support</strong>
        <div class="voice-head-meta">
          <label class="check-row" for="b-provider-table-only">
            <input type="checkbox" id="b-provider-table-only">
            <span>Only show selected provider</span>
          </label>
          <span id="supportSource">loading...</span>
        </div>
      </div>
      <div class="voice-table-wrap">
        <table class="voice-table">
          <thead>
            <tr>
              <th data-table="supportRows" data-sort="model">Model</th>
              <th data-table="supportRows" data-sort="score">Score</th>
              <th data-table="supportRows" data-sort="falsePositives">ITS FP</th>
              <th data-table="supportRows" data-sort="accuracy">ITS Acc</th>
              <th data-table="supportRows" data-sort="ifbench">IFBench</th>
              <th data-table="supportRows" data-sort="agentic">Agentic</th>
              <th data-table="supportRows" data-sort="intelligence">Intel</th>
              <th data-table="supportRows" data-sort="outputCost">Output AUD/MTok</th>
              <th data-table="supportRows" data-sort="runCost">Run AUD</th>
              <th data-table="supportRows" data-sort="note">ITS Notes</th>
            </tr>
          </thead>
          <tbody id="supportRows">
            <tr><td class="empty" colspan="10">loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
    <div class="benchmark-panel" data-benchmark-panel="voice" hidden>
      <p class="bench-note">Speech-to-speech models are ranked from the cached Artificial Analysis extract. For voice agents, the useful quadrant is high τ-Voice / speech reasoning with low input-audio cost and low time to first audio.</p>
      <div class="voice-bench">
        <div class="voice-head">
          <strong>Current voice candidates</strong>
          <span id="voiceSource">loading...</span>
        </div>
        <div class="voice-table-wrap">
          <table class="voice-table">
            <thead>
              <tr>
                <th data-table="voiceRows" data-sort="model">Model</th>
                <th data-table="voiceRows" data-sort="agentic">τ-Voice</th>
                <th data-table="voiceRows" data-sort="speech">Speech</th>
                <th data-table="voiceRows" data-sort="telecom">Telecom</th>
                <th data-table="voiceRows" data-sort="ttfa">TTFA</th>
                <th data-table="voiceRows" data-sort="inputCost">Input AUD/hr</th>
                <th data-table="voiceRows" data-sort="outputCost">Output AUD/hr</th>
              </tr>
            </thead>
            <tbody id="voiceRows">
              <tr><td class="empty" colspan="7">loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="benchmark-panel" data-benchmark-panel="speech-to-text" hidden>
      <p class="bench-note">Speech-to-text models are ranked from Artificial Analysis STT rows. Lower AA-WER is better; price is normalized to AUD per 1,000 minutes of audio.</p>
      <div class="voice-bench">
        <div class="voice-head">
          <strong>Current STT candidates</strong>
          <span id="sttSource">loading...</span>
        </div>
        <div class="voice-table-wrap">
          <table class="voice-table">
            <thead>
              <tr>
                <th data-table="sttRows" data-sort="model">Model</th>
                <th data-table="sttRows" data-sort="host">Provider/Host</th>
                <th data-table="sttRows" data-sort="wer">AA-WER</th>
                <th data-table="sttRows" data-sort="agenttalk">AgentTalk</th>
                <th data-table="sttRows" data-sort="voxpopuli">VoxPopuli</th>
                <th data-table="sttRows" data-sort="earnings">Earnings22</th>
                <th data-table="sttRows" data-sort="speed">Speed</th>
                <th data-table="sttRows" data-sort="cost">AUD/1k min</th>
              </tr>
            </thead>
            <tbody id="sttRows">
              <tr><td class="empty" colspan="8">loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="definitions" aria-labelledby="definitionsTitle">
    <h3 id="definitionsTitle">Definitions</h3>
    <dl>
      <dt>any tier</dt>
      <dd>No tier filter for <code>/v1/models</code>. For use-case recommendations, the default is balanced.</dd>
      <dt>fast</dt>
      <dd>For customer support, only affects tie-breaks after false positives and accuracy. For voice, prefers lower latency and lower audio cost. For speech to text, prefers higher speed factor.</dd>
      <dt>balanced</dt>
      <dd>The default. Customer support uses auto-close benchmark safety first, then accuracy, then Run AUD/token efficiency. Speech to text balances lower AA-WER, lower AUD/1k min, and speed.</dd>
      <dt>best</dt>
      <dd>Favors stronger benchmark scores only after customer-support safety and accuracy are tied. For speech to text, this prioritizes lower AA-WER.</dd>
      <dt>cost caps</dt>
      <dd>Maximum prices are hard filters, not scoring hints. If every benchmark-backed candidate is over the cap, the recommendation endpoint returns no model.</dd>
      <dt>AUD/MTok</dt>
      <dd>Australian dollars per million text tokens. Input is prompt/context cost; output is generated-token cost.</dd>
      <dt>voice AUD/hr</dt>
      <dd>Australian dollars per hour of speech-to-speech audio. Input audio uses the Artificial Analysis benchmark cost where available.</dd>
      <dt>STT AUD/1k min</dt>
      <dd>Australian dollars per 1,000 minutes of speech-to-text audio, converted from Artificial Analysis provider pricing where available.</dd>
      <dt>benchmark table</dt>
      <dd>The live recommendation for customer support, voice, or speech to text must appear in the matching table. No benchmark row means no use-case recommendation.</dd>
      <dt>IT Solver auto-close benchmark</dt>
      <dd>Our reopened-ticket classifier replay. Customer-support recommendations require this benchmark where available and rank false positives first because auto-closing unresolved tickets is the highest-risk error.</dd>
      <dt>false positives / accuracy</dt>
      <dd>False positives are unresolved tickets predicted as resolved. Accuracy is overall classifier correctness on the auto-close replay set.</dd>
      <dt>ITS columns</dt>
      <dd><code>ITS</code> marks IT Solver auto-close benchmark fields. <code>ITS FP</code>, <code>ITS Acc</code>, and <code>ITS Notes</code> come from our Zendesk ticket-classification replay, not Artificial Analysis.</dd>
      <dt>IFBench / Agentic / τ-Voice / TTFA</dt>
      <dd>IFBench measures instruction following, Agentic measures multi-step task performance, τ-Voice measures agentic voice performance, and TTFA is time to first audio.</dd>
      <dt>AA-WER / Speed</dt>
      <dd>AA-WER is Artificial Analysis word error rate for STT, where lower is better. Speed is input audio seconds transcribed per processing second.</dd>
    </dl>
  </div>

  <h2>Frequently Asked Questions</h2>
  <div class="faq" id="faqRows">
    <p>loading...</p>
  </div>

  <h2>Endpoints</h2>
  <p>All endpoints are available at <code>/v1/...</code>. Unprefixed endpoints mirror v1 for convenience.</p>

  <div class="endpoint">
    <code>GET /v1/health</code>
    <p>Returns service status, provider count, model count, and the catalog generation time.</p>
  </div>
  <div class="endpoint">
    <code>GET /v1/models</code>
    <p>Artificial Analysis benchmark candidates from OpenAI, Google, xAI, and Anthropic. Filter by provider, use case, and cost caps.</p>
  </div>
  <div class="endpoint">
    <code>GET /v1/models/recommend</code>
    <p>The opinionated endpoint. Apply filters and get one customer support or voice-appropriate model back.</p>
  </div>
  <div class="endpoint">
    <code>GET /v1/models/providers</code>
    <p>Provider summaries with active and total model counts.</p>
  </div>
  <div class="endpoint">
    <code>GET /v1/models/:provider/latest</code>
    <p>The latest non-deprecated model for a provider.</p>
  </div>

  <h2>Schema</h2>
  <div class="pre-wrap"><pre><code>{
  "generatedAt": "2026-05-21T13:03:34.674Z",
  "pricingCurrency": "AUD",
  "sourcePricingCurrency": "USD",
  "exchangeRate": {
    "base": "USD",
    "quote": "AUD",
    "rate": 1.4042
  },
  "recommendation": {
    "id": "claude-sonnet-4-6-adaptive",
    "provider": "anthropic",
    "name": "Claude Sonnet 4.6 (max)",
    "source": "artificialanalysis",
    "pricing": {
      "inputPerMTok": 5.2601,
      "outputPerMTok": 21.0405
    },
    "recommendable": true
  }
}</code></pre></div>

  <h2>Freshness</h2>
  <p>The Worker refreshes Artificial Analysis data every morning at 06:00 UTC and caches the normalized result at the edge.</p>

  <h2>Cost</h2>
  <p><span class="pill">$0.00-ish</span> - runs on Cloudflare Workers. Pricing data still belongs to the providers, so production cost decisions should verify current provider pricing directly.</p>

  <h2>Caveats</h2>
  <ul>
    <li>This public endpoint is maintained for IT Solver projects and shared as-is.</li>
    <li>OpenAI, Google, xAI, Anthropic, NVIDIA, ElevenLabs, and Groq are exposed.</li>
    <li>Each model includes AUD pricing converted from USD with the current cached Frankfurter exchange rate.</li>
    <li>Use-case recommendations require real token, audio, or transcription pricing before a row can be recommended.</li>
    <li>Customer support recommendations use IT Solver auto-close benchmark metrics first, then Artificial Analysis cost-efficiency signals. Voice and speech-to-text recommendations use the relevant Artificial Analysis benchmark-backed candidate sets.</li>
    <li>Always code a local fallback in client apps.</li>
  </ul>

  <p class="footnote">Last data refresh: <span id="generatedAt">checking...</span><br>Pricing shown as: <span id="pricingContext">checking...</span></p>

  <div class="legal">
    <p><strong>IT Solver AI Registry</strong>. Public service. Data is aggregated from Artificial Analysis and public provider information.</p>
    <p><strong>Disclaimer:</strong> Pricing and model availability change frequently. Verify model status and pricing with the provider before using this data for cost decisions or production rollouts.</p>
  </div>

  <script>
  (function () {
    var origin = window.location.origin;
    var fields = {
      endpoint: document.getElementById('b-endpoint'),
      tier: document.getElementById('b-tier'),
      provider: document.getElementById('b-provider'),
      providerTableOnly: document.getElementById('b-provider-table-only'),
      capability: document.getElementById('b-capability'),
      includeits: document.getElementById('b-includeits'),
      usecase: document.getElementById('b-usecase'),
      mincost: document.getElementById('b-mincost'),
      maxcost: document.getElementById('b-maxcost'),
      minoutputcost: document.getElementById('b-minoutputcost'),
      maxoutputcost: document.getElementById('b-maxoutputcost'),
      inputminrange: document.getElementById('b-input-min-range'),
      inputmaxrange: document.getElementById('b-input-max-range'),
      inputcostlabel: document.getElementById('b-inputcost-label'),
      inputcostany: document.getElementById('b-inputcost-any'),
      outputminrange: document.getElementById('b-output-min-range'),
      outputmaxrange: document.getElementById('b-output-max-range'),
      outputcostlabel: document.getElementById('b-outputcost-label'),
      outputcostany: document.getElementById('b-outputcost-any'),
      minruncost: document.getElementById('b-minruncost'),
      maxruncost: document.getElementById('b-maxruncost'),
      minintelligence: document.getElementById('b-minintelligence'),
      runminrange: document.getElementById('b-run-min-range'),
      runmaxrange: document.getElementById('b-run-max-range'),
      runcostlabel: document.getElementById('b-runcost-label'),
      runcostany: document.getElementById('b-runcost-any'),
      maxaudioinputcost: document.getElementById('b-maxaudioinputcost'),
      audioinputmaxrange: document.getElementById('b-audio-input-max-range'),
      audioinputcostlabel: document.getElementById('b-audioinputcost-label'),
      audioinputcostany: document.getElementById('b-audioinputcost-any'),
      maxaudiooutputcost: document.getElementById('b-maxaudiooutputcost'),
      maxtranscriptioncost: document.getElementById('b-maxtranscriptioncost'),
      transcriptionmaxrange: document.getElementById('b-transcription-max-range'),
      transcriptioncostlabel: document.getElementById('b-transcriptioncost-label'),
      transcriptioncostany: document.getElementById('b-transcriptioncost-any'),
      minctx: document.getElementById('b-minctx'),
      maxctx: document.getElementById('b-maxctx'),
      contextminrange: document.getElementById('b-context-min-range'),
      contextmaxrange: document.getElementById('b-context-max-range'),
      contextlabel: document.getElementById('b-context-label'),
      contextany: document.getElementById('b-context-any'),
      url: document.getElementById('b-url'),
      open: document.getElementById('b-open'),
      copy: document.getElementById('b-copy'),
      code: document.getElementById('b-code'),
      result: document.getElementById('b-result')
    };

    function formatAge(value) {
      var date = new Date(value);
      var seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (!Number.isFinite(seconds)) return value;
      if (seconds < 120) return 'just now';
      var minutes = Math.floor(seconds / 60);
      if (minutes < 60) return minutes + ' min ago';
      var hours = Math.floor(minutes / 60);
      if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
      var days = Math.floor(hours / 24);
      return days + (days === 1 ? ' day ago' : ' days ago');
    }

    function setText(id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function pct(value) {
      return typeof value === 'number' ? Math.round(value * 100) + '%' : '-';
    }

    function money(value) {
      return typeof value === 'number' && Number.isFinite(value) ? '$' + value.toFixed(2) : '-';
    }

    function seconds(value) {
      return typeof value === 'number' ? value.toFixed(2) + 's' : '-';
    }

    function score(value) {
      return typeof value === 'number' ? Math.round(value) : '-';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var benchmarkTables = {};
    var selectedBenchmark = { tableId: '', modelId: '' };
    var textBenchmarkModels = null;
    var textBenchmarkModelsWithoutIts = null;
    var voiceBenchmarkRows = null;
    var sttBenchmarkRows = null;
    var sttBenchmarkLoading = false;

    function sortValue(value) {
      return value === undefined || value === null || Number.isNaN(value) ? -Infinity : value;
    }

    function nonRecommendableReason(model) {
      if (model.recommendable !== false) return '';
      if (model.deprecated === true) return 'deprecated';

      var pricing = model.pricing || {};
      if (model.benchmarks && model.benchmarks.voice) {
        if (typeof pricing.benchmarkInputAudioPerHour !== 'number') return 'no audio pricing';
        if (typeof pricing.audioOutputPerHour !== 'number' && typeof pricing.benchmarkCostPerTask !== 'number') return 'no audio pricing';
      }
      if (model.benchmarks && model.benchmarks.speechToText) {
        if (typeof model.benchmarks.speechToText.aaWer !== 'number') return 'no STT score';
        if (typeof pricing.transcriptionCostPer1kMinutes !== 'number') return 'no STT pricing';
      }
      if (model.benchmarks && model.benchmarks.llm) {
        if (typeof pricing.inputPerMTok !== 'number' || typeof pricing.outputPerMTok !== 'number') return 'no token pricing';
      }

      return 'not eligible';
    }

    function renderModelCell(model) {
      var reason = nonRecommendableReason(model);
      var marker = reason ? '<span class="not-rec">' + escapeHtml(reason) + '</span>' : '';
      return '<strong>' + escapeHtml(model.name) + '</strong><div class="provider">' + escapeHtml(model.provider) + '</div>' + marker;
    }

    function benchmarkRowId(row) {
      var item = (row.model || row) || {};
      return item.id || item.registryModelId || '';
    }

    function benchmarkRowProvider(row) {
      var item = (row.model || row) || {};
      return item.provider || '';
    }

    function renderSortableTable(tableId, rows, columns, defaultSortKey, defaultDirection) {
      benchmarkTables[tableId] = {
        rows: rows,
        columns: columns,
        sortKey: defaultSortKey,
        direction: defaultDirection || 'desc',
        selectedId: selectedBenchmark.tableId === tableId ? selectedBenchmark.modelId : ''
      };
      renderSortableHeader(tableId, columns);
      drawSortableTable(tableId);
    }

    function renderSortableHeader(tableId, columns) {
      if (!columns.some(function (column) { return column.label; })) return;
      var tbody = document.getElementById(tableId);
      var header = tbody && tbody.closest('table').querySelector('thead tr');
      if (!header) return;
      header.innerHTML = columns.map(function (column) {
        return '<th data-table="' + tableId + '" data-sort="' + escapeHtml(column.key) + '">' + escapeHtml(column.label) + '</th>';
      }).join('');
    }

    function drawSortableTable(tableId) {
      var state = benchmarkTables[tableId];
      var tbody = document.getElementById(tableId);
      if (!state || !tbody) return;
      if (!state.rows.length) {
        var headerCount = tbody.closest('table').querySelectorAll('thead th').length;
        tbody.innerHTML = '<tr><td class="empty" colspan="' + (state.columns.length || headerCount || 1) + '">Benchmark data unavailable.</td></tr>';
        return;
      }

      var column = state.columns.find(function (item) { return item.key === state.sortKey; }) || state.columns[0];
      var direction = state.direction === 'asc' ? 1 : -1;
      var providerFilter = fields.provider.value;
      var visibleRows = providerFilter && fields.providerTableOnly.checked
        ? state.rows.filter(function (row) { return benchmarkRowProvider(row) === providerFilter; })
        : state.rows;
      if (!visibleRows.length) {
        var emptyCount = tbody.closest('table').querySelectorAll('thead th').length;
        tbody.innerHTML = '<tr><td class="empty" colspan="' + (state.columns.length || emptyCount || 1) + '">No benchmark rows match the selected provider.</td></tr>';
        return;
      }

      var sorted = visibleRows.slice().sort(function (left, right) {
        var a = sortValue(column.value(left));
        var b = sortValue(column.value(right));
        if (typeof a === 'string' || typeof b === 'string') {
          return String(a).localeCompare(String(b)) * direction;
        }
        return (a - b) * direction;
      });
	      tbody.innerHTML = sorted.map(function (row) {
	        var classes = [];
        var provider = benchmarkRowProvider(row);
        if (providerFilter && provider === providerFilter) {
          classes.push('provider-focus', 'provider-' + provider);
        }
	        if (benchmarkRowId(row) === state.selectedId) classes.push('selected');
	        return '<tr' + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + '>' +
          state.columns.map(function (item) {
            return '<td>' + item.render(row) + '</td>';
          }).join('') +
        '</tr>';
      }).join('');
    }

    function benchmarkTableForUseCase(useCase) {
      if (useCase === 'voice') return 'voiceRows';
      if (useCase === 'speech-to-text') return 'sttRows';
      if (useCase === 'customer-support') return 'supportRows';
      return '';
    }

    function benchmarkPanelForUseCase(useCase) {
      if (useCase === 'voice') return 'voice';
      if (useCase === 'speech-to-text') return 'speech-to-text';
      if (useCase === 'customer-support') return 'customer-support';
      return '';
    }

    function benchmarkCopy(useCase) {
      if (useCase === 'voice') {
        return {
          title: 'Voice Benchmark',
          hint: 'Voice models are ranked for speech-to-speech agents using τ-Voice, speech reasoning, telecom score, time to first audio, and AA benchmark input-audio cost.'
        };
      }
      if (useCase === 'speech-to-text') {
        return {
          title: 'Speech-To-Text Benchmark',
          hint: 'Speech-to-text models are ranked using AA-WER, AUD per 1,000 minutes, and speed factor. Use highest accuracy for lower AA-WER, real-time speed for speed factor, and the AUD/1k min cap for price.'
        };
      }
      return {
        title: 'Customer Support Benchmark',
        hint: 'Customer support models are ranked for conservative ticket handling, instruction following, telecom workflow signal, output-token efficiency, and AUD output cost.'
      };
    }

    function updateBenchmarkPanel(useCase) {
      var active = benchmarkPanelForUseCase(useCase);
      document.querySelectorAll('[data-benchmark-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-benchmark-panel') !== active;
      });
      var copy = benchmarkCopy(useCase);
      setText('benchmarkTitle', copy.title);
      var hint = document.getElementById('benchmarkHint');
      if (!hint) return;
      hint.textContent = copy.hint;
    }

    function updateTierOptions(useCase) {
      var labels = useCase === 'speech-to-text'
        ? {
          '': 'balanced trade-off',
          fast: 'real-time speed',
          best: 'highest accuracy'
        }
        : {
          '': 'balanced',
          fast: 'lower Run AUD',
          best: 'highest score'
        };
      Array.prototype.forEach.call(fields.tier.options, function (option) {
        option.textContent = labels[option.value] || option.textContent;
      });
    }

    function pricingContext(data) {
      if (data && data.exchangeRate) {
        var rate = Number(data.exchangeRate.rate).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
        var date = data.exchangeRate.date ? ', ' + data.exchangeRate.date : '';
        return data.pricingCurrency + ' converted from ' + data.sourcePricingCurrency + ' at 1 ' + data.sourcePricingCurrency + ' = ' + rate + ' ' + data.pricingCurrency + date;
      }
      return ((data && data.pricingCurrency) || 'USD') + ' with no FX conversion applied';
    }

    function updateFilterVisibility(useCase) {
      var activeScope = useCase === 'voice'
        ? 'voice'
        : useCase === 'speech-to-text'
          ? 'speech-to-text'
          : 'text';
      document.querySelectorAll('[data-filter-scope]').forEach(function (field) {
        var scope = field.getAttribute('data-filter-scope');
        field.hidden = scope !== activeScope;
      });
    }

    function highlightBenchmark(modelId, useCase) {
      selectedBenchmark = {
        tableId: benchmarkTableForUseCase(useCase),
        modelId: modelId || ''
      };
      Object.keys(benchmarkTables).forEach(function (tableId) {
        benchmarkTables[tableId].selectedId =
          tableId === selectedBenchmark.tableId ? selectedBenchmark.modelId : '';
        drawSortableTable(tableId);
      });
    }

    function redrawBenchmarkTables() {
      Object.keys(benchmarkTables).forEach(drawSortableTable);
    }

    function voiceCost(model) {
      var pricing = model.pricing || {};
      return pricing.benchmarkInputAudioPerHour || Infinity;
    }

    function voiceOutputCost(model) {
      var pricing = model.pricing || {};
      return pricing.audioOutputPerHour || voiceCost(model);
    }

    function voiceScore(model) {
      var voice = (model.benchmarks && model.benchmarks.voice) || {};
      var agentic = typeof voice.agenticPerformance === 'number' ? voice.agenticPerformance : 0;
      var speech = typeof voice.speechReasoning === 'number' ? voice.speechReasoning : 0;
      var telecom = typeof voice.telecomAgenticPerformance === 'number' ? voice.telecomAgenticPerformance : 0;
      var ttfa = typeof voice.timeToFirstAudioSeconds === 'number' ? Math.max(0, 1 - voice.timeToFirstAudioSeconds / 5) : 0;
      var cost = voiceCost(model);
      var costScore = Number.isFinite(cost) ? Math.max(0, 1 - Math.log1p(cost) / Math.log1p(20)) : 0;
      return agentic * 0.45 + speech * 0.25 + telecom * 0.1 + ttfa * 0.08 + costScore * 0.12;
    }

    function voiceBenchmarkModels(models) {
      return models.filter(function (model) {
        return model.recommendable !== false && model.benchmarks && model.benchmarks.voice;
      });
    }

    function renderVoiceBenchmarks(models) {
      var rows = voiceBenchmarkModels(models);
      if (!rows.length) {
        renderSortableTable('voiceRows', [], [], 'agentic');
        setText('voiceSource', 'unavailable');
        return;
      }

      var source = rows[0].benchmarks && rows[0].benchmarks.voice;
      if (source && source.extractedAt) {
        setText('voiceSource', 'AA extract ' + formatAge(source.extractedAt));
      }

      renderSortableTable('voiceRows', rows, [
        { key: 'model', value: function (model) { return model.name; }, render: renderModelCell },
        { key: 'agentic', value: function (model) { return ((model.benchmarks || {}).voice || {}).agenticPerformance; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).agenticPerformance); } },
        { key: 'speech', value: function (model) { return ((model.benchmarks || {}).voice || {}).speechReasoning; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).speechReasoning); } },
        { key: 'telecom', value: function (model) { return ((model.benchmarks || {}).voice || {}).telecomAgenticPerformance; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).telecomAgenticPerformance); } },
        { key: 'ttfa', value: function (model) { return -(((model.benchmarks || {}).voice || {}).timeToFirstAudioSeconds || Infinity); }, render: function (model) { return seconds(((model.benchmarks || {}).voice || {}).timeToFirstAudioSeconds); } },
        { key: 'inputCost', value: voiceCost, render: function (model) { return money(voiceCost(model)); } },
        { key: 'outputCost', value: voiceOutputCost, render: function (model) { return money(voiceOutputCost(model)); } }
      ], 'agentic', 'desc');
    }

    function sttSignals(model) {
      return ((model.benchmarks || {}).speechToText || {});
    }

    function sttCost(model) {
      var pricing = model.pricing || {};
      return pricing.transcriptionCostPer1kMinutes || Infinity;
    }

    function sttHost(model) {
      var signals = sttSignals(model);
      var host = signals.hostingProviderName || signals.hostingProviderSlug || '';
      return host && host.toLowerCase() !== String(model.provider || '').toLowerCase()
        ? model.provider + ' / ' + host
        : model.provider || host || '-';
    }

    function wer(value) {
      return typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) + '%' : '-';
    }

    function speedFactor(value) {
      return typeof value === 'number' ? value.toFixed(value < 100 ? 1 : 0) + 'x' : '-';
    }

    function speechToTextBenchmarkModels(models) {
      return models.filter(function (model) {
        return model.recommendable !== false && model.benchmarks && model.benchmarks.speechToText;
      });
    }

    function renderSpeechToTextBenchmarks(models) {
      var rows = speechToTextBenchmarkModels(models);
      if (!rows.length) {
        renderSortableTable('sttRows', [], [], 'wer', 'asc');
        setText('sttSource', 'unavailable');
        return;
      }

      var source = rows[0].benchmarks && rows[0].benchmarks.speechToText;
      if (source && source.extractedAt) {
        setText('sttSource', 'AA extract ' + formatAge(source.extractedAt));
      }

      renderSortableTable('sttRows', rows, [
        { key: 'model', value: function (model) { return model.name; }, render: renderModelCell },
        { key: 'host', value: sttHost, render: function (model) { return escapeHtml(sttHost(model)); } },
        { key: 'wer', value: function (model) { return sttSignals(model).aaWer; }, render: function (model) { return wer(sttSignals(model).aaWer); } },
        { key: 'agenttalk', value: function (model) { return sttSignals(model).agentTalkWer; }, render: function (model) { return wer(sttSignals(model).agentTalkWer); } },
        { key: 'voxpopuli', value: function (model) { return sttSignals(model).voxpopuliWer; }, render: function (model) { return wer(sttSignals(model).voxpopuliWer); } },
        { key: 'earnings', value: function (model) { return sttSignals(model).earnings22Wer; }, render: function (model) { return wer(sttSignals(model).earnings22Wer); } },
        { key: 'speed', value: function (model) { return sttSignals(model).speedFactor; }, render: function (model) { return speedFactor(sttSignals(model).speedFactor); } },
        { key: 'cost', value: sttCost, render: function (model) { return money(sttCost(model)); } }
      ], 'wer', 'asc');
    }

    function llmSignals(row) {
      return (((row.model || row || {}).benchmarks || {}).llm || {});
    }

    function outputCost(row) {
      return ((row.model || row || {}).pricing || {}).outputPerMTok;
    }

    function runCost(row) {
      return llmSignals(row).intelligenceRunTotalCost;
    }

    function autoCloseSignals(row) {
      return llmSignals(row).autoClose || {};
    }

    function falsePositiveRate(row) {
      var signals = autoCloseSignals(row);
      if (typeof signals.falsePositiveCount !== 'number' || typeof signals.total !== 'number' || signals.total <= 0) return undefined;
      return signals.falsePositiveCount / signals.total;
    }

    function falsePositiveLabel(row) {
      var signals = autoCloseSignals(row);
      if (typeof signals.falsePositiveCount !== 'number') return '-';
      return String(signals.falsePositiveCount) + (typeof signals.total === 'number' ? '/' + signals.total : '');
    }

    function accuracyLabel(row) {
      var accuracy = autoCloseSignals(row).accuracy;
      return typeof accuracy === 'number' ? Math.round(accuracy * 1000) / 10 + '%' : '-';
    }

    function autoCloseNote(row) {
      var signals = autoCloseSignals(row);
      if (!signals.source) return 'No auto-close benchmark yet';
      var bits = [];
      if (typeof signals.parseSuccessRate === 'number') bits.push('parse ' + Math.round(signals.parseSuccessRate * 1000) / 10 + '%');
      if (typeof signals.invalidCount === 'number' && signals.invalidCount > 0) bits.push(String(signals.invalidCount) + ' invalid');
      if (typeof signals.errorCount === 'number' && signals.errorCount > 0) bits.push(String(signals.errorCount) + ' errors');
      if (signals.availability && signals.availability.status && signals.availability.status !== 'production') bits.push(signals.availability.status);
      return bits.length ? bits.join('; ') : 'Auto-close benchmarked';
    }

    function formatMoneyCap(value, isMax, max) {
      if (isMax && value >= max) return '$' + max.toLocaleString() + '+';
      return '$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    function formatContextCap(value, isMax, max) {
      if (isMax && value >= max) return (max / 1000).toFixed(1).replace(/\.0$/, '') + 'M+';
      if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'M';
      return Math.round(value) + 'k';
    }

    function syncDualRange(config) {
      var min = Number(config.minRange.value);
      var max = Number(config.maxRange.value);
      if (!Number.isFinite(min)) min = config.min;
      if (!Number.isFinite(max)) max = config.max;
      if (min > max) {
        var active = document.activeElement === config.minRange ? 'min' : 'max';
        if (active === 'min') max = min;
        else min = max;
        config.minRange.value = String(min);
        config.maxRange.value = String(max);
      }
      config.hiddenMin.value = min > config.min ? String(min) : '';
      config.hiddenMax.value = max < config.max ? String(max) : '';
      config.label.textContent =
        min === config.min && max >= config.max
          ? config.anyLabel
          : config.format(min, false, config.max) + ' - ' + config.format(max, true, config.max);
      updateRangeFill(config, min, max);
    }

    function updateRangeFill(config, min, max) {
      var stack = config.minRange.parentElement;
      if (!stack) return;
      var span = config.max - config.min;
      var start = span > 0 ? ((min - config.min) / span) * 100 : 0;
      var end = span > 0 ? ((max - config.min) / span) * 100 : 100;
      stack.style.setProperty('--range-start', Math.min(Math.max(start, 0), 100) + '%');
      stack.style.setProperty('--range-end', Math.min(Math.max(end, 0), 100) + '%');
    }

    function resetDualRange(config) {
      config.minRange.value = String(config.min);
      config.maxRange.value = String(config.max);
      syncDualRange(config);
      refreshBuilder();
    }

    function syncMaxRange(config) {
      var max = Number(config.maxRange.value);
      if (!Number.isFinite(max)) max = config.max;
      max = Math.min(config.max, Math.max(config.min, max));
      config.maxRange.value = String(max);
      config.hiddenMax.value = max < config.max ? String(max) : '';
      config.label.textContent = max >= config.max
        ? config.anyLabel
        : 'Up to ' + config.format(max, true, config.max);
      updateMaxRangeFill(config, max);
    }

    function updateMaxRangeFill(config, max) {
      var stack = config.maxRange.parentElement;
      if (!stack) return;
      var span = config.max - config.min;
      var end = span > 0 ? ((max - config.min) / span) * 100 : 100;
      stack.style.setProperty('--range-start', '0%');
      stack.style.setProperty('--range-end', Math.min(Math.max(end, 0), 100) + '%');
    }

    function resetMaxRange(config) {
      config.maxRange.value = String(config.max);
      syncMaxRange(config);
      refreshBuilder();
    }

    function decimalPlaces(value) {
      var text = String(value);
      var exponent = text.match(/e-(\d+)$/);
      if (exponent) return Number(exponent[1]);
      var decimal = text.indexOf('.');
      return decimal === -1 ? 0 : text.length - decimal - 1;
    }

    function steppedRangeValue(config, clientX) {
      var rect = config.minRange.parentElement.getBoundingClientRect();
      var pct = rect.width > 0 ? Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) : 0;
      var step = Number(config.minRange.step) || 1;
      var raw = config.min + pct * (config.max - config.min);
      var stepped = Math.round((raw - config.min) / step) * step + config.min;
      var places = decimalPlaces(step);
      return Math.min(config.max, Math.max(config.min, Number(stepped.toFixed(places))));
    }

    function closestRangeInput(config, value) {
      var minValue = Number(config.minRange.value);
      var maxValue = Number(config.maxRange.value);
      var minDistance = Math.abs(value - minValue);
      var maxDistance = Math.abs(value - maxValue);
      if (minDistance === maxDistance) {
        return value <= (minValue + maxValue) / 2 ? config.minRange : config.maxRange;
      }
      return minDistance < maxDistance ? config.minRange : config.maxRange;
    }

    function moveDualRangeThumb(config, input, clientX) {
      input.focus();
      input.value = String(steppedRangeValue(config, clientX));
      syncDualRange(config);
      refreshBuilder();
    }

    function moveMaxRangeThumb(config, clientX) {
      config.maxRange.focus();
      config.maxRange.value = String(steppedRangeValue({
        min: config.min,
        max: config.max,
        minRange: config.maxRange,
        maxRange: config.maxRange
      }, clientX));
      syncMaxRange(config);
      refreshBuilder();
    }

    function installDualRangePointer(config) {
      var stack = config.minRange.parentElement;
      if (!stack) return;
      stack.addEventListener('pointerdown', function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        var value = steppedRangeValue(config, event.clientX);
        var input = closestRangeInput(config, value);
        event.preventDefault();
        stack.setPointerCapture(event.pointerId);
        moveDualRangeThumb(config, input, event.clientX);

        function onPointerMove(moveEvent) {
          moveDualRangeThumb(config, input, moveEvent.clientX);
        }

        function onPointerUp(upEvent) {
          stack.releasePointerCapture(upEvent.pointerId);
          stack.removeEventListener('pointermove', onPointerMove);
          stack.removeEventListener('pointerup', onPointerUp);
          stack.removeEventListener('pointercancel', onPointerUp);
        }

        stack.addEventListener('pointermove', onPointerMove);
        stack.addEventListener('pointerup', onPointerUp);
        stack.addEventListener('pointercancel', onPointerUp);
      });
    }

    function installMaxRangePointer(config) {
      var stack = config.maxRange.parentElement;
      if (!stack) return;
      stack.addEventListener('pointerdown', function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        stack.setPointerCapture(event.pointerId);
        moveMaxRangeThumb(config, event.clientX);

        function onPointerMove(moveEvent) {
          moveMaxRangeThumb(config, moveEvent.clientX);
        }

        function onPointerUp(upEvent) {
          stack.releasePointerCapture(upEvent.pointerId);
          stack.removeEventListener('pointermove', onPointerMove);
          stack.removeEventListener('pointerup', onPointerUp);
          stack.removeEventListener('pointercancel', onPointerUp);
        }

        stack.addEventListener('pointermove', onPointerMove);
        stack.addEventListener('pointerup', onPointerUp);
        stack.addEventListener('pointercancel', onPointerUp);
      });
    }

    function formatRunCostCap(value, isMax, max) {
      if (isMax && value >= 8000) return '$8,000+';
      return '$' + Math.round(value).toLocaleString();
    }

    function formatAudioCostCap(value, isMax, max) {
      if (isMax && value >= max) return '$' + max.toLocaleString() + '+';
      return '$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
    }

    function formatTranscriptionCostCap(value, isMax, max) {
      if (isMax && value >= max) return '$' + max.toLocaleString() + '+';
      return '$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    var inputCostRange;
    var outputCostRange;
    var contextRange;
    var runCostRange;
    var audioInputCostRange;
    var transcriptionCostRange;

    function syncRunCostRange() {
      syncDualRange(inputCostRange);
      syncDualRange(outputCostRange);
      syncDualRange(contextRange);
      syncDualRange(runCostRange);
      syncMaxRange(audioInputCostRange);
      syncMaxRange(transcriptionCostRange);
    }

    function runCostFloor() {
      if (!fields.minruncost.value) return undefined;
      var value = Number(fields.minruncost.value);
      return Number.isFinite(value) ? value : undefined;
    }

    function runCostCeiling() {
      if (!fields.maxruncost.value) return undefined;
      var value = Number(fields.maxruncost.value);
      return Number.isFinite(value) ? value : undefined;
    }

    function intelligenceFloor() {
      if (!fields.minintelligence.value) return undefined;
      var value = Number(fields.minintelligence.value);
      return Number.isFinite(value) ? value : undefined;
    }

    function activeTextBenchmarkModels(models) {
      var minRunCost = runCostFloor();
      var maxRunCost = runCostCeiling();
      var minIntelligence = intelligenceFloor();
      return (models || []).filter(function (model) {
        var cost = runCost(model);
        var intelligence = ((model.benchmarks || {}).llm || {}).intelligence;
        if (
          minRunCost !== undefined &&
          (typeof cost !== 'number' || cost < minRunCost)
        ) return false;
        if (
          maxRunCost !== undefined &&
          (typeof cost !== 'number' || cost > maxRunCost)
        ) return false;
        if (
          minIntelligence !== undefined &&
          (typeof intelligence !== 'number' || intelligence < minIntelligence)
        ) return false;
        return true;
      });
    }

    function textCostScore(model, outputWeight) {
      var pricing = model.pricing || {};
      var input = typeof pricing.inputPerMTok === 'number' ? pricing.inputPerMTok : 100;
      var output = typeof pricing.outputPerMTok === 'number' ? pricing.outputPerMTok : 100;
      var blended = input * (1 - outputWeight) + output * outputWeight;
      return Math.max(0, 100 - Math.min(Math.log1p(blended) / Math.log1p(100), 1) * 100);
    }

    function textEfficiencyScore(model) {
      var signals = ((model.benchmarks || {}).llm || {});
      var runCostValue = typeof signals.intelligenceRunTotalCost === 'number'
        ? Math.max(0, 100 - Math.min(Math.log1p(signals.intelligenceRunTotalCost) / Math.log1p(8000), 1) * 100)
        : undefined;
      var outputTokenValue = typeof signals.intelligenceRunOutputTokens === 'number'
        ? Math.max(0, 100 - Math.min(Math.log1p(signals.intelligenceRunOutputTokens) / Math.log1p(250000000), 1) * 100)
        : undefined;
      return weightedSignal(
        { runCostValue: runCostValue, outputTokenValue: outputTokenValue },
        [['runCostValue', 0.45], ['outputTokenValue', 0.55]],
        50
      );
    }

    function weightedSignal(signals, values, fallback) {
      var total = 0;
      var weight = 0;
      values.forEach(function (item) {
        var value = signals[item[0]];
        if (typeof value !== 'number') return;
        total += value * item[1];
        weight += item[1];
      });
      return weight ? total / weight : fallback;
    }

    function textUseCaseScore(model, useCase) {
      var signals = ((model.benchmarks || {}).llm || {});
      if (useCase === 'customer-support' && typeof signals.customerSupportRank === 'number') {
        return 102 - signals.customerSupportRank * 2;
      }
      var quality;
      var outputWeight = 0.6;
      quality = weightedSignal(signals, [
        ['agentic', 0.25],
        ['instructionFollowing', 0.3],
        ['intelligence', 0.25],
        ['professional', 0.1]
      ], 60);
      return quality * 0.62 + textCostScore(model, outputWeight) * 0.2 + textEfficiencyScore(model) * 0.1 + Math.min((signals.speed || 0) / 220, 1) * 8;
    }

    function supportAgenticSignal(row) {
      var signals = llmSignals(row);
      return typeof signals.agentic === 'number' ? signals.agentic : signals.tauTelecom;
    }

    function includeItsBenchmark() {
      return fields.includeits ? fields.includeits.checked : true;
    }

    function currentTextBenchmarkModels() {
      return includeItsBenchmark() || !textBenchmarkModelsWithoutIts
        ? textBenchmarkModels
        : textBenchmarkModelsWithoutIts;
    }

    function isBrowsingModels() {
      return fields.endpoint.value === 'models';
    }

    function renderCurrentUseCaseBenchmarks() {
      if (fields.usecase.value === 'voice') {
        if (voiceBenchmarkRows) renderVoiceBenchmarks(voiceBenchmarkRows);
        return;
      }
      if (fields.usecase.value === 'speech-to-text') {
        if (sttBenchmarkRows) {
          renderSpeechToTextBenchmarks(sttBenchmarkRows);
        } else {
          loadSpeechToTextBenchmarks();
        }
        return;
      }

      var currentModels = currentTextBenchmarkModels();
      if (currentModels) {
        renderTextBenchmarks(currentModels);
        renderFaq(currentModels);
      }
    }

    function renderFilteredModelBenchmarks(models) {
      if (fields.usecase.value === 'voice') {
        renderVoiceBenchmarks(models || []);
        return;
      }
      if (fields.usecase.value === 'speech-to-text') {
        renderSpeechToTextBenchmarks(models || []);
        return;
      }

      renderTextBenchmarks(models || []);
      renderFaq(models || []);
    }

    function textRows(models, useCase) {
      return models
        .filter(function (model) {
          if (useCase === 'customer-support' && model.recommendable === false) return false;
          var signals = model.benchmarks && model.benchmarks.llm;
          if (
            useCase === 'customer-support' &&
            (!signals ||
              typeof signals.instructionFollowing !== 'number' ||
              ![signals.agentic, signals.tauTelecom, signals.professional].some(function (value) { return typeof value === 'number'; }))
          ) return false;
          var hasQualitySignal = signals && [
            signals.intelligence,
            signals.coding,
            signals.instructionFollowing,
            signals.terminalBench,
            signals.agentic,
            signals.tauTelecom,
            signals.professional
          ].some(function (value) { return typeof value === 'number'; });
          return hasQualitySignal;
        })
        .map(function (model) {
          return { model: model, score: textUseCaseScore(model, useCase) };
        });
    }

    function commonTextColumns(useCase, includeIts) {
      var base = [
        { key: 'model', label: 'Model', value: function (row) { return row.model.name; }, render: function (row) { return renderModelCell(row.model); } },
        { key: 'score', label: 'Score', value: function (row) { return row.score; }, render: function (row) { return score(row.score); } }
      ];
      if (includeIts) {
        base.push(
          { key: 'falsePositives', label: 'ITS FP', value: function (row) { var rate = falsePositiveRate(row); return typeof rate === 'number' ? -rate : -Infinity; }, render: falsePositiveLabel },
          { key: 'accuracy', label: 'ITS Acc', value: function (row) { var accuracy = autoCloseSignals(row).accuracy; return typeof accuracy === 'number' ? accuracy : -Infinity; }, render: accuracyLabel }
        );
      }
      base.push(
        { key: 'ifbench', label: 'IFBench', value: function (row) { return llmSignals(row).instructionFollowing; }, render: function (row) { return score(llmSignals(row).instructionFollowing); } },
        { key: 'agentic', label: 'Agentic', value: supportAgenticSignal, render: function (row) { return score(supportAgenticSignal(row)); } },
        { key: 'intelligence', label: 'Intel', value: function (row) { return llmSignals(row).intelligence; }, render: function (row) { return score(llmSignals(row).intelligence); } }
      );
      base.push(
        { key: 'outputCost', label: 'Output AUD/MTok', value: outputCost, render: function (row) { return money(outputCost(row)); } },
        { key: 'runCost', label: 'Run AUD', value: function (row) { var cost = runCost(row); return typeof cost === 'number' ? cost : Infinity; }, render: function (row) { return money(runCost(row)); } }
      );
      if (includeIts) {
        base.push({ key: 'note', label: 'ITS Notes', value: autoCloseNote, render: function (row) { return '<div class="note-cell">' + escapeHtml(autoCloseNote(row)) + '</div>'; } });
      }
      return base;
    }

    function renderTextBenchmarks(models) {
      var support = textRows(activeTextBenchmarkModels(models), 'customer-support');
      var includeIts = includeItsBenchmark();

      renderSortableTable(
        'supportRows',
        support,
        commonTextColumns('customer-support', includeIts),
        includeIts ? 'runCost' : 'score',
        includeIts ? 'asc' : 'desc'
      );

      var label = support.length ? 'AA LLM extract' : 'unavailable';
      setText('supportSource', label);
    }

    function topBy(items, valueFn, direction) {
      return items.slice().sort(function (left, right) {
        return ((valueFn(right) || 0) - (valueFn(left) || 0)) * (direction === 'asc' ? -1 : 1);
      });
    }

    function modelName(model) {
      var item = model && (model.model || model);
      return item ? escapeHtml(item.name) : 'Unavailable';
    }

    function topList(rows, valueFn, formatValue) {
      return rows.slice(0, 3).map(function (row, index) {
        return (index + 1) + '. ' + modelName(row.model || row) + ' (' + formatValue(valueFn(row)) + ')';
      }).join(', ');
    }

    function autoCloseRankValue(row) {
      var signals = autoCloseSignals(row);
      if (!signals.source) return Number.POSITIVE_INFINITY;
      var fpRate = typeof signals.falsePositiveCount === 'number' && typeof signals.total === 'number' && signals.total > 0
        ? signals.falsePositiveCount / signals.total
        : 1;
      var accuracy = typeof signals.accuracy === 'number' ? signals.accuracy : 0;
      var cost = typeof runCost(row) === 'number' ? runCost(row) / 100000 : 1;
      return fpRate - accuracy / 1000 + cost;
    }

    function topAutoCloseRows(models) {
      return textRows(models, 'customer-support')
        .filter(function (row) {
          var signals = autoCloseSignals(row);
          return signals.source && row.model.recommendable !== false;
        })
        .sort(function (left, right) {
          return autoCloseRankValue(left) - autoCloseRankValue(right);
        });
    }

    function autoCloseSummary(row) {
      return falsePositiveLabel(row) + ' FP, ' + accuracyLabel(row) + ' accuracy, ' + money(runCost(row)) + ' Run AUD';
    }

    function topAutoCloseList(rows) {
      return rows.slice(0, 3).map(function (row, index) {
        return (index + 1) + '. ' + modelName(row.model) + ' (' + autoCloseSummary(row) + ')';
      }).join(', ');
    }

    function renderFaq(models) {
      var faq = document.getElementById('faqRows');
      if (!faq) return;

      var includeIts = includeItsBenchmark();
      var autoCloseSupport = topAutoCloseRows(models);
      var support = topBy(textRows(models, 'customer-support'), function (row) { return row.score; });
      var voice = topBy(voiceBenchmarkModels(models), voiceScore);
      var cheapestVoice = topBy(voiceBenchmarkModels(models), voiceCost, 'asc');
      var cheapestOutput = topBy(
        textRows(models, 'customer-support').filter(function (row) {
          return typeof outputCost(row) === 'number';
        }),
        function (row) { return outputCost(row); },
        'asc'
      );
      var lowestLatency = topBy(
        textRows(models, 'customer-support').filter(function (row) { return typeof llmSignals(row).latency === 'number'; }),
        function (row) { return llmSignals(row).latency; },
        'asc'
      );

      var items = [
        {
          q: 'Which model should customer support use?',
          a: includeIts && autoCloseSupport[0]
            ? modelName(autoCloseSupport[0].model) + ' is the current safety-first recommendation from the IT Solver auto-close benchmark: ' + autoCloseSummary(autoCloseSupport[0]) + '.'
            : support[0]
              ? modelName(support[0].model) + ' is the current recommendation using Artificial Analysis customer-support signals without ITS auto-close ranking.'
              : 'No customer support benchmark data is currently available.'
        },
        {
          q: 'What are the top customer support models?',
          a: includeIts && autoCloseSupport.length
            ? 'Using the auto-close benchmark ordering, the top customer support models are: ' + topAutoCloseList(autoCloseSupport) + '.'
            : support.length
              ? 'Using Artificial Analysis customer-support signals, the top customer support models are: ' + topList(support, function (row) { return row.score; }, score) + '.'
              : 'No customer support benchmark data is currently available.'
        },
        {
          q: 'Which voice model is strongest overall?',
          a: voice[0]
            ? modelName(voice[0]) + ' currently ranks highest for voice in this registry based on τ-Voice, speech reasoning, telecom score, time to first audio, and AA benchmark input-audio cost.'
            : 'No voice benchmark data is currently available.'
        },
        {
          q: 'Which voice model is cheapest on benchmark input audio?',
          a: cheapestVoice[0]
            ? modelName(cheapestVoice[0]) + ' is the cheapest voice candidate on AA benchmark input-audio cost at ' + money(voiceCost(cheapestVoice[0])) + ' AUD/hr.'
            : 'No voice benchmark pricing is currently available.'
        },
        {
          q: 'How do I choose the best speech to text model?',
          a: 'Use the speech-to-text priority and price cap to trade off accuracy, speed, and price. Highest accuracy prioritizes lower AA-WER, real-time speed prioritizes higher speed factor, and cost-sensitive workloads should use the AUD/1k min cap and price column.'
        },
        {
          q: 'Which text model has the lowest output price?',
          a: cheapestOutput[0]
            ? modelName(cheapestOutput[0].model) + ' has the lowest output price among benchmarked text candidates at ' + money(outputCost(cheapestOutput[0])) + ' AUD/MTok.'
            : 'No text output pricing is currently available.'
        },
        {
          q: 'Which benchmarked text model has the lowest latency?',
          a: lowestLatency[0]
            ? modelName(lowestLatency[0].model) + ' has the lowest available time to first token at ' + seconds(llmSignals(lowestLatency[0]).latency) + '.'
            : 'No latency benchmark data is currently available.'
        },
        {
          q: 'How are recommendations compared here?',
          a: includeIts
            ? 'Customer support uses IT Solver auto-close benchmark results first: false positives, accuracy, then Run AUD/token efficiency. Artificial Analysis supplies broader model quality, pricing, and cost-efficiency signals. Voice uses AA speech-to-speech benchmark pricing and latency.'
            : 'Customer support uses Artificial Analysis model quality, pricing, and cost-efficiency signals. Voice uses AA speech-to-speech benchmark pricing and latency.'
        }
      ];

      faq.innerHTML = items.map(function (item) {
        return '<h3>' + escapeHtml(item.q) + '</h3><p>' + item.a + '</p>';
      }).join('');
    }

    fetch('/v1/health')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        setText('modelCount', data.modelCount.toLocaleString());
        setText('activeCount', data.activeModelCount.toLocaleString());
        setText('providerCount', data.providerCount.toLocaleString());
        setText('generatedAt', new Date(data.generatedAt).toUTCString() + ' (' + formatAge(data.generatedAt) + ')');
        setText('pricingContext', pricingContext(data));
      })
      .catch(function () {
        setText('modelCount', '?');
        setText('activeCount', '?');
        setText('providerCount', '?');
        setText('generatedAt', 'unavailable');
        setText('pricingContext', 'unavailable');
      });

    fetch('/v1/benchmarks?useCase=voice', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        voiceBenchmarkRows = data.benchmarks || [];
        if (!isBrowsingModels() && fields.usecase.value === 'voice') {
          renderVoiceBenchmarks(voiceBenchmarkRows);
        }
      })
      .catch(function () {
        var rows = document.getElementById('voiceRows');
        if (rows) rows.innerHTML = '<tr><td class="empty" colspan="7">Voice benchmarks unavailable.</td></tr>';
        setText('voiceSource', 'unavailable');
      });

    function loadSpeechToTextBenchmarks(attempt) {
      if (sttBenchmarkLoading) return;
      sttBenchmarkLoading = true;
      setText('sttSource', 'loading...');
      fetch('/v1/benchmarks?useCase=speech-to-text', { cache: 'no-store' })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
        .then(function (data) {
          sttBenchmarkRows = data.benchmarks || [];
          sttBenchmarkLoading = false;
          if (!isBrowsingModels() && fields.usecase.value === 'speech-to-text') {
            renderSpeechToTextBenchmarks(sttBenchmarkRows);
          }
        })
        .catch(function () {
          sttBenchmarkLoading = false;
          if ((attempt || 0) < 2) {
            setTimeout(function () { loadSpeechToTextBenchmarks((attempt || 0) + 1); }, 1000);
            return;
          }
          var rows = document.getElementById('sttRows');
          if (rows) rows.innerHTML = '<tr><td class="empty" colspan="8">STT benchmarks unavailable.</td></tr>';
          setText('sttSource', 'unavailable');
        });
    }

    loadSpeechToTextBenchmarks();

    Promise.all([
      fetch('/v1/benchmarks?useCase=customer-support', { cache: 'no-store' })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res); }),
      fetch('/v1/benchmarks?useCase=customer-support&includeItsBenchmark=false', { cache: 'no-store' })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
    ])
      .then(function (responses) {
        textBenchmarkModels = responses[0].benchmarks || [];
        textBenchmarkModelsWithoutIts = responses[1].benchmarks || [];
        if (!isBrowsingModels() && fields.usecase.value === 'customer-support') {
          renderCurrentUseCaseBenchmarks();
        }
      })
      .catch(function () {
        ['supportRows'].forEach(function (id) {
          var rows = document.getElementById(id);
          if (rows) rows.innerHTML = '<tr><td class="empty" colspan="10">Benchmark data unavailable.</td></tr>';
        });
        setText('supportSource', 'unavailable');
        var faq = document.getElementById('faqRows');
        if (faq) faq.innerHTML = '<p>FAQ data unavailable.</p>';
      });

    document.addEventListener('click', function (event) {
      var header = event.target.closest('th[data-table][data-sort]');
      if (!header) return;
      var tableId = header.getAttribute('data-table');
      var sortKey = header.getAttribute('data-sort');
      var state = benchmarkTables[tableId];
      if (!state || !sortKey) return;
      if (state.sortKey === sortKey) {
        state.direction = state.direction === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = sortKey;
        state.direction = sortKey === 'model' ? 'asc' : 'desc';
      }
      drawSortableTable(tableId);
    });

    document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
      tabs.addEventListener('click', function (event) {
        var button = event.target.closest('[data-tab]');
        if (!button) return;
        tabs.querySelectorAll('[data-tab]').forEach(function (tab) { tab.classList.remove('active'); });
        tabs.querySelectorAll('[data-panel]').forEach(function (panel) { panel.hidden = true; });
        button.classList.add('active');
        var panel = tabs.querySelector('[data-panel="' + button.getAttribute('data-tab') + '"]');
        if (panel) panel.hidden = false;
      });
    });

    document.querySelectorAll('.pre-wrap').forEach(function (wrap) {
      if (wrap.querySelector('.copy-btn')) return;
      var pre = wrap.querySelector('pre');
      if (!pre) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn';
      button.textContent = 'copy';
      wrap.appendChild(button);
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(pre.textContent.trim()).then(function () {
          button.textContent = 'copied!';
          button.classList.add('done');
          setTimeout(function () {
            button.textContent = 'copy';
            button.classList.remove('done');
          }, 1400);
        });
      });
    });

    function buildPath() {
      var endpoint = fields.endpoint.value === 'models' ? '/v1/models' : '/v1/models/recommend';
      var params = new URLSearchParams();
      if (fields.tier.value) params.set('tier', fields.tier.value);
      if (fields.provider.value) params.set('provider', fields.provider.value);
      if (fields.capability.value) params.set('capability', fields.capability.value);
      if (fields.usecase.value) params.set('useCase', fields.usecase.value);
      if (fields.usecase.value === 'voice') {
        if (fields.maxaudioinputcost.value) params.set('maxAudioInputCostPerHour', fields.maxaudioinputcost.value);
        if (fields.maxaudiooutputcost.value) params.set('maxAudioOutputCostPerHour', fields.maxaudiooutputcost.value);
      } else if (fields.usecase.value === 'speech-to-text') {
        if (fields.maxtranscriptioncost.value) params.set('maxTranscriptionCostPer1kMinutes', fields.maxtranscriptioncost.value);
      } else {
        if (!includeItsBenchmark()) params.set('includeItsBenchmark', 'false');
        if (fields.mincost.value) params.set('minInputCostPerMTok', fields.mincost.value);
        if (fields.maxcost.value) params.set('maxInputCostPerMTok', fields.maxcost.value);
        if (fields.minoutputcost.value) params.set('minOutputCostPerMTok', fields.minoutputcost.value);
        if (fields.maxoutputcost.value) params.set('maxOutputCostPerMTok', fields.maxoutputcost.value);
        if (fields.minruncost.value) params.set('minRunCostAud', fields.minruncost.value);
        if (fields.maxruncost.value) params.set('maxRunCostAud', fields.maxruncost.value);
        if (fields.minintelligence.value) params.set('minIntelligence', fields.minintelligence.value);
        if (fields.minctx.value) params.set('minContextWindow', String(parseInt(fields.minctx.value, 10) * 1000));
        if (fields.maxctx.value) params.set('maxContextWindow', String(parseInt(fields.maxctx.value, 10) * 1000));
      }
      var qs = params.toString();
      return endpoint + (qs ? '?' + qs : '');
    }

    var previewTimer = 0;
    function refreshBuilder() {
      syncRunCostRange();
      updateTierOptions(fields.usecase.value);
      var path = buildPath();
      var full = origin + path;
      updateBenchmarkPanel(fields.usecase.value);
      updateFilterVisibility(fields.usecase.value);
      if (!isBrowsingModels()) renderCurrentUseCaseBenchmarks();
      redrawBenchmarkTables();
      fields.url.textContent = full;
      fields.url.href = path;
      fields.open.href = path;
      fields.code.textContent = full;
      fields.result.textContent = 'checking...';
      clearTimeout(previewTimer);
      previewTimer = setTimeout(function () {
        var requestedPath = path;
        var requestedUseCase = fields.usecase.value;
        var requestedBrowse = isBrowsingModels();
        fetch(path)
          .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
          .then(function (data) {
            if (requestedPath !== buildPath()) return;
            if (data.recommendation) {
              fields.result.textContent = data.recommendation.id;
              highlightBenchmark(data.recommendation.id, requestedUseCase);
            } else {
              fields.result.textContent = (data.modelCount || 0).toLocaleString() + ' models';
              if (requestedBrowse) renderFilteredModelBenchmarks(data.models || []);
              highlightBenchmark('', '');
            }
          })
          .catch(function () {
            if (requestedPath !== buildPath()) return;
            fields.result.textContent = 'unavailable';
            highlightBenchmark('', '');
          });
      }, 180);
    }

    ['change', 'input'].forEach(function (eventName) {
      document.querySelector('.builder').addEventListener(eventName, refreshBuilder);
    });
    fields.providerTableOnly.addEventListener('change', refreshBuilder);
    inputCostRange = {
      min: 0,
      max: 50,
      minRange: fields.inputminrange,
      maxRange: fields.inputmaxrange,
      hiddenMin: fields.mincost,
      hiddenMax: fields.maxcost,
      label: fields.inputcostlabel,
      anyLabel: 'Any input AUD',
      format: formatMoneyCap
    };
    outputCostRange = {
      min: 0,
      max: 75,
      minRange: fields.outputminrange,
      maxRange: fields.outputmaxrange,
      hiddenMin: fields.minoutputcost,
      hiddenMax: fields.maxoutputcost,
      label: fields.outputcostlabel,
      anyLabel: 'Any output AUD',
      format: formatMoneyCap
    };
    contextRange = {
      min: 0,
      max: 1200,
      minRange: fields.contextminrange,
      maxRange: fields.contextmaxrange,
      hiddenMin: fields.minctx,
      hiddenMax: fields.maxctx,
      label: fields.contextlabel,
      anyLabel: 'Any context',
      format: formatContextCap
    };
    runCostRange = {
      min: 0,
      max: 8000,
      minRange: fields.runminrange,
      maxRange: fields.runmaxrange,
      hiddenMin: fields.minruncost,
      hiddenMax: fields.maxruncost,
      label: fields.runcostlabel,
      anyLabel: 'Any Run AUD',
      format: formatRunCostCap
    };
    audioInputCostRange = {
      min: 0,
      max: 20,
      maxRange: fields.audioinputmaxrange,
      hiddenMax: fields.maxaudioinputcost,
      label: fields.audioinputcostlabel,
      anyLabel: 'Any input audio AUD/hr',
      format: formatAudioCostCap
    };
    transcriptionCostRange = {
      min: 0,
      max: 20,
      maxRange: fields.transcriptionmaxrange,
      hiddenMax: fields.maxtranscriptioncost,
      label: fields.transcriptioncostlabel,
      anyLabel: 'Any STT AUD/1k min',
      format: formatTranscriptionCostCap
    };
    fields.inputcostany.addEventListener('click', function () { resetDualRange(inputCostRange); });
    fields.outputcostany.addEventListener('click', function () { resetDualRange(outputCostRange); });
    fields.contextany.addEventListener('click', function () { resetDualRange(contextRange); });
    fields.runcostany.addEventListener('click', function () { resetDualRange(runCostRange); });
    fields.audioinputcostany.addEventListener('click', function () { resetMaxRange(audioInputCostRange); });
    fields.transcriptioncostany.addEventListener('click', function () { resetMaxRange(transcriptionCostRange); });
    [inputCostRange, outputCostRange, contextRange, runCostRange].forEach(installDualRangePointer);
    installMaxRangePointer(audioInputCostRange);
    installMaxRangePointer(transcriptionCostRange);

    fields.copy.addEventListener('click', function () {
      navigator.clipboard.writeText(fields.code.textContent).then(function () {
        fields.copy.textContent = 'copied!';
        setTimeout(function () { fields.copy.textContent = 'copy'; }, 1400);
      });
    });

    syncRunCostRange();
    refreshBuilder();
  }());
  </script>
</body>
</html>`;
