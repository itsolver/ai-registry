import { describe, expect, it } from "vitest";
import { extractLlmEfficiencyRecords } from "../scripts/extract-aa-llm-efficiency.mjs";

describe("AA LLM efficiency extractor", () => {
  it("merges JSON-LD chart fields with Next Flight frontier evaluations", () => {
    const flight = `35:${JSON.stringify({
      defaultData: [
        {
          slug: "claude-frontier",
          name: "Claude Frontier",
          model_url: "/models/claude-frontier",
          frontier_model: true,
          model_creators: { slug: "anthropic" },
          context_window_tokens: 1000000,
          intelligence_index: 12,
          agentic_index: 64,
          ifbench: 0.58,
          tau2: 0.74,
          gdpval: 1600,
          terminalbench_hard: 0.44,
          scicode: 0.5,
          coding_index: 52,
          lcr: 0.7,
          hle: 0.31,
          gpqa: 0.88,
          critpt: 0.06,
          price_1m_input_tokens: 99,
          price_1m_output_tokens: 199,
          cache_hit_price: 9,
          timescaleData: { median_output_speed: 45 },
          time_to_first_answer_token_metrics: { total_time: 2.5 },
          intelligence_index_cost: {
            answer_cost: 1,
            reasoning_cost: 2,
            input_cost: 3,
            total_cost: 6,
          },
          intelligence_index_token_counts: {
            answer_tokens: 10,
            reasoning_tokens: 20,
            output_tokens: 30,
          },
        },
        {
          slug: "non-frontier",
          name: "Non Frontier",
          model_url: "/models/non-frontier",
          frontier_model: false,
          model_creators: { slug: "openai" },
          ifbench: 0.9,
          agentic_index: 80,
        },
      ],
    })}`;
    const html = [
      dataset("Artificial Analysis Intelligence Index", [
        {
          label: "Claude Frontier",
          intelligenceIndex: 91,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Cost per Intelligence Index Task", [
        {
          label: "Claude Frontier",
          answer: 0.1,
          reasoning: 0.2,
          cacheWrite: 0.3,
          cacheHit: 0.4,
          input: 0.5,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Cost per Task", [
        {
          label: "Claude Frontier",
          costPerIntelligenceIndexTask: 0.42,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Cost to Run Artificial Analysis Intelligence Index", [
        {
          label: "Claude Frontier",
          answerCost: 11,
          reasoningCost: 22,
          inputCost: 33,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Output Tokens per Intelligence Index Task", [
        {
          label: "Claude Frontier",
          answer: 110,
          reasoning: 220,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Pricing: Cache Hit, Input, and Output", [
        {
          label: "Claude Frontier",
          pricing: [
            { name: "cacheHitPrice", value: 0.3 },
            { name: "inputPrice", value: 3.75 },
            { name: "outputPrice", value: 15 },
          ],
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      dataset("Output Speed", [
        {
          label: "Claude Frontier",
          outputSpeed: 61,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      `<script>self.__next_f.push([1,${JSON.stringify(flight)}])</script>`,
    ].join("");

    const records = extractLlmEfficiencyRecords(html);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      slug: "claude-frontier",
      provider: "anthropic",
      intelligenceIndex: 91,
      agenticIndex: 64,
      ifbench: 0.58,
      tau2: 0.74,
      gdpvalNormalized: 0.55,
      terminalBenchHard: 0.44,
      codingIndex: 52,
      lcr: 0.7,
      inputPrice: 3.75,
      outputPrice: 15,
      cacheHitPrice: 0.3,
      outputSpeed: 61,
      intelligenceRunTotalCost: 66,
      intelligenceCostPerTask: 0.42,
      intelligenceRunOutputTokens: 330,
    });
  });

  it("falls back to Intelligence Index task-cost components", () => {
    const flight = `35:${JSON.stringify({
      defaultData: [
        {
          slug: "claude-frontier",
          name: "Claude Frontier",
          model_url: "/models/claude-frontier",
          frontier_model: true,
          model_creators: { slug: "anthropic" },
          intelligence_index: 12,
        },
      ],
    })}`;
    const html = [
      dataset("Cost per Intelligence Index Task", [
        {
          label: "Claude Frontier",
          answer: 0.1,
          reasoning: 0.2,
          cacheWrite: 0.3,
          cacheHit: 0.4,
          input: 0.5,
          detailsUrl: "/models/claude-frontier",
        },
      ]),
      `<script>self.__next_f.push([1,${JSON.stringify(flight)}])</script>`,
    ].join("");

    const records = extractLlmEfficiencyRecords(html);

    expect(records[0]).toMatchObject({
      slug: "claude-frontier",
      intelligenceCostPerTask: 1.5,
    });
  });

  it("keeps non-frontier models when task-cost chart data exists", () => {
    const flight = `35:${JSON.stringify({
      defaultData: [
        {
          slug: "frontier-seed",
          name: "Frontier Seed",
          model_url: "/models/frontier-seed",
          frontier_model: true,
          model_creators: { slug: "openai" },
        },
        {
          slug: "grok-chart-row",
          name: "Grok Chart Row",
          model_url: "/models/grok-chart-row",
          frontier_model: false,
          model_creators: { slug: "xai" },
          intelligence_index: 55,
          price_1m_input_tokens: 2,
          price_1m_output_tokens: 10,
        },
      ],
    })}`;
    const html = [
      dataset("Cost per Intelligence Index Task", [
        {
          label: "Grok Chart Row",
          answer: 0.1,
          reasoning: 0.2,
          cacheWrite: 0.3,
          cacheHit: 0.4,
          input: 0.5,
          detailsUrl: "/models/grok-chart-row",
        },
      ]),
      dataset("Cost per Task", [
        {
          label: "Grok Chart Row",
          costPerIntelligenceIndexTask: 0.42,
          detailsUrl: "/models/grok-chart-row",
        },
      ]),
      `<script>self.__next_f.push([1,${JSON.stringify(flight)}])</script>`,
    ].join("");

    const records = extractLlmEfficiencyRecords(html);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      slug: "grok-chart-row",
      provider: "xai",
      intelligenceIndex: 55,
      inputPrice: 2,
      outputPrice: 10,
      intelligenceCostPerTask: 0.42,
    });
  });

  it("keeps non-frontier models when output-token chart data exists", () => {
    const flight = `35:${JSON.stringify({
      defaultData: [
        {
          slug: "frontier-seed",
          name: "Frontier Seed",
          model_url: "/models/frontier-seed",
          frontier_model: true,
          model_creators: { slug: "openai" },
        },
        {
          slug: "token-chart-row",
          name: "Token Chart Row",
          model_url: "/models/token-chart-row",
          frontier_model: false,
          model_creators: { slug: "google" },
          intelligence_index: 50,
          ifbench: 0.75,
          price_1m_input_tokens: 1,
          price_1m_output_tokens: 6,
        },
      ],
    })}`;
    const html = [
      dataset("Output Tokens per Intelligence Index Task", [
        {
          label: "Token Chart Row",
          answer: 12000,
          reasoning: 34000,
          detailsUrl: "/models/token-chart-row",
        },
      ]),
      `<script>self.__next_f.push([1,${JSON.stringify(flight)}])</script>`,
    ].join("");

    const records = extractLlmEfficiencyRecords(html);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      slug: "token-chart-row",
      provider: "google",
      intelligenceIndex: 50,
      ifbench: 0.75,
      intelligenceRunOutputTokens: 46000,
    });
  });
});

function dataset(name, data) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@type": "Dataset",
    name,
    data,
  })}</script>`;
}
