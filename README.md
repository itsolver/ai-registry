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
Intelligence Index task cost. Checked-in Artificial Analysis extracts fill
missing fields only; they never override fresher live values.

Registry visibility and recommendation eligibility are intentionally separate:
new base models can appear in `/v1/models` as soon as models.dev publishes them,
even when they do not yet have enough evidence to recommend. Artificial
Analysis effort configurations such as a high-reasoning variant remain distinct
benchmark rows while linking to the matching base-model family. Recommendations
still require positive pricing, default-production availability, and the
benchmark evidence required by the selected use case.

Recommendations are tuned for IT Solver customer support, document processing,
speech-to-speech voice-agent API work, and speech-to-text transcription. For
customer support, ranking is safety-first: false positives sort first, accuracy
second, and Artificial Analysis Intelligence Index Task AUD third. Preview-only,
experimental, latest-alias, and near-retirement text models are not default
production recommendations. Voice recommendations use a cached Artificial
Analysis speech-to-speech leaderboard extract. Speech-to-text recommendations
use Artificial Analysis STT rows with AA-WER, speed, and provider pricing.

Live Artificial Analysis pricing takes precedence when present, with models.dev
pricing used as the registry fallback. Source USD pricing and benchmark costs
are converted to AUD using the catalog's current Frankfurter exchange rate. The
API returns AUD pricing and includes the exchange-rate metadata used for that
catalog view.

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
  and other benchmark rows, including incomplete rows with a visible reason
  when they are not recommendation-eligible.
- `/v1/models/recommend` returns only candidates that satisfy the selected use
  case's pricing, availability, and evidence requirements. Its existing primary
  recommendation and failover response shape is unchanged.
- `/v1/health` reports separate registry, benchmark, and recommendable counts,
  while `/v1/models/providers` derives provider totals from registry records.

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
stale rows.

Example:

```bash
curl "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast"
```

Recommendation responses keep the primary model in `recommendation` and the
next operationally distinct model for the same filters, including `provider`,
in `recommendation.failover`. Existing top-level `failovers` still provides up
to two customer-support overload fallbacks for older clients. Top-level
failovers require IT Solver auto-close benchmark data; when fewer than two are
available, `failoverStatus.reason` is `insufficient_its_autoclose_benchmarks`.

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
```

## Local Development

```bash
npm install
npm test
npm run build
npm run dev
```

Refresh the cached Artificial Analysis extracts:

```bash
npm run refresh:aa-customer-support
npm run refresh:aa-llm-efficiency
npm run refresh:aa-llm-pricing
npm run refresh:aa-stt
npm run refresh:aa-voice
```

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
when a primary live source fails; checked-in extracts are only missing-field
fallbacks within a successful live refresh.

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
