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
          <label for="b-tier">Speed / quality</label>
          <select id="b-tier">
            <option value="">any tier</option>
            <option value="fast" selected>fast</option>
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
          <label for="b-usecase">Use case</label>
          <select id="b-usecase">
            <option value="">general</option>
            <option value="customer-support">customer support</option>
            <option value="coding">coding</option>
            <option value="billing-routine">billing routine</option>
            <option value="billing-risky">billing risky</option>
            <option value="billing-incident">billing incident</option>
            <option value="voice">voice</option>
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
        <div class="b-field">
          <label for="b-maxcost">Max input AUD/MTok</label>
          <input type="number" id="b-maxcost" min="0" step="0.1" placeholder="no limit">
        </div>
        <div class="b-field">
          <label for="b-maxoutputcost">Max output AUD/MTok</label>
          <input type="number" id="b-maxoutputcost" min="0" step="0.1" placeholder="no limit">
        </div>
        <div class="b-field">
          <label for="b-maxaudioinputcost">Max input audio AUD/hr</label>
          <input type="number" id="b-maxaudioinputcost" min="0" step="0.1" placeholder="voice only">
        </div>
        <div class="b-field">
          <label for="b-maxaudiooutputcost">Max output audio AUD/hr</label>
          <input type="number" id="b-maxaudiooutputcost" min="0" step="0.1" placeholder="voice only">
        </div>
        <div class="b-field">
          <label for="b-minctx">Min context (k)</label>
          <input type="number" id="b-minctx" min="0" step="32" placeholder="e.g. 128">
        </div>
      </div>
    </div>
    <div class="builder-dark">
      <div class="builder-url">
        <span class="builder-method">GET</span>
        <div class="builder-url-text"><a id="b-url" href="/v1/models/recommend?tier=fast">/v1/models/recommend?tier=fast</a></div>
        <div class="builder-actions">
          <button class="builder-action" type="button" id="b-copy">copy</button>
          <a class="builder-action" id="b-open" href="/v1/models/recommend?tier=fast" target="_blank" rel="noopener">open</a>
        </div>
      </div>
      <div class="pre-wrap"><pre><code id="b-code">https://ai.itsolver.au/v1/models/recommend?tier=fast</code></pre></div>
    </div>
    <div class="builder-result">
      <span class="pulse" aria-hidden="true"></span>
      <span class="hint-label">live result</span>
      <code id="b-result">checking...</code>
    </div>
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
    <p>The opinionated endpoint. Apply filters and get one support/coding-appropriate model back.</p>
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
    <li>Recommendation tiers are cost-derived from the remaining support/coding candidate set.</li>
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
      if (fields.maxcost.value) params.set('maxInputCostPerMTok', fields.maxcost.value);
      if (fields.maxoutputcost.value) params.set('maxOutputCostPerMTok', fields.maxoutputcost.value);
      if (fields.maxaudioinputcost.value) params.set('maxAudioInputCostPerHour', fields.maxaudioinputcost.value);
      if (fields.maxaudiooutputcost.value) params.set('maxAudioOutputCostPerHour', fields.maxaudiooutputcost.value);
      if (fields.minctx.value) params.set('minContextWindow', String(parseInt(fields.minctx.value, 10) * 1000));
      var qs = params.toString();
      return endpoint + (qs ? '?' + qs : '');
    }

    var previewTimer = 0;
    function refreshBuilder() {
      var path = buildPath();
      var full = origin + path;
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
            if (data.recommendation) fields.result.textContent = data.recommendation.id;
            else fields.result.textContent = (data.modelCount || 0).toLocaleString() + ' models';
          })
          .catch(function () { fields.result.textContent = 'unavailable'; });
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
