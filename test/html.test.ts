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
      '<a href="/webdev">Our front-end development evidence page</a>',
    );
    expect(HOME_HTML).toContain(
      '<option value="benchmarks">browse benchmark rows</option>',
    );
    expect(HOME_HTML).toContain(
      "fields.endpoint.value === 'benchmarks'",
    );
    expect(HOME_HTML).toContain(
      "renderFilteredModelBenchmarks(\n          (data && data.benchmarks) || [],\n          (data && data.sourceStatus) || null",
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
      "if (isBrowsingBenchmarks() && fields.usecase.value === 'customer-support') renderCurrentUseCaseBenchmarks();",
    );
    expect(HOME_HTML).not.toContain("currentBrowseModels");
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
      buildPath.indexOf("fields.usecase.value === 'front-end-web-dev'"),
    );
    const frontendBranch = buildPath.slice(
      buildPath.indexOf("fields.usecase.value === 'front-end-web-dev'"),
      buildPath.indexOf(
        "} else {",
        buildPath.indexOf("fields.usecase.value === 'front-end-web-dev'"),
      ),
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
    expect(frontendBranch).toContain("params.set('minInputCostPerMTok'");
    expect(frontendBranch).toContain("params.set('maxInputCostPerMTok'");
    expect(frontendBranch).toContain("params.set('minOutputCostPerMTok'");
    expect(frontendBranch).toContain("params.set('maxOutputCostPerMTok'");
    expect(frontendBranch).toContain("params.set('minContextWindow'");
    expect(frontendBranch).toContain("params.set('maxContextWindow'");
    expect(frontendBranch).not.toContain("includeItsEval");
    expect(frontendBranch).not.toContain("minVisualReasoning");
    expect(frontendBranch).not.toContain("maxAaWer");

    const createBuildPath = new Function(
      "fields",
      "includeItsBenchmark",
      `${buildPath}\nreturn buildPath;`,
    ) as (
      fields: Record<string, { value: string }>,
      includeItsBenchmark: () => boolean,
    ) => () => string;
    const populated = (value: string) => ({ value });
    const frontendPath = createBuildPath(
      {
        endpoint: populated("benchmarks"),
        tier: populated("fast"),
        provider: populated("moonshotai"),
        usecase: populated("front-end-web-dev"),
        capability: populated("reasoning"),
        mincost: populated("4.5"),
        maxcost: populated("15"),
        minoutputcost: populated("22.5"),
        maxoutputcost: populated("75"),
        minruncost: populated("0.1"),
        maxruncost: populated("5"),
        minintelligence: populated("80"),
        minvisualreasoning: populated("70"),
        maximagecost: populated("3"),
        maxaudioinputcost: populated("4"),
        maxaudiooutputcost: populated("5"),
        maxtranscriptioncost: populated("6"),
        maxaawer: populated("3"),
        minctx: populated("1000"),
        maxctx: populated("1200"),
      },
      () => {
        throw new Error("frontend serialization must not read ITS state");
      },
    )();
    const frontendUrl = new URL(frontendPath, "https://ai.itsolver.au");
    expect(frontendUrl.pathname).toBe("/v1/benchmarks");
    expect(Object.fromEntries(frontendUrl.searchParams)).toEqual({
      tier: "fast",
      provider: "moonshotai",
      useCase: "front-end-web-dev",
      minInputCostPerMTok: "4.5",
      maxInputCostPerMTok: "15",
      minOutputCostPerMTok: "22.5",
      maxOutputCostPerMTok: "75",
      minContextWindow: "1000000",
      maxContextWindow: "1200000",
    });
  });

  it("exposes the front-end web dev option, panel, and Arena caveat", () => {
    expect(HOME_HTML).toContain(
      '<option value="front-end-web-dev">front-end web dev</option>',
    );
    expect(HOME_HTML).toContain(
      '<option value="moonshotai">moonshot ai</option>',
    );
    expect(HOME_HTML).toContain(
      'data-benchmark-panel="front-end-web-dev" hidden',
    );
    expect(HOME_HTML).toContain('id="frontendRows"');
    expect(HOME_HTML).toContain("Front-End Web Dev Benchmark");
    expect(HOME_HTML).toContain("Arena Frontend Code");
    expect(HOME_HTML).toContain(
      'id="frontendRecommendationCredit" hidden>Source: <a href="https://arena.ai/leaderboard/code/webdev">Arena Frontend Code leaderboard</a>',
    );
    expect(HOME_HTML).toContain(
      "In the checked August 15, 2026 snapshot, Claude Opus 5 Max ranked first",
    );
    expect(HOME_HTML).toContain("Kimi K3 ranked third");
    expect(HOME_HTML).toContain("fresh checked Arena snapshot");
    expect(HOME_HTML).toContain("best value in Arena top 10");
    expect(HOME_HTML).toContain("lowest output cost in Arena top 20");
    expect(HOME_HTML).toContain("highest Arena score");
    expect(HOME_HTML).toContain("Configuration</th>");
    expect(HOME_HTML).toContain("Registry model</th>");
    expect(HOME_HTML).toContain("Codex-harness labels describe evaluation context");
    expect(HOME_HTML).not.toContain("Kimi K3 is currently first");
    expect(HOME_HTML).toContain("renderFrontendWebDevBenchmarks(models || [])");
  });

  it("defaults front-end web dev to highest Arena score", () => {
    const defaultTierSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function defaultTierForUseCase"),
      HOME_HTML.indexOf("function updateTierOptions"),
    );
    const createDefaultTier = new Function(
      `${defaultTierSource}\nreturn defaultTierForUseCase;`,
    ) as () => (useCase: string) => string;
    const defaultTier = createDefaultTier();

    expect(defaultTier("front-end-web-dev")).toBe("best");
    expect(defaultTier("customer-support")).toBe("fast");
    expect(HOME_HTML).toContain(
      "fields.tier.value = defaultTierForUseCase(fields.usecase.value);",
    );
  });

  it("shows preliminary Arena status in front-end recommendation mode", () => {
    const recommendationColumnsSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function recommendationColumns(useCase)"),
      HOME_HTML.indexOf("function renderRecommendationResponse"),
    );
    type RecommendationColumn = {
      label: string;
      render: (row: { model: unknown }) => string;
    };
    const createRecommendationColumns = new Function(
      "frontendWebDevSignals",
      "frontendConfigurationLabel",
      "frontendRegistryModelLabel",
      "frontendArenaScoreLabel",
      "money",
      "renderModelCell",
      "escapeHtml",
      `${recommendationColumnsSource}\nreturn recommendationColumns;`,
    ) as (
      frontendWebDevSignals: (model: unknown) => { preliminary?: boolean },
      frontendConfigurationLabel: (model: unknown) => string,
      frontendRegistryModelLabel: (model: unknown) => string,
      frontendArenaScoreLabel: (model: unknown) => string,
      money: (value: unknown) => string,
      renderModelCell: (model: unknown) => string,
      escapeHtml: (value: unknown) => string,
    ) => (useCase: string) => RecommendationColumn[];
    const recommendationColumns = createRecommendationColumns(
      (model) =>
        (model as {
          benchmarks?: { frontendWebDev?: { preliminary?: boolean } };
        }).benchmarks?.frontendWebDev ?? {},
      (model) =>
        (model as { benchmarks?: { frontendWebDev?: { configuration?: { displayLabel?: string } } } })
          .benchmarks?.frontendWebDev?.configuration?.displayLabel ?? "base model",
      (model) =>
        (model as { registryModelId?: string }).registryModelId ?? "-",
      () => "",
      () => "",
      () => "",
      (value) => String(value),
    );
    const columns = recommendationColumns("front-end-web-dev");
    const status = columns.find((column) => column.label === "Status");
    const configuration = columns.find(
      (column) => column.label === "Configuration",
    );
    const registryModel = columns.find(
      (column) => column.label === "Registry model",
    );

    expect(status).toBeDefined();
    expect(
      status?.render({
        model: { benchmarks: { frontendWebDev: { preliminary: true } } },
      }),
    ).toBe("preliminary");
    expect(
      configuration?.render({
        model: {
          benchmarks: {
            frontendWebDev: {
              configuration: { displayLabel: "xhigh via Codex harness" },
            },
          },
        },
      }),
    ).toBe("xhigh via Codex harness");
    expect(
      registryModel?.render({ model: { registryModelId: "gpt-5.6-sol" } }),
    ).toContain("gpt-5.6-sol");
  });

  it("shows and clears the latest-model option only for best recommendations", () => {
    const source = HOME_HTML.slice(
      HOME_HTML.indexOf("function updateLatestOptionVisibility"),
      HOME_HTML.indexOf("function highlightBenchmark"),
    );
    const fields = {
      endpoint: { value: "recommend" },
      tier: { value: "best" },
      allowlatest: { checked: true },
      allowlatestfield: { hidden: true },
    };
    const createUpdate = new Function(
      "fields",
      `${source}\nreturn updateLatestOptionVisibility;`,
    ) as (
      fieldsValue: typeof fields,
    ) => () => void;
    const update = createUpdate(fields);

    update();
    expect(fields.allowlatestfield.hidden).toBe(false);
    expect(fields.allowlatest.checked).toBe(true);

    fields.tier.value = "balanced";
    update();
    expect(fields.allowlatestfield.hidden).toBe(true);
    expect(fields.allowlatest.checked).toBe(false);

    fields.allowlatest.checked = true;
    fields.tier.value = "best";
    fields.endpoint.value = "benchmarks";
    update();
    expect(fields.allowlatestfield.hidden).toBe(true);
    expect(fields.allowlatest.checked).toBe(false);
  });

  it("serializes and restores the latest-model evidence policy", () => {
    const buildPathSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function buildPath()"),
      HOME_HTML.indexOf("function setSelectValue"),
    );
    const fields = {
      endpoint: { value: "recommend" },
      tier: { value: "best" },
      provider: { value: "" },
      capability: { value: "" },
      usecase: { value: "voice" },
      allowlatest: { checked: true },
      maxaudioinputcost: { value: "" },
      maxaudiooutputcost: { value: "" },
    };
    const createBuildPath = new Function(
      "fields",
      `${buildPathSource}\nreturn buildPath;`,
    ) as (fieldsValue: typeof fields) => () => string;
    const buildPath = createBuildPath(fields);
    const bestUrl = new URL(buildPath(), "https://ai.itsolver.au");

    expect(bestUrl.searchParams.get("allowUnbenchmarkedLatest")).toBe("true");
    fields.tier.value = "balanced";
    expect(
      new URL(buildPath(), "https://ai.itsolver.au").searchParams.has(
        "allowUnbenchmarkedLatest",
      ),
    ).toBe(false);

    const restoreSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function restoreBuilderStateFromUrl"),
      HOME_HTML.indexOf("function isCurrentBuilderRequest"),
    );
    const input = () => ({ value: "" });
    const restoredFields = {
      endpoint: input(),
      tier: input(),
      provider: input(),
      capability: input(),
      usecase: input(),
      allowlatest: { checked: false },
      includeits: { checked: true },
      inputminrange: input(),
      inputmaxrange: input(),
      outputminrange: input(),
      outputmaxrange: input(),
      runminrange: input(),
      runmaxrange: input(),
      minintelligence: input(),
      audioinputmaxrange: input(),
      maxaudiooutputcost: input(),
      transcriptionmaxrange: input(),
      aawermaxrange: input(),
      visualreasoningminrange: input(),
      imagecostmaxrange: input(),
      contextminrange: input(),
      contextmaxrange: input(),
    };
    const createRestore = new Function(
      "fields",
      "window",
      "setSelectValue",
      "setInputValue",
      `${restoreSource}\nreturn restoreBuilderStateFromUrl;`,
    ) as (
      fieldsValue: typeof restoredFields,
      windowValue: { location: { search: string } },
      setSelectValue: (field: { value: string }, value: string | null) => void,
      setInputValue: (field: { value: string }, value: unknown) => void,
    ) => () => void;
    const restore = createRestore(
      restoredFields,
      {
        location: {
          search:
            "?endpoint=recommend&tier=best&useCase=voice&allowUnbenchmarkedLatest=true",
        },
      },
      (field, value) => {
        if (value) field.value = value;
      },
      (field, value) => {
        if (value !== null && value !== undefined && value !== "") {
          field.value = String(value);
        }
      },
    );

    restore();
    expect(restoredFields.endpoint.value).toBe("recommend");
    expect(restoredFields.tier.value).toBe("best");
    expect(restoredFields.usecase.value).toBe("voice");
    expect(restoredFields.allowlatest.checked).toBe(true);
  });

  it("switches among visibly distinct recommendation, benchmark, and registry views", () => {
    expect(HOME_HTML).toContain('data-mode-panel="recommend"');
    expect(HOME_HTML).toContain('data-mode-panel="benchmarks" hidden');
    expect(HOME_HTML).toContain('data-mode-panel="models" hidden');
    expect(HOME_HTML).toContain("setText('benchmarkTitle', 'Registry Models');");
    expect(HOME_HTML).toContain(
      "copy.title.replace(/ Benchmark$/, '') + ' Recommendation'",
    );
    expect(HOME_HTML).toContain("copy.title + ' Rows'");

    expect(HOME_HTML).toContain('id="recommendationRows"');
    expect(HOME_HTML).toContain("label: 'Role'");
    expect(HOME_HTML).toContain("label: 'ITS FP'");
    expect(HOME_HTML).toContain("label: 'Visual'");
    expect(HOME_HTML).toContain("label: 'AA Index'");
    expect(HOME_HTML).toContain("label: 'τ-Voice'");
    expect(HOME_HTML).toContain("label: 'AA-WER'");

    expect(HOME_HTML).toContain('id="registryRows"');
    expect(HOME_HTML).toContain("label: 'Released / updated'");
    expect(HOME_HTML).toContain("label: 'Availability'");
    expect(HOME_HTML).toContain("label: 'Context'");
    expect(HOME_HTML).toContain("label: 'Input AUD/MTok'");
    expect(HOME_HTML).toContain("label: 'Output AUD/MTok'");
    expect(HOME_HTML).toContain("label: 'Capabilities'");
  });

  it("keeps non-recommendable benchmark rows visible with an eligibility reason", () => {
    expect(HOME_HTML).toContain(
      "return hasBenchmark || model.eligibilityReason === 'missing_voice_benchmark';",
    );
    expect(HOME_HTML).toContain(
      "if (!signals || (!isBrowsingBenchmarks() && model.recommendable === false)) return false;",
    );
    expect(HOME_HTML).toContain(
      "if (isBrowsingBenchmarks()) return Boolean(signals);",
    );
    expect(HOME_HTML).toContain("label: 'Eligibility'");
    expect(HOME_HTML).toContain("typeof model.eligibilityReason === 'string'");
    expect(HOME_HTML).toContain("Not eligible: ");
  });

  it("uses AA Index first and keeps current voice models awaiting benchmarks visible", () => {
    expect(HOME_HTML).toContain(
      "compareNumberDesc(leftVoice.qualityIndex, rightVoice.qualityIndex)",
    );
    expect(HOME_HTML).toContain(
      "return { key: 'quality', direction: 'desc', compare: voiceQualityRowCompare };",
    );
    expect(HOME_HTML).toContain(
      "{ key: 'quality', label: 'AA Index'",
    );

    const source = HOME_HTML.slice(
      HOME_HTML.indexOf("function voiceBenchmarkModels"),
      HOME_HTML.indexOf("function voiceSourceLabel"),
    );
    const createFilter = new Function(
      "isBrowsingBenchmarks",
      `${source}\nreturn voiceBenchmarkModels;`,
    ) as (
      isBrowsingValue: () => boolean,
    ) => (models: Array<Record<string, unknown>>) => Array<Record<string, unknown>>;
    const benchmarked = {
      id: "gpt-realtime-2",
      recommendable: true,
      benchmarks: { voice: { qualityIndex: 72 } },
    };
    const awaitingBenchmark = {
      id: "gpt-realtime-2.1",
      recommendable: false,
      eligibilityReason: "missing_voice_benchmark",
      benchmarks: {},
    };
    const browseRows = createFilter(() => true)([
      benchmarked,
      awaitingBenchmark,
    ]);
    const recommendationRows = createFilter(() => false)([
      benchmarked,
      awaitingBenchmark,
    ]);

    expect(browseRows.map((row) => row.id)).toEqual([
      "gpt-realtime-2",
      "gpt-realtime-2.1",
    ]);
    expect(recommendationRows.map((row) => row.id)).toEqual([
      "gpt-realtime-2",
    ]);
  });

  it("renders voice source state from response metadata", () => {
    const source = HOME_HTML.slice(
      HOME_HTML.indexOf("function voiceSourceLabel"),
      HOME_HTML.indexOf("function renderVoiceBenchmarks"),
    );
    const createLabel = new Function(
      "formatAge",
      `${source}\nreturn voiceSourceLabel;`,
    ) as (
      formatAgeValue: (value: string) => string,
    ) => (status: Record<string, unknown>) => string;
    const label = createLabel(() => "2 hours ago");

    expect(
      label({
        state: "live",
        origin: "aa_api",
        fetchedAt: "2026-07-17T00:00:00Z",
        rowCount: 12,
      }),
    ).toBe("live · AA API · 12 rows · 2 hours ago");
    expect(
      label({
        state: "fallback_stale",
        origin: "kv_last_known_good",
        fetchedAt: "2026-06-01T00:00:00Z",
        rowCount: 1,
      }),
    ).toBe("stale fallback · last-known-good cache · 1 row · 2 hours ago");
  });

  it("sorts descending numeric signals with missing values last", () => {
    const source = HOME_HTML.slice(
      HOME_HTML.indexOf("function compareNumberAsc"),
      HOME_HTML.indexOf("function customerSupportSafetyRowCompare"),
    );
    const createComparators = new Function(
      `${source}\nreturn { compareNumberAsc, compareNumberDesc };`,
    ) as () => {
      compareNumberAsc: (left: unknown, right: unknown) => number;
      compareNumberDesc: (left: unknown, right: unknown) => number;
    };
    const { compareNumberDesc } = createComparators();

    expect(compareNumberDesc(90, 80)).toBeLessThan(0);
    expect(compareNumberDesc(undefined, 80)).toBeGreaterThan(0);
    expect(compareNumberDesc(80, undefined)).toBeLessThan(0);
    expect(compareNumberDesc(undefined, undefined)).toBe(0);
  });

  it("keeps independent mode responses and rejects stale asynchronous results", () => {
    expect(HOME_HTML).toContain(
      "var modeResponses = {\n      recommend: null,\n      benchmarks: null,\n      models: null\n    };",
    );
    expect(HOME_HTML).toContain("var requestId = ++builderRequestSequence;");
    expect(HOME_HTML).toContain("requestId === builderRequestSequence");
    expect(HOME_HTML).toContain("requestedMode === fields.endpoint.value");
    expect(HOME_HTML).toContain("requestedPath === buildPath()");
    expect(HOME_HTML).toContain(
      "if (!isCurrentBuilderRequest(requestId, requestedMode, requestedPath)) return;",
    );
    expect(HOME_HTML).toContain(
      "modeResponses[requestedMode] = { path: requestedPath, data: data };",
    );
    expect(HOME_HTML).toContain("function recommendationFamilyKey(model)");
    expect(HOME_HTML).toContain("if (!key || seen[key]) return;");
  });

  it("hides benchmark-only controls and sends no use-case or priority in registry mode", () => {
    expect(HOME_HTML).toContain(
      'data-endpoint-scope="recommend benchmarks"',
    );
    expect(HOME_HTML).toContain(
      "field.hidden = mode === 'models' || scopes.indexOf(useCase) === -1;",
    );

    const buildPath = HOME_HTML.slice(
      HOME_HTML.indexOf("function buildPath()"),
      HOME_HTML.indexOf("function setSelectValue"),
    );
    const registryBranch = buildPath.slice(
      buildPath.indexOf("if (mode === 'models')"),
      buildPath.indexOf("if (fields.tier.value)"),
    );
    expect(registryBranch).toContain("params.set('provider'");
    expect(registryBranch).not.toContain("params.set('tier'");
    expect(registryBranch).not.toContain("params.set('useCase'");
    expect(registryBranch).not.toContain("fields.usecase.value");
  });

  it("updates all three mode panels and rejects stale response identities", () => {
    type FakeElement = { textContent: string; hidden?: boolean };
    type FakePanel = {
      hidden: boolean;
      getAttribute: (name: string) => string;
    };

    const modePanels: FakePanel[] = ["recommend", "benchmarks", "models"].map(
      (mode) => ({
        hidden: false,
        getAttribute: (name) => (name === "data-mode-panel" ? mode : ""),
      }),
    );
    const benchmarkPanels: FakePanel[] = [
      "customer-support",
      "document-processing",
      "front-end-web-dev",
      "voice",
      "speech-to-text",
    ].map((useCase) => ({
      hidden: false,
      getAttribute: (name) =>
        name === "data-benchmark-panel" ? useCase : "",
    }));
    const elements: Record<string, FakeElement> = {
      benchmarkTitle: { textContent: "" },
      benchmarkHint: { textContent: "" },
      frontendRecommendationCredit: { textContent: "", hidden: true },
    };
    const documentStub = {
      querySelectorAll: (selector: string) =>
        selector === "[data-mode-panel]" ? modePanels : benchmarkPanels,
      getElementById: (id: string) => elements[id] ?? null,
    };
    const fields = { endpoint: { value: "recommend" } };
    const setText = (id: string, value: string) => {
      if (elements[id]) elements[id].textContent = value;
    };
    const viewSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function benchmarkPanelForUseCase"),
      HOME_HTML.indexOf("function updateTierOptions"),
    );
    const createViewUpdater = new Function(
      "fields",
      "document",
      "setText",
      "includeItsBenchmark",
      `${viewSource}\nreturn updateBenchmarkPanel;`,
    ) as (
      fieldsValue: typeof fields,
      documentValue: typeof documentStub,
      setTextValue: typeof setText,
      includeItsValue: () => boolean,
    ) => (useCase: string) => void;
    const updateView = createViewUpdater(
      fields,
      documentStub,
      setText,
      () => true,
    );

    updateView("customer-support");
    expect(elements.benchmarkTitle.textContent).toBe(
      "Customer Support Recommendation",
    );
    expect(modePanels.map((panel) => panel.hidden)).toEqual([
      false,
      true,
      true,
    ]);

    updateView("front-end-web-dev");
    expect(elements.frontendRecommendationCredit.hidden).toBe(false);

    fields.endpoint.value = "benchmarks";
    updateView("voice");
    expect(elements.benchmarkTitle.textContent).toBe(
      "Speech-To-Speech (Voice) Benchmark Rows",
    );
    expect(modePanels.map((panel) => panel.hidden)).toEqual([
      true,
      false,
      true,
    ]);
    expect(
      benchmarkPanels.find(
        (panel) => panel.getAttribute("data-benchmark-panel") === "voice",
      )?.hidden,
    ).toBe(false);

    fields.endpoint.value = "models";
    updateView("voice");
    expect(elements.benchmarkTitle.textContent).toBe("Registry Models");
    expect(modePanels.map((panel) => panel.hidden)).toEqual([
      true,
      true,
      false,
    ]);

    const guardSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function isCurrentBuilderRequest"),
      HOME_HTML.indexOf("var previewTimer"),
    );
    const createGuard = new Function(
      "builderRequestSequence",
      "fields",
      "buildPath",
      `${guardSource}\nreturn isCurrentBuilderRequest;`,
    ) as (
      requestSequence: number,
      fieldsValue: typeof fields,
      buildPathValue: () => string,
    ) => (requestId: number, requestedMode: string, requestedPath: string) => boolean;
    const guard = createGuard(4, fields, () => "/v1/models");
    expect(guard(4, "models", "/v1/models")).toBe(true);
    expect(guard(3, "models", "/v1/models")).toBe(false);
    expect(guard(4, "benchmarks", "/v1/models")).toBe(false);
    expect(guard(4, "models", "/v1/models?provider=openai")).toBe(false);
  });

  it("renders a primary recommendation and deduplicated failover rows", () => {
    type FakeElement = { innerHTML: string; textContent: string };
    const elements: Record<string, FakeElement> = {
      recommendationHead: { innerHTML: "", textContent: "" },
      recommendationRows: { innerHTML: "", textContent: "" },
      recommendationSource: { innerHTML: "", textContent: "" },
    };
    const fields = { usecase: { value: "customer-support" } };
    const documentStub = {
      getElementById: (id: string) => elements[id] ?? null,
    };
    const setText = (id: string, value: string) => {
      if (elements[id]) elements[id].textContent = value;
    };
    const recommendationSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function recommendationFamilyKey"),
      HOME_HTML.indexOf("function registryAvailability"),
    );
    const createRecommendationRenderer = new Function(
      "fields",
      "document",
      "setText",
      "escapeHtml",
      "renderModelCell",
      "falsePositiveLabel",
      "accuracyLabel",
      "benchmarkScore",
      "llmSignals",
      "money",
      "runCost",
      `${recommendationSource}\nreturn renderRecommendationResponse;`,
    ) as (
      fieldsValue: typeof fields,
      documentValue: typeof documentStub,
      setTextValue: typeof setText,
      escapeHtmlValue: (value: unknown) => string,
      renderModelCellValue: (model: { name: string }) => string,
      falsePositiveLabelValue: () => string,
      accuracyLabelValue: () => string,
      benchmarkScoreValue: () => string,
      llmSignalsValue: () => { instructionFollowing: number },
      moneyValue: () => string,
      runCostValue: () => number,
    ) => (data: Record<string, unknown>) => void;
    const renderRecommendation = createRecommendationRenderer(
      fields,
      documentStub,
      setText,
      (value) => String(value),
      (model) => `<strong>${model.name}</strong>`,
      () => "0/43",
      () => "100%",
      () => "88",
      () => ({ instructionFollowing: 0.88 }),
      () => "$0.12",
      () => 0.12,
    );
    const grok = {
      id: "grok-4-5-high",
      family: "grok-4.5",
      registryModelId: "grok-4.5",
      provider: "xai",
      name: "Grok 4.5 (high)",
      source: "artificialanalysis",
    };
    const grokLow = {
      id: "grok-4-5-low",
      family: null,
      provider: "xai",
      name: "Grok 4.5 (low)",
      source: "artificialanalysis",
    };

    renderRecommendation({
      recommendation: {
        id: "claude-fable-5",
        family: "claude-fable-5",
        provider: "anthropic",
        name: "Claude Fable 5",
        source: "artificialanalysis",
        failover: grok,
      },
      failovers: [
        grok,
        grokLow,
        {
          id: "gpt-5-6-high",
          family: "gpt-5.6",
          provider: "openai",
          name: "GPT-5.6 (high)",
          source: "artificialanalysis",
        },
      ],
    });

    expect(elements.recommendationHead.innerHTML).toContain("<th>Role</th>");
    expect(elements.recommendationHead.innerHTML).toContain("<th>ITS FP</th>");
    expect(elements.recommendationHead.innerHTML).toContain("<th>Task AUD</th>");
    expect(elements.recommendationRows.innerHTML).toContain('class="selected"');
    expect(elements.recommendationRows.innerHTML).toContain("Primary");
    expect(elements.recommendationRows.innerHTML).toContain("Failover 1");
    expect(elements.recommendationRows.innerHTML).toContain("Failover 2");
    expect(
      elements.recommendationRows.innerHTML.match(/Grok 4\.5 \(high\)/g),
    ).toHaveLength(1);
    expect(elements.recommendationRows.innerHTML).not.toContain(
      "Grok 4.5 (low)",
    );
    expect(elements.recommendationRows.innerHTML).toContain("GPT-5.6 (high)");
    expect(elements.recommendationSource.textContent).toBe(
      "3 distinct model families",
    );

    renderRecommendation({
      recommendation: {
        id: "gpt-5.6",
        family: "gpt-sol",
        provider: "openai",
        name: "GPT-5.6",
      },
      failovers: [],
      recommendationMeta: { selectionBasis: "latest_release" },
    });
    expect(elements.recommendationSource.textContent).toBe(
      "Latest full-size release heuristic · benchmark evidence pending · capability-first, not value-optimised",
    );
  });

  it("distinguishes canonical max models while collapsing compound AA efforts", () => {
    const familySource = HOME_HTML.slice(
      HOME_HTML.indexOf("function recommendationFamilyKey"),
      HOME_HTML.indexOf("function recommendationRowsFromResponse"),
    );
    const createFamilyKey = new Function(
      `${familySource}\nreturn recommendationFamilyKey;`,
    ) as () => (model: Record<string, unknown>) => string;
    const familyKey = createFamilyKey();

    expect(
      familyKey({
        id: "claude-sonnet-4-6-adaptive",
        provider: "anthropic",
        name: "Claude Sonnet 4.6 (Adaptive Reasoning, Max Effort)",
        source: "artificialanalysis",
      }),
    ).toBe(
      familyKey({
        id: "claude-sonnet-4-6-non-reasoning-low-effort",
        provider: "anthropic",
        name: "Claude Sonnet 4.6 (Non-reasoning, Low Effort)",
        source: "artificialanalysis",
      }),
    );
    expect(
      familyKey({
        id: "gpt-5.1-codex",
        provider: "openai",
        name: "GPT-5.1 Codex",
      }),
    ).not.toBe(
      familyKey({
        id: "gpt-5.1-codex-max",
        provider: "openai",
        name: "GPT-5.1 Codex Max",
      }),
    );
  });

  it("renders benchmark eligibility and every registry metadata field", () => {
    const fields = { usecase: { value: "customer-support" } };
    const eligibilitySource = HOME_HTML.slice(
      HOME_HTML.indexOf("function nonRecommendableReason"),
      HOME_HTML.indexOf("function renderModelCell"),
    );
    const createEligibilityRenderer = new Function(
      "fields",
      "includeItsBenchmark",
      "escapeHtml",
      `${eligibilitySource}\nreturn renderEligibility;`,
    ) as (
      fieldsValue: typeof fields,
      includeItsValue: () => boolean,
      escapeHtmlValue: (value: unknown) => string,
    ) => (model: Record<string, unknown>) => string;
    const renderEligibility = createEligibilityRenderer(
      fields,
      () => true,
      (value) => String(value),
    );
    const ineligibleModel = {
      recommendable: false,
      eligibilityReason: "missing_support_signals",
    };

    const columnSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function commonTextColumns"),
      HOME_HTML.indexOf("function renderTextBenchmarks"),
    );
    type BenchmarkColumn = {
      label?: string;
      render: (row: { model: Record<string, unknown> }) => string;
    };
    const createColumns = new Function(
      "isBrowsingBenchmarks",
      "supportAgenticSignal",
      "renderEligibility",
      `${columnSource}\nreturn commonTextColumns;`,
    ) as (
      isBrowsingValue: () => boolean,
      supportAgenticValue: () => number,
      renderEligibilityValue: (model: Record<string, unknown>) => string,
    ) => (useCase: string, includeIts: boolean) => BenchmarkColumn[];
    const columns = createColumns(
      () => true,
      () => 0,
      renderEligibility,
    )("customer-support", false);
    const eligibilityColumn = columns.find(
      (column) => column.label === "Eligibility",
    );

    expect(columns.map((column) => column.label)).toContain("Eligibility");
    expect(eligibilityColumn?.render({ model: ineligibleModel })).toBe(
      '<div class="eligibility">Not eligible: missing support signals</div>',
    );

    type RegistryModel = {
      id: string;
      name: string;
      provider: string;
      releaseDate: string;
      updatedAt: string;
      availability: { status: string };
      contextWindow: number;
      pricing: { inputPerMTok: number; outputPerMTok: number };
      capabilities: Record<string, boolean>;
    };
    type RegistryColumn = {
      key: string;
      label: string;
      render: (model: RegistryModel) => string;
    };
    let captured:
      | { tableId: string; rows: RegistryModel[]; columns: RegistryColumn[] }
      | undefined;
    const labels: Record<string, string> = {};
    const registrySource = HOME_HTML.slice(
      HOME_HTML.indexOf("function registryAvailability"),
      HOME_HTML.indexOf("function renderModeResponse"),
    );
    const createRegistryRenderer = new Function(
      "renderSortableTable",
      "setText",
      "formatAge",
      "escapeHtml",
      "money",
      `${registrySource}\nreturn renderRegistryModels;`,
    ) as (
      renderTableValue: (
        tableId: string,
        rows: RegistryModel[],
        columns: RegistryColumn[],
      ) => void,
      setTextValue: (id: string, value: string) => void,
      formatAgeValue: () => string,
      escapeHtmlValue: (value: unknown) => string,
      moneyValue: (value: number) => string,
    ) => (models: RegistryModel[], data: { generatedAt: string }) => void;
    const renderRegistry = createRegistryRenderer(
      (tableId, rows, registryColumns) => {
        captured = { tableId, rows, columns: registryColumns };
      },
      (id, value) => {
        labels[id] = value;
      },
      () => "just now",
      (value) => String(value),
      (value) => `$${value.toFixed(2)}`,
    );
    const model: RegistryModel = {
      id: "gpt-5-6",
      name: "GPT-5.6",
      provider: "openai",
      releaseDate: "2026-07-15",
      updatedAt: "2026-07-16T00:00:00Z",
      availability: { status: "production" },
      contextWindow: 200_000,
      pricing: { inputPerMTok: 2.5, outputPerMTok: 15 },
      capabilities: { vision: true, reasoning: true, toolCalling: true },
    };
    renderRegistry([model], { generatedAt: "2026-07-16T00:00:00Z" });

    expect(captured?.tableId).toBe("registryRows");
    expect(captured?.columns.map((column) => column.label)).toEqual([
      "Model",
      "Provider",
      "Released / updated",
      "Availability",
      "Context",
      "Input AUD/MTok",
      "Output AUD/MTok",
      "Capabilities",
    ]);
    const renderField = (key: string) =>
      captured?.columns.find((column) => column.key === key)?.render(model);
    expect(renderField("model")).toContain("gpt-5-6");
    expect(renderField("provider")).toBe("openai");
    expect(renderField("date")).toContain("Released 2026-07-15");
    expect(renderField("date")).toContain("Updated 2026-07-16");
    expect(renderField("availability")).toBe("production");
    expect(renderField("context")).toBe("200k");
    expect(renderField("input")).toBe("$2.50");
    expect(renderField("output")).toBe("$15.00");
    expect(renderField("capabilities")).toContain(
      "vision, reasoning, tool calling",
    );
    expect(labels.registrySource).toBe("1 registry models · refreshed just now");
  });

  it("drives mode response counts and ignores a late response after switching", async () => {
    type Payload = Record<string, unknown>;
    type FakeResponse = { ok: boolean; json: () => Promise<Payload> };
    type PendingResponse = { resolve: (response: FakeResponse) => void };
    const endpoint = { value: "recommend" };
    const fields = {
      endpoint,
      usecase: { value: "customer-support" },
      url: { textContent: "", href: "" },
      open: { href: "" },
      result: { textContent: "" },
    };
    const paths: Record<string, string> = {
      recommend: "/v1/models/recommend",
      benchmarks: "/v1/benchmarks",
      models: "/v1/models",
    };
    const buildPath = () => paths[endpoint.value];
    const modeResponses: Record<string, { path: string; data: Payload } | null> = {
      recommend: null,
      benchmarks: null,
      models: null,
    };
    const renderedModes: string[] = [];
    const pending: Record<string, PendingResponse> = {};
    const fetchStub = (path: string) =>
      new Promise<FakeResponse>((resolve) => {
        pending[path] = { resolve };
      });
    const respond = (path: string, data: Payload) => {
      pending[path].resolve({ ok: true, json: async () => data });
    };
    const flushPromises = async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };
    const refreshSource = HOME_HTML.slice(
      HOME_HTML.indexOf("function isCurrentBuilderRequest"),
      HOME_HTML.indexOf("['change', 'input']"),
    );
    const createRefreshBuilder = new Function(
      "builderRequestSequence",
      "fields",
      "buildPath",
      "syncRunCostRange",
      "updateTierOptions",
      "updateLatestOptionVisibility",
      "origin",
      "syncPageUrl",
      "updateBenchmarkPanel",
      "updateFilterVisibility",
      "modeResponses",
      "renderModeResponse",
      "renderModeLoading",
      "clearTimeout",
      "setTimeout",
      "fetch",
      `${refreshSource}\nreturn refreshBuilder;`,
    ) as (
      requestSequence: number,
      fieldsValue: typeof fields,
      buildPathValue: () => string,
      syncRangeValue: () => void,
      updateTierValue: (useCase: string) => void,
      updateLatestVisibilityValue: () => void,
      originValue: string,
      syncUrlValue: (path: string) => void,
      updatePanelValue: (useCase: string) => void,
      updateVisibilityValue: (useCase: string) => void,
      responsesValue: typeof modeResponses,
      renderResponseValue: (mode: string, data: Payload) => void,
      renderLoadingValue: (mode: string) => void,
      clearTimeoutValue: (timer: number) => void,
      setTimeoutValue: (callback: () => void) => number,
      fetchValue: (path: string) => Promise<FakeResponse>,
    ) => () => void;
    const noop = () => {};
    const refreshBuilder = createRefreshBuilder(
      0,
      fields,
      buildPath,
      noop,
      noop,
      noop,
      "https://ai.itsolver.au",
      noop,
      noop,
      noop,
      modeResponses,
      (mode) => renderedModes.push(mode),
      noop,
      noop,
      (callback) => {
        callback();
        return 1;
      },
      fetchStub,
    );

    refreshBuilder();
    respond("/v1/models/recommend", {
      recommendation: { id: "claude-fable-5" },
      failovers: [],
    });
    await flushPromises();
    expect(fields.result.textContent).toBe("claude-fable-5");
    expect(renderedModes.at(-1)).toBe("recommend");

    endpoint.value = "benchmarks";
    refreshBuilder();
    respond("/v1/benchmarks", {
      benchmarkCount: 2,
      benchmarks: [{ id: "claude-fable-5" }, { id: "gpt-5-6" }],
    });
    await flushPromises();
    expect(fields.result.textContent).toBe("2 benchmarks");
    expect(renderedModes.at(-1)).toBe("benchmarks");

    endpoint.value = "recommend";
    refreshBuilder();
    endpoint.value = "models";
    refreshBuilder();
    const renderCountBeforeLateResponse = renderedModes.length;
    respond("/v1/models/recommend", {
      recommendation: { id: "stale-recommendation" },
      failovers: [],
    });
    await flushPromises();
    expect(renderedModes).toHaveLength(renderCountBeforeLateResponse);
    expect(fields.result.textContent).toBe("checking...");

    respond("/v1/models", {
      modelCount: 3,
      models: [
        { id: "claude-fable-5" },
        { id: "grok-4-5" },
        { id: "gpt-5-6" },
      ],
    });
    await flushPromises();
    expect(fields.result.textContent).toBe("3 models");
    expect(renderedModes.at(-1)).toBe("models");
    expect(modeResponses.recommend?.data).not.toMatchObject({
      recommendation: { id: "stale-recommendation" },
    });
  });
});
