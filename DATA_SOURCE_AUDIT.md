# Data Source Audit

Last audited: 2026-08-18

Sources checked:

- `https://models.dev/api.json`
- `https://artificialanalysis.ai/api/v2/data/llms/models`
- `https://artificialanalysis.ai/api/v2/language/models/free` (all pages)
- `https://artificialanalysis.ai/api/v2/media/speech-to-speech/models`
- `https://artificialanalysis.ai/leaderboards/models`
- `https://artificialanalysis.ai/speech-to-speech`
- `https://arena.ai/leaderboard/code/webdev`
- `https://www.vals.ai/benchmarks/vals_index`
- `https://www.vals.ai/benchmarks/vibe-code`
- `https://intelligence.ai/leaderboard/webapps`
- `https://index.openhands.dev/frontend`
- `https://index.openhands.dev/api/leaderboard`
- `https://platform.kimi.ai/docs/pricing/chat-k3`
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

Moonshot AI is also a supported provider. Kimi K3 uses the canonical direct-API
identity `moonshotai:kimi-k3`; the official Kimi price table, mirrored by the
Arena row, supplies current positive token pricing because the direct models.dev
row did not expose price fields at audit time.

### Arena Frontend Code

The checked Arena page dated 2026-08-15 contained 579,848 total votes across 115
models. Claude Opus 5 Max ranked first at 1692 (±9) from 6,448 votes. Kimi K3
Max ranked second at 1674 (±11), and Claude Opus 5 High ranked fourth at 1663
(±9). Arena's human-preference rating is the only score used for this use case
and is not numerically combined with independent boards.

Every checked Arena entry declares a same-provider canonical models.dev ID.
Configuration labels such as `max`, `high`, and `xhigh via Codex harness`
remain on the benchmark candidate while `registryModelId` identifies the
deployable base model. This allows GPT-5.6 Sol xhigh, Claude effort rows, and
Gemini 3.7 Flash high to participate in recommendations without treating a
harness/configuration name as a separate provider model. A declared target that
is absent from the live catalog fails closed as
`registry_mapping_target_unavailable`; broad suffix or cross-provider matching
is not used.

The front-end tiers are deterministic: `best` sorts by Arena score, `balanced`
prefers the lowest output price among eligible top-10 entries, and `fast`
prefers the lowest output price among eligible top-20 entries. Active filters
remain hard constraints, with cost-first fallback among remaining eligible rows
when an entire preferred rank band is removed.

The checked Arena extract has a 30-day maximum age. Once that gate expires, the
catalog stops ingesting its rows and `/webdev` labels the evidence historical;
front-end recommendations remain unavailable until the extract is refreshed.

The Vals Index v2 page updated 2026-08-14 is a broad GDP-weighted composite, not
a front-end rank. Claude Opus 5 leads that index at 67.21%, followed by Claude
Fable 5 at 66.04% and GPT-5.6 Sol at 63.71%. It is shown only as broad context.
The separate Vibe Code Bench v1.1 table updated 2026-08-13 directly measures
functional full-app creation. Claude Fable 5 leads at 90.35%, Claude Opus 5 is
second at 88.40%, and Kimi K3 is third and is the leading open-weight model.

The previous DesignArena Frontend Web App URL returned 404 during this audit,
and the OpenHands Frontend page did not expose a usable current table. Neither
source is presented as current corroboration.

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
so the hourly catalog refresh cannot extend recommendation eligibility.

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

The normalized KV cache uses the production `catalog:v31` key. This preserves
the complete live catalog across Worker deployments and prevents older response
shapes from being served. A models.dev failure or per-provider coverage drop
below the persisted 50% high-water threshold always prevents a cache write.
The provider high-water counts live in the separate non-expiring
`models-dev:provider-high-water:v1` key. The Worker refreshes each hour, treats
catalog data as fresh for one hour, and keeps a complete last-good catalog for
seven days.
When an Artificial Analysis key is configured, failure of any current-free page
or an LLM row-count drop below half of the last-good catalog also prevents a
cache write; legacy LLM and speech-to-text failures may use
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
