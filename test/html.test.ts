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
    expect(HOME_HTML).toContain("It is not an ITS safety score.");
    expect(HOME_HTML).toContain(
      '<a href="/its-eval">Our reopened-ticket classifier replay</a>',
    );
    expect(HOME_HTML).toContain(
      '<a href="/webdev">Our web app development benchmark composite</a>',
    );
    expect(HOME_HTML).toContain(
      '<option value="benchmarks">browse benchmark rows</option>',
    );
    expect(HOME_HTML).toContain(
      "fields.endpoint.value === 'benchmarks'",
    );
    expect(HOME_HTML).toContain(
      "currentBrowseModels = data.benchmarks || [];",
    );
    expect(HOME_HTML).not.toContain(
      "function mergeCustomerSupportBenchmarkRows(models, benchmarkModels)",
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
      "renderTextBenchmarks(rows, fields.usecase.value === 'document-processing');",
    );
    expect(HOME_HTML).toContain(
      "if (fields.usecase.value === 'customer-support') renderCurrentUseCaseBenchmarks();",
    );
    expect(HOME_HTML).toContain("currentBrowseModels = data.models || [];");
    expect(HOME_HTML).toContain(
      '<option value="document-processing">document processing (OCR)</option>',
    );
    expect(HOME_HTML).toContain(
      '<option value="voice">speech to speech (voice)</option>',
    );
    expect(HOME_HTML).toContain("Speech-To-Speech (Voice) Benchmark");
    expect(HOME_HTML).toContain(
      "Current speech-to-speech (voice) candidates",
    );
    expect(HOME_HTML).toContain(
      '<div class="b-field" data-filter-scope="customer-support">\n          <label for="b-capability">Must have</label>',
    );
    expect(HOME_HTML).toContain(
      '<label for="b-visualreasoning-min-range">Min visual reasoning</label>',
    );
    expect(HOME_HTML).toContain(
      '<label for="b-imagecost-max-range">Max image AUD/1k</label>',
    );
    expect(HOME_HTML).toContain(
      'data-filter-scope="customer-support document-processing"',
    );
    expect(HOME_HTML).not.toContain('data-filter-scope="text"');
    expect(HOME_HTML).toContain("Image AUD/1k");
    expect(HOME_HTML).toContain("highest accuracy");
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

  it("serializes only filters for the active use case", () => {
    const buildPath = HOME_HTML.slice(
      HOME_HTML.indexOf("function buildPath()"),
      HOME_HTML.indexOf("function setSelectValue"),
    );
    const speechToTextBranch = buildPath.slice(
      buildPath.indexOf("fields.usecase.value === 'speech-to-text'"),
      buildPath.indexOf("fields.usecase.value === 'document-processing'"),
    );
    const documentBranch = buildPath.slice(
      buildPath.indexOf("fields.usecase.value === 'document-processing'"),
      buildPath.indexOf("} else {", buildPath.indexOf("fields.usecase.value === 'document-processing'")),
    );

    expect(speechToTextBranch).toContain(
      "params.set('maxTranscriptionCostPer1kMinutes'",
    );
    expect(speechToTextBranch).toContain("params.set('maxAaWer'");
    expect(speechToTextBranch).not.toContain("minVisualReasoning");
    expect(speechToTextBranch).not.toContain("minInputCostPerMTok");
    expect(speechToTextBranch).not.toContain("minContextWindow");
    expect(documentBranch).toContain("params.set('minVisualReasoning'");
    expect(documentBranch).toContain(
      "params.set('maxImageInputCostPer1kImagesAud'",
    );
    expect(documentBranch).toContain(
      "params.set('minIntelligenceCostPerTaskAud'",
    );
    expect(documentBranch).not.toContain("includeItsEval");
    expect(documentBranch).not.toContain("minInputCostPerMTok");
    expect(documentBranch).not.toContain("minContextWindow");
  });
});
