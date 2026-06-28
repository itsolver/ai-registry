import { describe, expect, it } from "vitest";
import { HOME_HTML } from "../src/html";

describe("homepage copy", () => {
  it("defines customer-support AA-only scoring and dynamic safety labels", () => {
    expect(HOME_HTML).toContain(
      '<option value="balanced">balanced trade-off</option>',
    );
    expect(HOME_HTML).toContain("lowest false-positive risk");
    expect(HOME_HTML).toContain("highest AA support fit");
    expect(HOME_HTML).toContain("AA Support Score");
    expect(HOME_HTML).toContain("It is not an ITS Eval safety score.");
    expect(HOME_HTML).toContain(
      '<a href="/its-eval">Our reopened-ticket classifier replay</a>',
    );
    expect(HOME_HTML).toContain("params.set('includeItsEval', 'false')");
    expect(HOME_HTML).toContain(
      '<a href="/webdev">Our web app development benchmark composite</a>',
    );
    expect(HOME_HTML).toContain(
      "function mergeCustomerSupportBenchmarkRows(models, benchmarkModels)",
    );
    expect(HOME_HTML).toContain(
      "mergeCustomerSupportBenchmarkRows(models || [], currentTextBenchmarkModels()),",
    );
    expect(HOME_HTML).toContain(
      "var visibleRows = providerFilter\n        ? state.rows.filter(function (row) { return benchmarkRowProvider(row) === providerFilter; })",
    );
    expect(HOME_HTML).not.toContain("b-provider-table-only");
    expect(HOME_HTML).not.toContain("providerTableOnly");
    expect(HOME_HTML).toContain(
      "var supportModels = useProvidedRows ? models : activeTextBenchmarkModels(models);",
    );
    expect(HOME_HTML).toContain(
      "if (fields.usecase.value === 'customer-support') renderCurrentUseCaseBenchmarks();",
    );
    expect(HOME_HTML).toContain("currentBrowseModels = data.models || [];");
    expect(HOME_HTML).toContain(
      'id="b-run-max-range" min="0" max="5" step="0.01" value="5"',
    );
    expect(HOME_HTML).toContain("max: 5,\n      minRange: fields.runminrange");
    expect(HOME_HTML).toContain("Task AUD");
    expect(HOME_HTML).not.toContain("Output tokens/task");
    expect(HOME_HTML).not.toContain(
      "lower output tokens per Intelligence Index task",
    );
    expect(HOME_HTML).not.toContain(
      "Which text model uses the fewest output tokens?",
    );
  });
});
