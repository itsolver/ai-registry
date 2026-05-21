export const HOME_HTML = String.raw`<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ai.itsolver.au - stop hardcoding model names</title>
  <meta name="description" content="A private IT Solver API that recommends current AI models from OpenAI, Google, xAI, and Anthropic.">
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
      max-width: 760px;
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
    .private-bar {
      text-align: center;
      color: var(--muted);
      padding-bottom: 0.75rem;
      margin-bottom: 2rem;
      border-bottom: 1px dashed var(--line);
      font-size: 0.75rem;
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
      align-items: baseline;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.78rem;
    }
    .voice-head strong { color: var(--ink); }
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
      .builder-url { flex-wrap: wrap; }
      .builder-url-text { width: 100%; padding-left: 1rem; }
      .builder-actions { width: 100%; justify-content: flex-end; padding: 0 0.6rem 0.55rem; }
    }
  </style>
</head>
<body>
  <div class="private-bar">Private IT Solver model registry. API key or home IP required.</div>

  <h1>ai<span class="blink">.</span>itsolver<span class="blink">.</span>au</h1>
  <p class="tagline">A private API that tells IT Solver projects which AI model to actually use, so model names stop getting hardcoded across repos.</p>

  <h2>The Problem</h2>
  <p>OpenAI ships a new model. Google ships a new model. Anthropic ships a new model. Your <code>config.ts</code> goes stale by lunchtime. You update it in fourteen places. You miss two.</p>
  <p>This API is the private source of truth.</p>

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
    <div class="tab-panel pre-wrap" data-panel="curl"><pre><code>curl -H "Authorization: Bearer $MODEL_REGISTRY_API_KEY" \
  "https://ai.itsolver.au/v1/models/recommend?tier=fast"</code></pre></div>
    <div class="tab-panel pre-wrap" data-panel="js" hidden><pre><code>const res = await fetch('https://ai.itsolver.au/v1/models/recommend?tier=fast', {
  headers: { Authorization: 'Bearer ' + process.env.MODEL_REGISTRY_API_KEY }
});
const { recommendation } = await res.json();
console.log(recommendation.id);</code></pre></div>
    <div class="tab-panel pre-wrap" data-panel="python" hidden><pre><code>import os
import requests

r = requests.get(
    'https://ai.itsolver.au/v1/models/recommend',
    params={'tier': 'fast'},
    headers={'Authorization': f"Bearer {os.environ['MODEL_REGISTRY_API_KEY']}"}
)
print(r.json()['recommendation']['id'])</code></pre></div>
  </div>
  <p>Returns a cost-first fast model from the private curated provider set. Cache it locally and keep a fallback in production clients.</p>

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
            <option value="">general</option>
            <option value="customer-support">customer support</option>
            <option value="billing">billing</option>
            <option value="voice">voice</option>
          </select>
        </div>
        <div class="b-field">
          <label for="b-tier">Speed / quality</label>
          <select id="b-tier">
            <option value="" selected>any tier</option>
            <option value="fast">fast</option>
            <option value="balanced">balanced</option>
            <option value="best">best</option>
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
        <div class="b-field">
          <label for="b-carelevel">Care level</label>
          <select id="b-carelevel">
            <option value="">default</option>
            <option value="triage">triage</option>
            <option value="standard">standard</option>
            <option value="essential">essential</option>
            <option value="premium">premium</option>
            <option value="complex">complex</option>
          </select>
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-maxcost">Max input AUD/MTok</label>
          <input type="number" id="b-maxcost" min="0" step="0.1" placeholder="no limit">
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-maxoutputcost">Max output AUD/MTok</label>
          <input type="number" id="b-maxoutputcost" min="0" step="0.1" placeholder="no limit">
        </div>
        <div class="b-field" data-filter-scope="voice">
          <label for="b-maxaudioinputcost">Max input audio AUD/hr</label>
          <input type="number" id="b-maxaudioinputcost" min="0" step="0.1" placeholder="voice only">
        </div>
        <div class="b-field" data-filter-scope="voice">
          <label for="b-maxaudiooutputcost">Max output audio AUD/hr</label>
          <input type="number" id="b-maxaudiooutputcost" min="0" step="0.1" placeholder="voice only">
        </div>
        <div class="b-field" data-filter-scope="text">
          <label for="b-minctx">Min context (k)</label>
          <input type="number" id="b-minctx" min="0" step="32" placeholder="e.g. 128">
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

  <h2>Relevant Benchmark</h2>
  <p class="bench-note" id="benchmarkHint">Select a use case in Build Your Query to bring the matching benchmark table into focus.</p>
  <div class="benchmark-panels">
    <div class="benchmark-panel" data-benchmark-panel="customer-support" hidden>
      <p class="bench-note">Customer support models are ranked from the cached Artificial Analysis LLM extract, with AUD output cost weighted because generated replies are where support costs bite.</p>
      <div class="voice-bench">
      <div class="voice-head">
        <strong>Customer support</strong>
        <span id="supportSource">loading...</span>
      </div>
      <div class="voice-table-wrap">
        <table class="voice-table">
          <thead>
            <tr>
              <th data-table="supportRows" data-sort="model">Model</th>
              <th data-table="supportRows" data-sort="score">Score</th>
              <th data-table="supportRows" data-sort="ifbench">IFBench</th>
              <th data-table="supportRows" data-sort="telecom">Telecom</th>
              <th data-table="supportRows" data-sort="intelligence">Intel</th>
              <th data-table="supportRows" data-sort="outputCost">Output AUD/MTok</th>
              <th data-table="supportRows" data-sort="runCost">Run AUD</th>
              <th data-table="supportRows" data-sort="outTokens">Out Tok</th>
            </tr>
          </thead>
          <tbody id="supportRows">
            <tr><td class="empty" colspan="8">loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
    <div class="benchmark-panel" data-benchmark-panel="billing" hidden>
      <p class="bench-note">Billing / Xero models are ranked for instruction following, professional-task ability, intelligence, technical judgment, and output cost.</p>
      <div class="voice-bench">
      <div class="voice-head">
        <strong>Billing / Xero</strong>
        <span id="billingSource">loading...</span>
      </div>
      <div class="voice-table-wrap">
        <table class="voice-table">
          <thead>
            <tr>
              <th data-table="billingRows" data-sort="model">Model</th>
              <th data-table="billingRows" data-sort="score">Score</th>
              <th data-table="billingRows" data-sort="ifbench">IFBench</th>
              <th data-table="billingRows" data-sort="professional">Pro</th>
              <th data-table="billingRows" data-sort="intelligence">Intel</th>
              <th data-table="billingRows" data-sort="outputCost">Output AUD/MTok</th>
              <th data-table="billingRows" data-sort="runCost">Run AUD</th>
              <th data-table="billingRows" data-sort="outTokens">Out Tok</th>
            </tr>
          </thead>
          <tbody id="billingRows">
            <tr><td class="empty" colspan="8">loading...</td></tr>
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
    <p>Every imported model from OpenAI, Google, xAI, and Anthropic. Filter by provider, tier, capability, AUD cost, context, and deprecated status.</p>
  </div>
  <div class="endpoint">
    <code>GET /v1/models/recommend</code>
    <p>The opinionated endpoint. Apply filters and get one customer support, billing, or voice-appropriate model back.</p>
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
  "id": "claude-sonnet-4-5",
  "provider": "anthropic",
  "name": "Claude Sonnet 4.5",
  "family": "claude-sonnet",
  "contextWindow": 200000,
  "outputLimit": 64000,
  "pricing": {
    "inputPerMTok": 4.2153,
    "outputPerMTok": 21.0765
  },
  "capabilities": {
    "vision": true,
    "pdf": true,
    "reasoning": true,
    "toolCalling": true,
    "structuredOutput": false
  },
  "tier": "balanced",
  "deprecated": false
}</code></pre></div>

  <h2>Freshness</h2>
  <p>The Worker refreshes the catalog from <a href="https://models.dev">models.dev</a> every morning at 06:00 UTC and caches the normalized result at the edge.</p>

  <h2>Cost</h2>
  <p><span class="pill">$0.00-ish</span> - runs on Cloudflare Workers. Pricing data still belongs to the providers, so production billing decisions should verify current provider pricing directly.</p>

  <h2>Caveats</h2>
  <ul>
    <li>This is private infrastructure for IT Solver and personal projects.</li>
    <li>Only OpenAI, Google, xAI, and Anthropic are exposed.</li>
    <li>Each model includes AUD pricing converted from USD with the current cached Frankfurter exchange rate.</li>
    <li>Text recommendations exclude open-weight, zero-priced, image, audio, live, embedding, moderation, and transcription-style models. Voice recommendations use the cached Artificial Analysis speech-to-speech leaderboard extract.</li>
    <li>Recommendation tiers are cost-derived from the remaining customer support, billing, and voice candidate set.</li>
    <li>Always code a local fallback in client apps.</li>
  </ul>

  <p class="footnote">Last data refresh: <span id="generatedAt">checking...</span></p>

  <div class="legal">
    <p><strong>IT Solver AI Registry</strong>. Private service. Data is aggregated from <a href="https://models.dev">models.dev</a> and public provider information.</p>
    <p><strong>Disclaimer:</strong> Pricing and model availability change frequently. Verify model status and pricing with the provider before using this data for billing decisions or production rollouts.</p>
  </div>

  <script>
  (function () {
    var origin = window.location.origin;
    var fields = {
      endpoint: document.getElementById('b-endpoint'),
      tier: document.getElementById('b-tier'),
      provider: document.getElementById('b-provider'),
      capability: document.getElementById('b-capability'),
      usecase: document.getElementById('b-usecase'),
      carelevel: document.getElementById('b-carelevel'),
      maxcost: document.getElementById('b-maxcost'),
      maxoutputcost: document.getElementById('b-maxoutputcost'),
      maxaudioinputcost: document.getElementById('b-maxaudioinputcost'),
      maxaudiooutputcost: document.getElementById('b-maxaudiooutputcost'),
      minctx: document.getElementById('b-minctx'),
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

    function compactTokens(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
      if (value >= 1000000) return Math.round(value / 1000000) + 'M';
      if (value >= 1000) return Math.round(value / 1000) + 'k';
      return String(Math.round(value));
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
    var selectedBenchmark = { tableId: '', modelId: '', useCase: '' };
    var allModels = [];

    function sortValue(value) {
      return value === undefined || value === null || Number.isNaN(value) ? -Infinity : value;
    }

    function renderModelCell(model) {
      return '<strong>' + escapeHtml(model.name) + '</strong><div class="provider">' + escapeHtml(model.provider) + '</div>';
    }

    function benchmarkRowId(row) {
      return ((row.model || row) || {}).id || '';
    }

    function renderSortableTable(tableId, rows, columns, defaultSortKey, defaultDirection) {
      benchmarkTables[tableId] = {
        rows: rows,
        columns: columns,
        sortKey: defaultSortKey,
        direction: defaultDirection || 'desc',
        selectedId: selectedBenchmark.tableId === tableId ? selectedBenchmark.modelId : '',
        selectedRow: selectedBenchmark.tableId === tableId
          ? selectedRowForTable(tableId, selectedBenchmark.modelId, selectedBenchmark.useCase)
          : undefined
      };
      drawSortableTable(tableId);
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
      var sorted = state.rows.slice().sort(function (left, right) {
        var a = sortValue(column.value(left));
        var b = sortValue(column.value(right));
        if (typeof a === 'string' || typeof b === 'string') {
          return String(a).localeCompare(String(b)) * direction;
        }
        return (a - b) * direction;
      });
      var selectedInRows = state.selectedId && sorted.some(function (row) { return benchmarkRowId(row) === state.selectedId; });
      var visible = selectedInRows || !state.selectedRow ? sorted : [state.selectedRow].concat(sorted);

      tbody.innerHTML = visible.map(function (row) {
        var classes = [];
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
      if (useCase === 'customer-support') return 'supportRows';
      if (useCase === 'billing' || (useCase && useCase.indexOf('billing-') === 0)) return 'billingRows';
      return '';
    }

    function benchmarkPanelForUseCase(useCase) {
      if (useCase === 'voice') return 'voice';
      if (useCase === 'customer-support') return 'customer-support';
      if (useCase === 'billing' || (useCase && useCase.indexOf('billing-') === 0)) return 'billing';
      return '';
    }

    function updateBenchmarkPanel(useCase) {
      var active = benchmarkPanelForUseCase(useCase);
      document.querySelectorAll('[data-benchmark-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-benchmark-panel') !== active;
      });
      var hint = document.getElementById('benchmarkHint');
      if (!hint) return;
      hint.textContent = active
        ? 'Showing the benchmark table for the selected use case.'
        : 'Select a use case in Build Your Query to bring the matching benchmark table into focus.';
    }

    function updateFilterVisibility(useCase) {
      var isVoice = useCase === 'voice';
      document.querySelectorAll('[data-filter-scope]').forEach(function (field) {
        var scope = field.getAttribute('data-filter-scope');
        field.hidden = scope === 'voice' ? !isVoice : isVoice;
      });
    }

    function selectedRowForTable(tableId, modelId, useCase) {
      var model = allModels.find(function (item) { return item.id === modelId; });
      if (!model) return undefined;
      if (tableId === 'voiceRows') return model;
      if (tableId === 'supportRows') return { model: model, score: textUseCaseScore(model, 'customer-support') };
      if (tableId === 'billingRows') return { model: model, score: textUseCaseScore(model, useCase || 'billing') };
      return undefined;
    }

    function highlightBenchmark(modelId, useCase) {
      selectedBenchmark = {
        tableId: benchmarkTableForUseCase(useCase),
        modelId: modelId || '',
        useCase: useCase || ''
      };
      Object.keys(benchmarkTables).forEach(function (tableId) {
        benchmarkTables[tableId].selectedId =
          tableId === selectedBenchmark.tableId ? selectedBenchmark.modelId : '';
        benchmarkTables[tableId].selectedRow =
          tableId === selectedBenchmark.tableId
            ? selectedRowForTable(tableId, selectedBenchmark.modelId, selectedBenchmark.useCase)
            : undefined;
        drawSortableTable(tableId);
      });
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
        var pricing = model.pricing || {};
        return !model.deprecated &&
          model.benchmarks &&
          model.benchmarks.voice &&
          typeof pricing.benchmarkInputAudioPerHour === 'number';
      });
    }

    function renderVoiceBenchmarks(models) {
      if (!models.length) {
        renderSortableTable('voiceRows', [], [], 'agentic');
        setText('voiceSource', 'unavailable');
        return;
      }

      var source = models[0].benchmarks && models[0].benchmarks.voice;
      if (source && source.extractedAt) {
        setText('voiceSource', 'AA extract ' + formatAge(source.extractedAt));
      }

      renderSortableTable('voiceRows', models, [
        { key: 'model', value: function (model) { return model.name; }, render: renderModelCell },
        { key: 'agentic', value: function (model) { return ((model.benchmarks || {}).voice || {}).agenticPerformance; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).agenticPerformance); } },
        { key: 'speech', value: function (model) { return ((model.benchmarks || {}).voice || {}).speechReasoning; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).speechReasoning); } },
        { key: 'telecom', value: function (model) { return ((model.benchmarks || {}).voice || {}).telecomAgenticPerformance; }, render: function (model) { return pct(((model.benchmarks || {}).voice || {}).telecomAgenticPerformance); } },
        { key: 'ttfa', value: function (model) { return -(((model.benchmarks || {}).voice || {}).timeToFirstAudioSeconds || Infinity); }, render: function (model) { return seconds(((model.benchmarks || {}).voice || {}).timeToFirstAudioSeconds); } },
        { key: 'inputCost', value: voiceCost, render: function (model) { return money(voiceCost(model)); } },
        { key: 'outputCost', value: voiceOutputCost, render: function (model) { return money(voiceOutputCost(model)); } }
      ], 'agentic', 'desc');
    }

    function llmSignals(row) {
      return (((row.model || {}).benchmarks || {}).llm || {});
    }

    function outputCost(row) {
      return ((row.model || {}).pricing || {}).outputPerMTok;
    }

    function runCost(row) {
      return llmSignals(row).intelligenceRunTotalCost;
    }

    function outputTokens(row) {
      return llmSignals(row).intelligenceRunOutputTokens;
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
      var quality;
      var outputWeight = useCase === 'customer-support' ? 0.6 : 0.35;
      if (useCase === 'billing') {
        quality = weightedSignal(signals, [
          ['instructionFollowing', 0.3],
          ['intelligence', 0.3],
          ['professional', 0.2],
          ['coding', 0.1],
          ['terminalBench', 0.1]
        ], 60);
      } else {
        quality = weightedSignal(signals, [
          ['tauTelecom', 0.25],
          ['instructionFollowing', 0.3],
          ['intelligence', 0.25],
          ['professional', 0.1]
        ], 60);
      }
      return quality * 0.62 + textCostScore(model, outputWeight) * 0.2 + textEfficiencyScore(model) * 0.1 + Math.min((signals.speed || 0) / 220, 1) * 8;
    }

    function textRows(models, useCase) {
      return models
        .filter(function (model) {
          var signals = model.benchmarks && model.benchmarks.llm;
          var input = (model.modalities && model.modalities.input) || [];
          var output = (model.modalities && model.modalities.output) || [];
          var hasQualitySignal = signals && [
            signals.intelligence,
            signals.coding,
            signals.instructionFollowing,
            signals.terminalBench,
            signals.tauTelecom,
            signals.professional
          ].some(function (value) { return typeof value === 'number'; });
          return !model.deprecated &&
            hasQualitySignal &&
            input.indexOf('audio') === -1 &&
            output.indexOf('audio') === -1 &&
            output.indexOf('text') !== -1 &&
            typeof ((model.pricing || {}).outputPerMTok) === 'number';
        })
        .map(function (model) {
          return { model: model, score: textUseCaseScore(model, useCase) };
        });
    }

    function commonTextColumns(useCase) {
      var base = [
        { key: 'model', value: function (row) { return row.model.name; }, render: function (row) { return renderModelCell(row.model); } },
        { key: 'score', value: function (row) { return row.score; }, render: function (row) { return score(row.score); } }
      ];
      if (useCase === 'billing') {
        base.push(
          { key: 'ifbench', value: function (row) { return llmSignals(row).instructionFollowing; }, render: function (row) { return score(llmSignals(row).instructionFollowing); } },
          { key: 'professional', value: function (row) { return llmSignals(row).professional; }, render: function (row) { return score(llmSignals(row).professional); } },
          { key: 'intelligence', value: function (row) { return llmSignals(row).intelligence; }, render: function (row) { return score(llmSignals(row).intelligence); } }
        );
      } else {
        base.push(
          { key: 'ifbench', value: function (row) { return llmSignals(row).instructionFollowing; }, render: function (row) { return score(llmSignals(row).instructionFollowing); } },
          { key: 'telecom', value: function (row) { return llmSignals(row).tauTelecom; }, render: function (row) { return score(llmSignals(row).tauTelecom); } },
          { key: 'intelligence', value: function (row) { return llmSignals(row).intelligence; }, render: function (row) { return score(llmSignals(row).intelligence); } }
        );
      }
      base.push(
        { key: 'outputCost', value: outputCost, render: function (row) { return money(outputCost(row)); } },
        { key: 'runCost', value: runCost, render: function (row) { return money(runCost(row)); } },
        { key: 'outTokens', value: outputTokens, render: function (row) { return compactTokens(outputTokens(row)); } }
      );
      return base;
    }

    function renderTextBenchmarks(models) {
      var support = textRows(models, 'customer-support');
      var billing = textRows(models, 'billing');

      renderSortableTable('supportRows', support, commonTextColumns('customer-support'), 'score', 'desc');
      renderSortableTable('billingRows', billing, commonTextColumns('billing'), 'score', 'desc');

      var label = support.length ? 'AA LLM extract' : 'unavailable';
      setText('supportSource', label);
      setText('billingSource', billing.length ? 'AA LLM extract' : 'unavailable');
    }

    function topBy(items, valueFn, direction) {
      return items.slice().sort(function (left, right) {
        return ((valueFn(right) || 0) - (valueFn(left) || 0)) * (direction === 'asc' ? -1 : 1);
      });
    }

    function modelName(model) {
      return model ? escapeHtml(model.name) : 'Unavailable';
    }

    function topList(rows, valueFn, formatValue) {
      return rows.slice(0, 3).map(function (row, index) {
        return (index + 1) + '. ' + modelName(row.model || row) + ' (' + formatValue(valueFn(row)) + ')';
      }).join(', ');
    }

    function renderFaq(models) {
      var faq = document.getElementById('faqRows');
      if (!faq) return;

      var support = topBy(textRows(models, 'customer-support'), function (row) { return row.score; });
      var billing = topBy(textRows(models, 'billing'), function (row) { return row.score; });
      var voice = topBy(voiceBenchmarkModels(models), voiceScore);
      var cheapestVoice = topBy(voiceBenchmarkModels(models), voiceCost, 'asc');
      var cheapestOutput = topBy(
        textRows(models, 'customer-support'),
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
          a: support[0]
            ? modelName(support[0].model) + ' currently ranks highest for customer support in this registry, using IFBench, telecom workflow, intelligence, speed, AUD output cost, and AA output-token efficiency.'
            : 'No customer support benchmark data is currently available.'
        },
        {
          q: 'What are the top customer support models?',
          a: support.length
            ? 'The top customer support models are: ' + topList(support, function (row) { return row.score; }, score) + '.'
            : 'No customer support benchmark data is currently available.'
        },
        {
          q: 'Which model should billing / Xero work use?',
          a: billing[0]
            ? modelName(billing[0].model) + ' currently ranks highest for billing / Xero-style work, weighted toward instruction following, intelligence, professional-task score, technical-task signals, and AA cost-to-run efficiency.'
            : 'No billing benchmark data is currently available.'
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
          a: 'The registry combines models.dev pricing and model metadata with cached Artificial Analysis benchmark signals. Customer support gives extra weight to output cost, output-token efficiency, and instruction following; billing emphasizes instruction following, professional-task ability, and cost-to-run efficiency; voice uses AA speech-to-speech benchmark pricing and latency.'
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
      })
      .catch(function () {
        setText('modelCount', '?');
        setText('activeCount', '?');
        setText('providerCount', '?');
        setText('generatedAt', 'unavailable');
      });

    fetch('/v1/models?useCase=voice')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) { renderVoiceBenchmarks(data.models || []); })
      .catch(function () {
        var rows = document.getElementById('voiceRows');
        if (rows) rows.innerHTML = '<tr><td class="empty" colspan="7">Voice benchmarks unavailable.</td></tr>';
        setText('voiceSource', 'unavailable');
      });

    fetch('/v1/models')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        allModels = data.models || [];
        renderTextBenchmarks(allModels);
        renderFaq(allModels);
      })
      .catch(function () {
        ['supportRows', 'billingRows'].forEach(function (id) {
          var rows = document.getElementById(id);
          if (rows) rows.innerHTML = '<tr><td class="empty" colspan="8">Benchmark data unavailable.</td></tr>';
        });
        setText('supportSource', 'unavailable');
        setText('billingSource', 'unavailable');
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
      if (fields.carelevel.value) params.set('careLevel', fields.carelevel.value);
      if (fields.usecase.value === 'voice') {
        if (fields.maxaudioinputcost.value) params.set('maxAudioInputCostPerHour', fields.maxaudioinputcost.value);
        if (fields.maxaudiooutputcost.value) params.set('maxAudioOutputCostPerHour', fields.maxaudiooutputcost.value);
      } else {
        if (fields.maxcost.value) params.set('maxInputCostPerMTok', fields.maxcost.value);
        if (fields.maxoutputcost.value) params.set('maxOutputCostPerMTok', fields.maxoutputcost.value);
        if (fields.minctx.value) params.set('minContextWindow', String(parseInt(fields.minctx.value, 10) * 1000));
      }
      var qs = params.toString();
      return endpoint + (qs ? '?' + qs : '');
    }

    var previewTimer = 0;
    function refreshBuilder() {
      var path = buildPath();
      var full = origin + path;
      updateBenchmarkPanel(fields.usecase.value);
      updateFilterVisibility(fields.usecase.value);
      fields.url.textContent = full;
      fields.url.href = path;
      fields.open.href = path;
      fields.code.textContent = full;
      fields.result.textContent = 'checking...';
      clearTimeout(previewTimer);
      previewTimer = setTimeout(function () {
        fetch(path)
          .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
          .then(function (data) {
            if (data.recommendation) {
              fields.result.textContent = data.recommendation.id;
              highlightBenchmark(data.recommendation.id, fields.usecase.value);
            } else {
              fields.result.textContent = (data.modelCount || 0).toLocaleString() + ' models';
              highlightBenchmark('', '');
            }
          })
          .catch(function () {
            fields.result.textContent = 'unavailable';
            highlightBenchmark('', '');
          });
      }, 180);
    }

    ['change', 'input'].forEach(function (eventName) {
      document.querySelector('.builder').addEventListener(eventName, refreshBuilder);
    });

    fields.copy.addEventListener('click', function () {
      navigator.clipboard.writeText(fields.code.textContent).then(function () {
        fields.copy.textContent = 'copied!';
        setTimeout(function () { fields.copy.textContent = 'copy'; }, 1400);
      });
    });

    refreshBuilder();
  }());
  </script>
</body>
</html>`;
