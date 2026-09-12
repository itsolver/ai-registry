# AI Registry

Public Cloudflare Workers API and browser for IT Solver's AI model registry,
benchmark rows, and recommendations.

Production URL:

```text
https://ai.itsolver.au
```

The registry rebuilds a canonical base-model registry from
[models.dev](https://models.dev/api.json), then enriches it with Artificial
Analysis data for OpenAI, Google, xAI, Anthropic, NVIDIA, ElevenLabs, and Groq.
Moonshot AI models are imported from models.dev, with Arena Frontend Code
supplying the dedicated front-end web development evidence.
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
front-end web development, speech-to-speech voice-agent API work, and
speech-to-text transcription. Front-end recommendations use three deterministic
policies from a checked Arena Frontend Code snapshot: highest score for `best`,
lowest output price among eligible top-10 entries for `balanced`, and lowest
output price among eligible top-20 entries for `fast`. Each Arena row declares
its canonical models.dev registry ID; thinking, effort, and harness details stay
attached as evaluation configuration instead of being treated as separate API
model identities. Current Vibe Code Bench results are shown as separate
functional corroboration on `/webdev`; unavailable and stale public boards are
excluded from ranking. The checked Arena extract expires after 30 days and
fails closed, removing front-end recommendations until a refreshed extract is
deployed. For
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
GET /v1/benchmarks?useCase=customer-support|document-processing|front-end-web-dev|voice|speech-to-text
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
- `/v1/benchmarks` returns use-case-relevant Artificial Analysis and Arena
  configurations. Arena rows expose their verified `registryModelId` and any
  evaluation-only reasoning, effort, or harness configuration. Voice browsing
  also includes models.dev audio models awaiting a benchmark, with
  `eligibilityReason` set to `missing_voice_benchmark`.
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
in `recommendation.failover`. For front-end web dev, the default priority is
highest Arena score and top-level `failovers` supplies the next two distinct
Arena-ranked registry models, so the recommendation view shows the top three
eligible model families. For customer support, top-level `failovers` continues
to provide up to two auto-close-backed overload fallbacks; when fewer than two
are available, `failoverStatus.reason` is `insufficient_its_autoclose_benchmarks`,
or `insufficient_distinct_model_families` when enough benchmark rows exist but
they do not cover enough operationally distinct base models.

Supported filters:

```text
provider=openai|google|xai|anthropic|moonshotai|nvidia|elevenlabs|groq
tier=fast|balanced|best          # priority semantics depend on the selected use case
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
useCase=customer-support|document-processing|front-end-web-dev|voice|speech-to-text  # webdev and stt are accepted aliases
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

Refresh the checked benchmark extracts:

```bash
npm run refresh:aa-customer-support
npm run refresh:aa-llm-efficiency
npm run refresh:aa-llm-pricing
npm run refresh:aa-stt
npm run refresh:aa-voice
npm run refresh:arena-webdev
```

Production speech-to-speech rows refresh automatically during catalog rebuilds;
normal upstream changes require no extractor command, commit, or deployment.
Live voice, LLM Artificial Analysis, and models.dev inputs must retain at least 50% of their persisted
coverage high-water marks (tracked separately for the voice API and public
page); voice sources must also have complete quality and
input/output pricing on at least half their rows. Cached voice fallback age is
re-evaluated at request time. `refresh:aa-voice` only maintains the bundled
emergency snapshot.

The Worker captures authenticated Artificial Analysis responses into KV each
day at 06:00 Australia/Brisbane. It streams each response without normalizing it
so that the capture stays within the Workers Free CPU limit. A GitHub Actions
job starts at 06:10 Australia/Brisbane, reads one complete capture, fetches
models.dev and the AUD exchange rate, validates all source coverage, and writes
the normalized catalog. The manifest pointer changes only after all required
raw sources are stored. The Action rejects captures older than two hours and
never replaces the last-good catalog with partial source data.

Requests do not rebuild the catalog. They reuse the complete catalog for up to
seven days and mark it `catalogState: "stale"` after 24 hours. The
`latest-cost-quality` policy requires Artificial Analysis evidence no older
than 24 hours, so stale data cannot promote a new model. If the scheduled
capture or Action fails, the prior catalog stays available until its seven-day
limit.

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

GitHub Actions deploys the Worker on pushes to `main`. A separate daily Action
builds the complete production catalog from the raw KV capture. Configure these
repository secrets for both workflows:

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

The key enables the daily raw capture for the language, speech-to-text, and
speech-to-speech APIs. `ARTIFICIAL_ANALYSIS_LLM_URL`,
`ARTIFICIAL_ANALYSIS_FREE_LLM_URL`, `ARTIFICIAL_ANALYSIS_STT_URL`, and
`ARTIFICIAL_ANALYSIS_S2S_URL` may override source URLs for controlled
environments and tests. The public speech-to-speech page remains available to
manual catalog rebuilds as a fallback, but it is not part of the low-CPU raw
capture.
