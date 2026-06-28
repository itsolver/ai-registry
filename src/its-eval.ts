type ItsEvalRow = {
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
  deprecated?: boolean;
};

const ITS_EVAL_GENERATED_AT = "2026-06-07T15:46:56.835389+00:00";

const ITS_EVAL_ROWS: ItsEvalRow[] = [
  {
    displayName: "Gemma 4 26B A4B IT",
    modelKey: "gemini:gemma-4-26b-a4b-it",
    status: "complete",
    completed: 109,
    total: 109,
    accuracy: 0.8715596330275229,
    falsePositive: 5,
    falseNegative: 9,
    invalid: 0,
    errors: 0,
    costAud: 0,
    avgTokens: 1976.2385321100917,
    updatedAgo: "0h ago",
    invalidSummary: "none after invalid-only rerun",
    note: "exploratory no-paid-cost Gemma CLI row; not production-safe: 5 FP",
  },
  {
    displayName: "Gemma 4 31B IT",
    modelKey: "gemini:gemma-4-31b-it",
    status: "complete",
    completed: 109,
    total: 109,
    accuracy: 0.8623853211009175,
    falsePositive: 5,
    falseNegative: 10,
    invalid: 0,
    errors: 0,
    costAud: 0,
    avgTokens: 1982.4128440366972,
    updatedAgo: "0h ago",
    invalidSummary: "none after invalid-only rerun",
    note: "exploratory no-paid-cost Gemma CLI row; not production-safe: 5 FP",
  },
  {
    displayName: "Grok 4.3 (low)",
    modelKey: "xai:grok-4-3-low",
    status: "complete",
    completed: 109,
    total: 109,
    accuracy: 0.8532110091743119,
    falsePositive: 7,
    falseNegative: 9,
    invalid: 0,
    errors: 0,
    costAud: 0.47438860335,
    avgTokens: 2212,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "paid xAI row under USD 10 cap; not production-safe: 7 FP",
  },
  {
    displayName: "Grok 4.3 (high)",
    modelKey: "xai:grok-4-3-high",
    status: "complete",
    completed: 109,
    total: 109,
    accuracy: 0.8440366972477065,
    falsePositive: 8,
    falseNegative: 9,
    invalid: 0,
    errors: 0,
    costAud: 0.55929872455,
    avgTokens: 2423.201834862385,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "paid xAI row under USD 10 cap; not production-safe: 8 FP",
  },
  {
    displayName: "Grok 4.3 (medium)",
    modelKey: "xai:grok-4-3-medium",
    status: "complete",
    completed: 109,
    total: 109,
    accuracy: 0.8348623853211009,
    falsePositive: 7,
    falseNegative: 11,
    invalid: 0,
    errors: 0,
    costAud: 0.5413919612500001,
    avgTokens: 2385,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "paid xAI row under USD 10 cap; not production-safe: 7 FP",
  },
  {
    displayName: "Gemini 2.5 Flash-Lite",
    modelKey: "gemini:gemini-2.5-flash-lite",
    status: "complete",
    completed: 43,
    total: 43,
    accuracy: 0.8604651162790697,
    falsePositive: 3,
    falseNegative: 3,
    invalid: 0,
    errors: 0,
    costAud: 0.00720385015,
    avgTokens: 1055.4186046511627,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "not production-safe: 3 FP, 86.0% acc",
  },
  {
    displayName: "Gemini 2.5 Flash",
    modelKey: "gemini:gemini-2.5-flash",
    status: "complete",
    completed: 43,
    total: 43,
    accuracy: 0.5348837209302325,
    falsePositive: 0,
    falseNegative: 20,
    invalid: 0,
    errors: 0,
    costAud: 0.06807519965,
    avgTokens: 1339.5581395348838,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "not production-safe: 53.5% acc",
  },
  {
    displayName: "Gemini 3.1 Flash-Lite Preview",
    modelKey: "gemini:gemini-3.1-flash-lite-preview",
    status: "complete",
    completed: 43,
    total: 43,
    accuracy: 0.9069767441860465,
    falsePositive: 1,
    falseNegative: 3,
    invalid: 0,
    errors: 0,
    costAud: 0.018622781625,
    avgTokens: 1046.6511627906978,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "not production-safe: 1 FP, 90.7% acc, preview",
    deprecated: true,
  },
  {
    displayName: "Gemini 3 Flash Preview",
    modelKey: "gemini:gemini-3-flash-preview",
    status: "complete",
    completed: 43,
    total: 43,
    accuracy: 0.8604651162790697,
    falsePositive: 1,
    falseNegative: 5,
    invalid: 0,
    errors: 0,
    costAud: 0.03931838175,
    avgTokens: 1058.1162790697674,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "not production-safe: 1 FP, 86.0% acc, preview",
  },
  {
    displayName: "Gemini 3.1 Pro Preview",
    modelKey: "gemini:gemini-3.1-pro-preview",
    status: "complete",
    completed: 43,
    total: 43,
    accuracy: 0.8604651162790697,
    falsePositive: 1,
    falseNegative: 5,
    invalid: 0,
    errors: 0,
    costAud: 0.21500972100000001,
    avgTokens: 1137.953488372093,
    updatedAgo: "0h ago",
    invalidSummary: "none",
    note: "not production-safe: 1 FP, 86.0% acc, preview",
  },
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
    deprecated: true,
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
    deprecated: true,
  }
];

export const ITS_EVAL_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ITS Eval</title>
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
    .controls {
      margin: 0 0 10px;
      display: flex;
      justify-content: flex-end;
    }
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: var(--muted);
      font-size: 0.88rem;
    }
    .toggle input { margin: 0; }
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
      <span class="sub">Generated ${escapeHtml(formatDate(ITS_EVAL_GENERATED_AT))}</span>
    </div>
    <header>
      <h1>ITS Eval</h1>
      <p>Aggregate reopened-ticket classifier replay results for a narrow auto-close FP/FN eval. This is not a general model benchmark. Public rows exclude ticket IDs, customer text, and raw model outputs.</p>
    </header>

    <section class="summary" aria-label="ITS Eval summary">
      <div class="metric"><strong>${activeEvalRows().length}</strong><span>active model rows</span></div>
      <div class="metric"><strong>${countRowsWithLowFalsePositive()}</strong><span>active rows with 0-1 false positives</span></div>
      <div class="metric"><strong>${countRowsWithoutInvalids()}</strong><span>active rows with no invalid output</span></div>
      <div class="metric"><strong>${escapeHtml(bestAccuracyLabel())}</strong><span>best accuracy in this table</span></div>
    </section>

    <div class="controls">
      <label class="toggle">
        <input type="checkbox" id="show-deprecated">
        Show deprecated rows
      </label>
    </div>

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
          ${ITS_EVAL_ROWS.map(renderRow).join("\n")}
        </tbody>
      </table>
    </div>

    <section class="info" aria-label="ITS Eval notes">
      <p><strong>Invalids are contract failures.</strong> They are cases where the model did not return a parseable final intent. Invalid and error outputs fail closed to <code>Needs Help</code> and are not counted as false positives.</p>
      <p><strong>False positives matter most.</strong> A false positive is an unresolved ticket predicted as resolved, so the production recommendation path ranks ITS Eval candidates by false-positive risk before accuracy.</p>
      <p><strong>Gemini result.</strong> No Gemini candidate in this run met the production-safety gate: zero false positives, at least 95% accuracy, at least 98% parse success, and no provider errors.</p>
    </section>
  </main>
  <script>
    (function () {
      var table = document.getElementById('its-table');
      if (!table) return;
      var tbody = table.querySelector('tbody');
      var showDeprecated = document.getElementById('show-deprecated');
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
        var includeDeprecated = showDeprecated && showDeprecated.checked;
        Array.from(tbody.querySelectorAll('tr[data-deprecated="true"]')).forEach(function (row) {
          row.hidden = !includeDeprecated;
        });
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
      if (showDeprecated) showDeprecated.addEventListener('change', draw);

      draw();
    }());
  </script>
</body>
</html>`;

function renderRow(row: ItsEvalRow): string {
  const note = [row.invalidSummary, row.note].filter(Boolean).join("; ");
  const attributes = [
    row.highlight ? 'class="highlight"' : "",
    row.deprecated ? 'data-deprecated="true" hidden' : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<tr${attributes ? ` ${attributes}` : ""}>
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
  return activeEvalRows().filter((row) => row.falsePositive <= 1).length;
}

function countRowsWithoutInvalids(): number {
  return activeEvalRows().filter((row) => row.invalid === 0).length;
}

function bestAccuracyLabel(): string {
  const best = activeEvalRows().reduce((left, right) =>
    right.accuracy > left.accuracy ? right : left,
  );
  return `${formatPercent(best.accuracy)} ${best.displayName}`;
}

function activeEvalRows(): ItsEvalRow[] {
  return ITS_EVAL_ROWS.filter((row) => row.deprecated !== true);
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
