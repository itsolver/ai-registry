type ItsBenchmarkRow = {
  displayName: string;
  modelKey: string;
  status: "complete";
  completed: number;
  total: number;
  accuracy: number;
  falsePositive: number;
  falseNegative: number;
  invalid: number;
  errors: number;
  costAud: number;
  avgTokens: number;
  updatedAgo: string;
  invalidSummary: string;
  note?: string;
  highlight?: boolean;
};

const ITS_BENCHMARK_GENERATED_AT = "2026-06-06T12:27:59.180541+00:00";

const ITS_BENCHMARK_ROWS: ItsBenchmarkRow[] = [
  {
    displayName: "gpt-5.4 (low)",
    modelKey: "codex:gpt-5.4-low",
    status: "complete",
    completed: 81,
    total: 81,
    accuracy: 0.8024691358024691,
    falsePositive: 0,
    falseNegative: 16,
    invalid: 0,
    errors: 0,
    costAud: 2.6752432059999998,
    avgTokens: 14232.296296296297,
    updatedAgo: "360h ago",
    invalidSummary: "none",
  },
  {
    displayName: "gemini-2.5-flash",
    modelKey: "gemini:gemini-2.5-flash",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.3055555555555556,
    falsePositive: 0,
    falseNegative: 0,
    invalid: 25,
    errors: 0,
    costAud: 0.0522013,
    avgTokens: 2246.4166666666665,
    updatedAgo: "742h ago",
    invalidSummary: "missing parseable intent after reasoning",
  },
  {
    displayName: "gpt-5-mini",
    modelKey: "openai:gpt-5-mini",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.5,
    falsePositive: 0,
    falseNegative: 0,
    invalid: 18,
    errors: 0,
    costAud: 0.039985,
    avgTokens: 2079.6944444444443,
    updatedAgo: "742h ago",
    invalidSummary: "length finish with empty content",
  },
  {
    displayName: "gpt-5-nano",
    modelKey: "openai:gpt-5-nano",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.3055555555555556,
    falsePositive: 0,
    falseNegative: 0,
    invalid: 25,
    errors: 0,
    costAud: 0.0082558,
    avgTokens: 2097.6666666666665,
    updatedAgo: "742h ago",
    invalidSummary: "length finish with empty content",
  },
  {
    displayName: "grok-3-mini",
    modelKey: "xai:grok-3-mini",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.3333333333333333,
    falsePositive: 0,
    falseNegative: 0,
    invalid: 24,
    errors: 0,
    costAud: 0.0323291,
    avgTokens: 2481.972222222222,
    updatedAgo: "742h ago",
    invalidSummary: "plain reasoning missing output contract",
  },
  {
    displayName: "grok-4-1-fast-reasoning",
    modelKey: "xai:grok-4-1-fast-reasoning",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.8888888888888888,
    falsePositive: 0,
    falseNegative: 2,
    invalid: 2,
    errors: 0,
    costAud: 0.026485400000000003,
    avgTokens: 2562.3611111111113,
    updatedAgo: "742h ago",
    invalidSummary: "missing parseable intent after reasoning",
  },
  {
    displayName: "grok-4-3",
    modelKey: "xai:grok-4-3",
    status: "complete",
    completed: 81,
    total: 81,
    accuracy: 0.8518518518518519,
    falsePositive: 0,
    falseNegative: 12,
    invalid: 0,
    errors: 0,
    costAud: 0.2853544864,
    avgTokens: 1582.6172839506175,
    updatedAgo: "360h ago",
    invalidSummary: "none",
  },
  {
    displayName: "gemini-3-flash-preview",
    modelKey: "gemini:gemini-3-flash-preview",
    status: "complete",
    completed: 36,
    total: 36,
    accuracy: 0.9166666666666666,
    falsePositive: 1,
    falseNegative: 2,
    invalid: 0,
    errors: 0,
    costAud: 0.0529495,
    avgTokens: 2068.3055555555557,
    updatedAgo: "742h ago",
    invalidSummary: "none",
    note: "promising preview; not a default production recommendation",
    highlight: true,
  },
];

export const ITS_BENCHMARK_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ITS Auto-Close Benchmark</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17202a;
      --muted: #5f6b7a;
      --line: #d9e0e8;
      --bg: #f6f8fb;
      --panel: #ffffff;
      --accent: #0f766e;
      --warn: #a16207;
      --danger: #b42318;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--bg);
      line-height: 1.45;
    }
    main {
      width: min(1180px, calc(100vw - 28px));
      margin: 0 auto;
      padding: 22px 0 36px;
    }
    .topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }
    a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
    h1 {
      margin: 0 0 8px;
      font-size: clamp(1.55rem, 3vw, 2.35rem);
      line-height: 1.1;
      letter-spacing: 0;
    }
    p { margin: 0; color: var(--muted); }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin: 22px 0;
    }
    .metric {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
    }
    .metric strong {
      display: block;
      font-size: 1.35rem;
      line-height: 1.1;
    }
    .metric span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 0.86rem;
    }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }
    table {
      width: 100%;
      min-width: 980px;
      border-collapse: collapse;
      font-size: 0.92rem;
    }
    th, td {
      padding: 10px 11px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
    }
    th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #edf3f7;
      color: #243140;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0;
      cursor: pointer;
      user-select: none;
    }
    th[aria-sort="ascending"]::after { content: " asc"; color: var(--accent); text-transform: none; }
    th[aria-sort="descending"]::after { content: " desc"; color: var(--accent); text-transform: none; }
    tbody tr:last-child td { border-bottom: 0; }
    tbody tr.highlight { background: #eefaf7; }
    .model {
      display: block;
      font-weight: 700;
    }
    .sub {
      display: block;
      margin-top: 2px;
      color: var(--muted);
      font-size: 0.8rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 2px 7px;
      border-radius: 999px;
      background: #e6f4f1;
      color: #115e59;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .risk { color: var(--danger); font-weight: 700; }
    .ok { color: var(--accent); font-weight: 700; }
    .note {
      max-width: 280px;
      white-space: normal;
      color: var(--muted);
    }
    .info {
      margin-top: 14px;
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-size: 0.92rem;
    }
    .info strong { color: var(--ink); }
    @media (max-width: 720px) {
      main { width: min(100vw - 18px, 1180px); padding-top: 14px; }
      .topline { align-items: flex-start; flex-direction: column; gap: 8px; }
      .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      table { min-width: 900px; font-size: 0.86rem; }
      th, td { padding: 9px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="topline">
      <a href="/">ai.itsolver.au</a>
      <span class="sub">Generated ${escapeHtml(formatDate(ITS_BENCHMARK_GENERATED_AT))}</span>
    </div>
    <header>
      <h1>ITS Auto-Close Benchmark</h1>
      <p>Aggregate reopened-ticket classifier replay results for models with potential low false-positive behavior. Public rows exclude ticket IDs, customer text, and raw model outputs.</p>
    </header>

    <section class="summary" aria-label="Benchmark summary">
      <div class="metric"><strong>${ITS_BENCHMARK_ROWS.length}</strong><span>curated model rows</span></div>
      <div class="metric"><strong>${countRowsWithLowFalsePositive()}</strong><span>rows with 0-1 false positives</span></div>
      <div class="metric"><strong>${countRowsWithoutInvalids()}</strong><span>rows with no invalid output</span></div>
      <div class="metric"><strong>${escapeHtml(bestAccuracyLabel())}</strong><span>best accuracy in this table</span></div>
    </section>

    <div class="table-wrap">
      <table id="its-table">
        <thead>
          <tr>
            <th data-sort="model" aria-sort="none">Model</th>
            <th data-sort="status" aria-sort="none">Status</th>
            <th data-sort="cases" aria-sort="none">Cases</th>
            <th data-sort="accuracy" aria-sort="descending">Accuracy</th>
            <th data-sort="fp" aria-sort="none">FP</th>
            <th data-sort="fn" aria-sort="none">FN</th>
            <th data-sort="invalid" aria-sort="none">Invalid</th>
            <th data-sort="errors" aria-sort="none">Errors</th>
            <th data-sort="cost" aria-sort="none">Cost AUD</th>
            <th data-sort="tokens" aria-sort="none">Avg tokens</th>
            <th data-sort="updated" aria-sort="none">Age</th>
            <th data-sort="note" aria-sort="none">Invalid / notes</th>
          </tr>
        </thead>
        <tbody>
          ${ITS_BENCHMARK_ROWS.map(renderRow).join("\n")}
        </tbody>
      </table>
    </div>

    <section class="info" aria-label="Benchmark notes">
      <p><strong>Invalids are contract failures.</strong> They are cases where the model did not return a parseable final intent. Invalid and error outputs fail closed to <code>Needs Help</code> and are not counted as false positives.</p>
      <p><strong>False positives matter most.</strong> A false positive is an unresolved ticket predicted as resolved, so the production recommendation path ranks ITS benchmarked candidates by false-positive risk before accuracy.</p>
      <p><strong>Preview caveat.</strong> <code>gemini:gemini-3-flash-preview</code> is highlighted because this run is promising, but it remains a preview model and is not a default long-lived production recommendation.</p>
    </section>
  </main>
  <script>
    (function () {
      var table = document.getElementById('its-table');
      if (!table) return;
      var tbody = table.querySelector('tbody');
      var sortState = { key: 'accuracy', direction: 'desc' };

      function cellValue(row, key) {
        var cell = row.querySelector('[data-value-' + key + ']');
        if (!cell) return '';
        var value = cell.getAttribute('data-value-' + key) || '';
        var number = Number(value);
        return Number.isFinite(number) && value.trim() !== '' ? number : value.toLowerCase();
      }

      function compareRows(left, right) {
        var a = cellValue(left, sortState.key);
        var b = cellValue(right, sortState.key);
        var result = 0;
        if (typeof a === 'number' && typeof b === 'number') result = a - b;
        else result = String(a).localeCompare(String(b));
        return sortState.direction === 'asc' ? result : -result;
      }

      function draw() {
        Array.from(table.querySelectorAll('th[data-sort]')).forEach(function (th) {
          th.setAttribute('aria-sort', th.getAttribute('data-sort') === sortState.key ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none');
        });
        Array.from(tbody.querySelectorAll('tr')).sort(compareRows).forEach(function (row) {
          tbody.appendChild(row);
        });
      }

      table.addEventListener('click', function (event) {
        var header = event.target.closest('th[data-sort]');
        if (!header) return;
        var key = header.getAttribute('data-sort');
        if (!key) return;
        if (sortState.key === key) {
          sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
          sortState.key = key;
          sortState.direction = key === 'model' || key === 'status' || key === 'note' ? 'asc' : 'desc';
        }
        draw();
      });

      draw();
    }());
  </script>
</body>
</html>`;

function renderRow(row: ItsBenchmarkRow): string {
  const note = [row.invalidSummary, row.note].filter(Boolean).join("; ");
  return `<tr${row.highlight ? ' class="highlight"' : ""}>
            <td data-value-model="${escapeHtml(row.displayName.toLowerCase())}">
              <span class="model">${escapeHtml(row.displayName)}</span>
              <span class="sub">${escapeHtml(row.modelKey)}</span>
            </td>
            <td data-value-status="${escapeHtml(row.status)}">${escapeHtml(row.status)}${row.highlight ? ' <span class="badge">promising preview</span>' : ""}</td>
            <td data-value-cases="${row.completed}">${row.completed}/${row.total}</td>
            <td data-value-accuracy="${row.accuracy}">${formatPercent(row.accuracy)}</td>
            <td data-value-fp="${row.falsePositive}" class="${row.falsePositive > 0 ? "risk" : "ok"}">${row.falsePositive}</td>
            <td data-value-fn="${row.falseNegative}">${row.falseNegative}</td>
            <td data-value-invalid="${row.invalid}" class="${row.invalid > 0 ? "risk" : "ok"}">${row.invalid}</td>
            <td data-value-errors="${row.errors}" class="${row.errors > 0 ? "risk" : "ok"}">${row.errors}</td>
            <td data-value-cost="${row.costAud}">${formatAud(row.costAud)}</td>
            <td data-value-tokens="${row.avgTokens}">${formatInteger(row.avgTokens)}</td>
            <td data-value-updated="${ageHours(row.updatedAgo)}">${escapeHtml(row.updatedAgo)}</td>
            <td data-value-note="${escapeHtml(note.toLowerCase())}" class="note">${escapeHtml(note)}</td>
          </tr>`;
}

function countRowsWithLowFalsePositive(): number {
  return ITS_BENCHMARK_ROWS.filter((row) => row.falsePositive <= 1).length;
}

function countRowsWithoutInvalids(): number {
  return ITS_BENCHMARK_ROWS.filter((row) => row.invalid === 0).length;
}

function bestAccuracyLabel(): string {
  const best = ITS_BENCHMARK_ROWS.reduce((left, right) =>
    right.accuracy > left.accuracy ? right : left,
  );
  return `${formatPercent(best.accuracy)} ${best.displayName}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatAud(value: number): string {
  return `$${value.toLocaleString("en-AU", {
    minimumFractionDigits: value < 0.1 ? 4 : 2,
    maximumFractionDigits: value < 0.1 ? 4 : 2,
  })}`;
}

function formatInteger(value: number): string {
  return Math.round(value).toLocaleString("en-AU");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace(".180Z", "Z");
}

function ageHours(value: string): number {
  const match = value.match(/^(\d+)h/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
