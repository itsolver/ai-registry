import { describe, expect, it } from "vitest";
import { HOME_HTML } from "../src/html";

describe("homepage copy", () => {
  it("defines customer-support AA-only scoring and dynamic safety labels", () => {
    expect(HOME_HTML).toContain(
      '<option value="balanced">balanced trade-off</option>',
    );
    expect(HOME_HTML).toContain("highest ITS safety");
    expect(HOME_HTML).toContain("highest AA support fit");
    expect(HOME_HTML).toContain("AA Support Score");
    expect(HOME_HTML).toContain("It is not an ITS safety score.");
    expect(HOME_HTML).toContain(
      '<a href="/its">Our reopened-ticket classifier replay</a>',
    );
    expect(HOME_HTML).toContain(
      "function mergeCustomerSupportBenchmarkRows(models, benchmarkModels)",
    );
    expect(HOME_HTML).toContain(
      "if (fields.usecase.value === 'customer-support') renderCurrentUseCaseBenchmarks();",
    );
    expect(HOME_HTML).toContain("currentBrowseModels = data.models || [];");
  });
});
