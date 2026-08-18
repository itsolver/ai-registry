# AI Registry

Public Cloudflare Workers API and browser for IT Solver's AI model registry,
benchmark rows, and recommendations.

Production URL:

```text
https://ai.itsolver.au
```

The Worker rebuilds a canonical base-model registry from
[models.dev](https://models.dev/api.json), then enriches it with Artificial
Analysis data for OpenAI, Google, xAI, Anthropic, NVIDIA, ElevenLabs, and Groq.
Each catalog refresh reads both the legacy Artificial Analysis LLM endpoint for
detailed benchmark signals and the paginated current free Language Models
endpoint for current headline indices, performance, nested pricing, and
Intelligence Index task cost. The same automatic refresh cycle fetches the
Artificial Analysis speech-to-speech leaderboard: the authenticated API is
preferred when configured, with the complete public page payload as the live
secondary source. Checked-in LLM and speech-to-text extracts fill missing fields
only; the checked-in voice snapshot is an emergency fallback, not the normal
refresh path.

Registry visibility and recommendation eligibility are intentionally separate:
new base models can appear in `/v1/models` as soon as models.dev publishes them,
even when they do not yet have enough evidence to recommend. Artificial
Analysis effort configurations such as a high-reasoning variant remain distinct
benchmark rows while linking to the matching base-model family. Recommendations
normally require positive pricing, default-production availability, and the
benchmark evidence required by the selected use case. Best-tier requests can
explicitly opt into the latest eligible full-size production model without that
evidence using `allowUnbenchmarkedLatest=true`. That exception is a
capability-first release heuristic that prefers full-size models over explicitly reduced
variants such as `mini`; it is not a benchmark result or value recommendation.
Balanced, fast, and non-opted-in best requests remain benchmark-required.

Recommendations are tuned for IT Solver customer support, document processing,
speech-to-speech voice-agent API work, and speech-to-text transcription. For
customer support, ranking is safety-first: false positives sort first, accuracy
second, and Artificial Analysis Intelligence Index Task AUD third. Preview-only,
experimental, latest-alias, and near-retirement text models are not default
production recommendations. Voice recommendations rank current Artificial
Analysis speech-to-speech rows by the source-provided Speech-to-Speech Index,
with missing quality values last. Current models.dev audio-in/audio-out models
remain visible while awaiting an Artificial Analysis row, but are marked
`missing_voice_benchmark` and excluded from strict recommendations.
Speech-to-text recommendations use Artificial Analysis STT rows with AA-WER,
speed, and provider pricing.

Live Artificial Analysis pricing takes precedence when present, with models.dev
pricing used as the registry fallback. Source USD pricing and benchmark costs
are converted to AUD using the catalog's current Frankfurter exchange rate. The
API returns AUD pricing and includes the exchange-rate metadata used for that
catalog view. models.dev `input_audio` and `output_audio` token prices are
exposed as `audioInputPerMTok` and `audioOutputPerMTok`. For structured
Artificial Analysis voice rows, the API input list price is used when the
page-only benchmark input cost is unavailable, without relabelling the list
price as benchmark cost.

## Endpoints

All API endpoints are public and require no bearer token or IP allowlist.

```text
GET /v1/health
GET /v1/benchmarks?useCase=customer-support|document-processing|voice|speech-to-text
GET /v1/models
GET /v1/models/recommend
GET /v1/models/providers
GET /v1/models/:provider/latest
```

Unprefixed `/benchmarks`, `/models`, `/models/recommend`, `/models/providers`, and `/models/:provider/latest` mirror v1. The old `/models.json` and `/model-registry.json` registry documents are intentionally gone.

The endpoint datasets serve different purposes:

- `/v1/models` returns canonical base registry records. Explicit API filters are
  still supported, but the homepage registry browser does not apply a use-case
  or recommendation-priority filter.
- `/v1/benchmarks` returns use-case-relevant Artificial Analysis configurations
  and other benchmark rows. Voice browsing also includes models.dev audio
  models awaiting a benchmark, with `eligibilityReason` set to
  `missing_voice_benchmark`.
- `/v1/models/recommend` is benchmark-strict by default. An opted-in best-tier
  request may return the latest eligible full-size unbenchmarked registry model
  and labels that result in `recommendationMeta` as
  `selectionBasis: "latest_release"`,
  `benchmarkEligible: false`, and `valueOptimized: false`.
- `/v1/health` reports separate registry, benchmark, and recommendable counts,
  plus `sourceStatus.voice`; `/v1/models/providers` derives provider totals from
  registry records.

## Homepage Modes

The query builder has three distinct right-hand views:

- **Get a recommendation** shows the primary recommendation plus deduplicated,
  operationally distinct failovers and use-case-relevant metrics.
- **Browse benchmark rows** shows the selected use-case benchmark schema,
  including incomplete rows and their recommendation-eligibility reason.
- **Browse registry models** shows base model identity, provider, release/update
  date, availability, context window, input/output AUD pricing, and
  capabilities. Benchmark-only controls are hidden in this mode.

Each mode keeps separate response state. A late response from an earlier request
is discarded, so switching modes quickly cannot replace the active table with
stale rows. Recommendation mode exposes an evidence-policy checkbox only for
the best tier; selecting it sends `allowUnbenchmarkedLatest=true` and visibly
labels a release-heuristic result as capability-first rather than
value-optimized.

Example:

```bash
curl "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast"
curl "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast&selectionPolicy=latest-cost-quality"
```

`latest-cost-quality` first selects the normal IT Solver benchmark-backed tier
model as the incumbent. It then evaluates newer stable Artificial Analysis
configurations. A configuration can replace the incumbent only when its
Intelligence Index task cost is not higher, its Intelligence score is not
lower, its release date is later, its canonical models.dev mapping and required
capabilities are present, and comparable IT Solver evidence does not show a
higher false-positive rate. Missing IT Solver evidence does not block the
candidate. Missing or stale Artificial Analysis evidence does block it. The
default policy remains benchmark-required.

Recommendation responses keep the primary model in `recommendation` and the
next operationally distinct model for the same filters, including `provider`,
in `recommendation.failover`. Existing top-level `failovers` still provides up
to two customer-support overload fallbacks for older clients. Top-level
failovers require IT Solver auto-close benchmark data; when fewer than two are
available, `failoverStatus.reason` is `insufficient_its_autoclose_benchmarks`,
or `insufficient_distinct_model_families` when enough benchmark rows exist but
they do not cover enough operationally distinct base models.

Supported filters:

```text
provider=openai|google|xai|anthropic|nvidia|elevenlabs|groq
tier=fast|balanced|best          # customer-support priorities: fast, balanced, lowest false-positive risk
capability=vision|pdf|reasoning|toolCalling|structuredOutput
maxInputCostPerMTok=2               # max input AUD per million tokens
maxOutputCostPerMTok=10             # max output AUD per million tokens
minIntelligenceCostPerTaskAud=0.1   # min AA Intelligence Index Task AUD
maxIntelligenceCostPerTaskAud=1     # max AA Intelligence Index Task AUD
maxIntelligenceCostPerTaskUsd=0.7   # max AA Intelligence Index Task USD, converted with the catalog FX rate
minRunCostAud=100                   # legacy min AA benchmark total Run AUD
maxRunCostAud=500                   # legacy max AA benchmark total Run AUD
maxRunCostUsd=900                   # legacy max AA benchmark total Run USD, converted with the catalog FX rate
minIntelligence=30                  # min AA Intelligence Index for benchmark-backed text rows
maxAudioInputCostPerHour=5          # max voice input/cost-to-run AUD per hour
maxAudioOutputCostPerHour=5         # max voice output AUD per hour
maxTranscriptionCostPer1kMinutes=10 # max speech-to-text AUD per 1,000 minutes
maxAaWer=4.6                        # max speech-to-text AA-WER error rate
maxCostPerMTok=2                    # legacy alias for maxInputCostPerMTok
minContextWindow=200000
useCase=customer-support|document-processing|voice|speech-to-text  # stt is accepted as an alias
includeItsBenchmark=false              # omit IT Solver auto-close ranking for customer support
allowPreview=true                      # allow preview models in customer-support recommendations
allowUnbenchmarkedLatest=true          # best only: allow latest eligible full-size model without benchmark evidence
selectionPolicy=latest-cost-quality    # customer support: newer AA model with no cost or Intelligence regression
```

## Local Development

```bash
npm install
npm test
npm run build
npm run dev
```

Refresh the checked-in Artificial Analysis fallback extracts:

```bash
npm run refresh:aa-customer-support
npm run refresh:aa-llm-efficiency
npm run refresh:aa-llm-pricing
npm run refresh:aa-stt
npm run refresh:aa-voice
```

Production speech-to-speech rows refresh automatically during catalog rebuilds;
normal upstream changes require no extractor command, commit, or deployment.
Live voice, LLM Artificial Analysis, and models.dev inputs must retain at least 50% of their persisted
coverage high-water marks (tracked separately for the voice API and public
page); voice sources must also have complete quality and
input/output pricing on at least half their rows. Cached voice fallback age is
re-evaluated at request time. `refresh:aa-voice` only maintains the bundled
emergency snapshot.

The Worker refreshes the complete live catalog each hour. It treats catalog
data as ready for request reuse for one hour. If a refresh fails, it can serve
the last complete catalog for up to seven days and marks the response
`catalogState: "stale"`. The `latest-cost-quality` policy requires evidence no
older than 24 hours, so stale data cannot promote a new model.

Do not run a new Anthropic customer-support auto-close benchmark from this repo
without a manual approval checkpoint. A benchmark proposal may list candidate
Anthropic model names and estimated cost, but execution requires explicit human
approval before any API calls are made.

## Cloudflare Setup

Create the KV namespace used for the normalized catalog cache and replace the placeholder IDs in `wrangler.toml`:

```bash
wrangler kv namespace create MODEL_CACHE
wrangler kv namespace create MODEL_CACHE --preview
```

The normalized catalog is versioned in KV. A cache-key bump invalidates older
normalized payloads after source or schema changes. On refresh, the Worker keeps
serving a previously valid catalog instead of replacing it with a partial result
when a primary live source fails. Voice data has its own last-known-good KV
record: a validated API or public-page result replaces it, while malformed or
failed fetches fall back to that record and then the bundled snapshot. Fallback
voice rows older than 14 days stay visible with `stale_voice_benchmark` but
cannot drive recommendations. `sourceStatus.voice` reports `live`,
`fallback_fresh`, or `fallback_stale`, its origin, fetch time, and row count.

Deploy:

```bash
npm run deploy
```

GitHub Actions deploys the Worker on pushes to `main`. Configure repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_KV_NAMESPACE_ID
CLOUDFLARE_KV_PREVIEW_NAMESPACE_ID
```

Optional benchmark-aware recommendations use Artificial Analysis. Configure:

```bash
wrangler secret put ARTIFICIAL_ANALYSIS_API_KEY
```

The key enables the preferred speech-to-speech API path; the public page remains
the automatic live fallback. `ARTIFICIAL_ANALYSIS_S2S_URL` and
`ARTIFICIAL_ANALYSIS_S2S_PAGE_URL` may override those source URLs for controlled
environments and tests.
