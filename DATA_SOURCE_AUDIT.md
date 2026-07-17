# Data Source Audit

Last audited: 2026-07-17

Sources checked:

- `https://models.dev/api.json`
- `https://artificialanalysis.ai/api/v2/data/llms/models`
- `https://artificialanalysis.ai/api/v2/language/models/free` (all pages)
- `https://artificialanalysis.ai/api/v2/media/speech-to-speech/models`
- `https://artificialanalysis.ai/leaderboards/models`
- `https://artificialanalysis.ai/speech-to-speech`
- Live registry: `https://ai.itsolver.au/v1/models`
- Live benchmarks: `https://ai.itsolver.au/v1/benchmarks`

## Findings

### models.dev import

models.dev is the mandatory canonical source for base model identity, provider,
release/update dates, context and output limits, capabilities, modalities,
availability, deprecation state, and fallback pricing. The source can be
overridden for tests with `MODELS_DEV_URL`.

`/v1/models` returns these base registry records. Artificial Analysis effort
configurations are not promoted into duplicate registry models, so a newly
published model can be visible before it has enough benchmark evidence to be
recommended. Fable 5, Grok 4.5, and GPT-5.6 should appear as base families
whenever models.dev publishes them for a supported provider.

models.dev `cost.input_audio` and `cost.output_audio` values are normalized to
`audioInputPerMTok` and `audioOutputPerMTok`, then converted from USD to the
catalog currency with the same exchange rate as other token prices. An active
models.dev model with both audio input and output modalities is included in
voice benchmark browsing even before Artificial Analysis evaluates it. Such a
row has `source: "models.dev"`, `recommendable: false`, and
`eligibilityReason: "missing_voice_benchmark"`.

Every accepted models.dev refresh must retain at least 50% of each provider's
persisted high-water row count. Structurally valid but truncated responses do
not replace the cached catalog.

### Artificial Analysis speech-to-speech refresh

Speech-to-speech data is now refreshed automatically during every catalog
rebuild. When `ARTIFICIAL_ANALYSIS_API_KEY` is configured, the Worker first
requests the structured speech-to-speech endpoint. It then tries the complete
serialized dataset on the public leaderboard page, whether the API is absent,
unavailable, or invalid. The page parser accepts only OpenAI, Google, xAI, and
Anthropic rows, deduplicates slugs, and keeps the most complete copy.

A live result is accepted only when it retains at least 50% of that live
source's persisted coverage high-water mark and at least half of its rows individually contain a
positive Speech-to-Speech Index plus positive input and output audio prices.
The structured API's `price_per_hour_input` list price is used when the
page-only benchmark input cost is unavailable; the two fields remain distinct.
Valid live data and the API/public-page high-water counts are saved separately in KV as the
last-known-good voice snapshot. Malformed, incomplete, or unpersistable fetches
never replace it. The fallback order is:

1. Authenticated Artificial Analysis API.
2. Artificial Analysis public leaderboard page.
3. Last-known-good KV snapshot.
4. Checked-in emergency snapshot.

API and public-page results have `state: "live"`. KV and bundled fallbacks are
`fallback_fresh` for at most 14 days after their successful fetch/extraction
time, then `fallback_stale`. Stale voice rows remain browseable, carry
`stale_voice_benchmark`, and cannot be recommended. `sourceStatus.voice` exposes
the state, origin, fetch time, and row count in catalog response metadata and
`/v1/health`. The age boundary is re-evaluated whenever a cached catalog is read,
so the eight-hour catalog TTL cannot extend recommendation eligibility.

Best-tier benchmark-backed voice ranking starts with Artificial Analysis's
source-provided Speech-to-Speech Index; absent quality values sort last. The
checked-in snapshot is only an emergency fallback and `npm run refresh:aa-voice`
is not required for normal upstream refreshes.

Some bundled rows lack the page's input-audio benchmark cost. A row with positive
input and output list prices can still satisfy pricing eligibility through the
documented API fallback; a row with no usable prices remains visible but
ineligible. List price is not exposed as benchmark cost.

### Artificial Analysis LLM data

When `ARTIFICIAL_ANALYSIS_API_KEY` is configured, each catalog refresh merges:

- The legacy detailed endpoint from `ARTIFICIAL_ANALYSIS_LLM_URL` for existing
  benchmark signals.
- Every page of the current free endpoint from
  `ARTIFICIAL_ANALYSIS_FREE_LLM_URL` for current headline indices, nested
  pricing, nested median performance, and Intelligence Index total/per-task
  cost.

Current free-feed fields take precedence. Legacy and checked-in extracts fill
missing fields only and never replace fresher live values. The current parser
follows `pagination.has_more`, `page`, and `total_pages` rather than assuming the
first page is complete.

Artificial Analysis rows are matched to a models.dev family by normalized
provider and model identity. Effort variants such as `gpt-5-6-sol-high` keep
distinct benchmark rows and scores while inheriting applicable base-family
metadata. Fable and GPT-5.6 variants can therefore appear in customer-support
benchmarks when their required signals exist; Grok 4.5 is not forced into a
customer-support recommendation without those signals.

### Visibility and recommendation eligibility

The API intentionally exposes different datasets:

- `/v1/models` contains base registry records and honors explicitly supplied
  filters.
- `/v1/benchmarks` contains use-case benchmark/configuration rows, including
  relevant incomplete rows with a recommendation-eligibility reason. For voice,
  this includes current models.dev audio models awaiting Artificial Analysis.
- `/v1/models/recommend` retains its existing response shape and only considers
  rows with positive pricing, production availability, and all evidence
  required by the selected use case by default.
- `/v1/health` reports registry, benchmark, and recommendable counts separately;
  `/v1/models/providers` derives provider totals from registry records.

This is a show-first, qualify-later policy: visibility in a registry or
benchmark response does not imply recommendation eligibility.

`allowUnbenchmarkedLatest=true` is an explicit exception for best-tier
use-case recommendations. When the latest eligible full-size production
registry model has no valid matching benchmark, it may become the primary
recommendation. The heuristic requires the selected use case's modalities, capabilities, and
positive comparable pricing; it excludes deprecated, open-weight, preview-risk,
and `latest` aliases. Benchmark-only threshold filters disable the exception.

The heuristic ranks full-size candidates ahead of explicitly reduced variants
such as `mini`, then sorts by release date, update date, context window, and
higher use-case-specific comparable price when the units match. Recency and those
tie-breakers are only proxies for likely capability: they are not measured
intelligence, benchmark evidence, or value optimization. Responses make that
distinction explicit with
`recommendationMeta.policy: "allow_unbenchmarked_latest"`,
`selectionBasis: "latest_release"`, `benchmarkEligible: false`, and
`valueOptimized: false`. Fast and balanced tiers, and best without the flag,
remain benchmark-backed.

### Freshness and source precedence

Current Artificial Analysis input/output pricing takes precedence when present;
models.dev pricing is the registry fallback. Source USD pricing and benchmark
costs are converted to AUD with the catalog's Frankfurter exchange rate.

The normalized KV cache uses `catalog:v29` so older response shapes cannot be
served after deployment. A models.dev failure or per-provider coverage drop
below the persisted 50% high-water threshold always prevents a cache write.
The provider high-water counts live in the separate non-expiring
`models-dev:provider-high-water:v1` key, so expiry of the eight-hour catalog cache
cannot reset the guard before the daily scheduled refresh.
When an Artificial Analysis key is configured, failure of any current-free page
also prevents a cache write; legacy LLM and speech-to-text failures may use
checked-in fallback extracts. Speech-to-speech has the independent validated
live/page/KV/bundled fallback sequence described above. If a valid older catalog
is already cached, the Worker continues serving it rather than overwriting it
with partial data.

After deployment, verify that the three named model families appear in registry
JSON when present upstream, `/v1/models` and `/v1/benchmarks` differ as intended,
incomplete rows are visible but not recommendable, health/provider counts match
their respective datasets, and all three homepage modes render distinct table
content. Also verify `sourceStatus.voice`, an unbenchmarked models.dev voice row
such as `gpt-realtime-2.1` when present upstream, strict best-tier exclusion, and
its explicitly opted-in `latest_release` recommendation metadata.
