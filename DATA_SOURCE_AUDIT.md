# Data Source Audit

Last audited: 2026-07-16

Sources checked:

- `https://models.dev/api.json`
- `https://artificialanalysis.ai/api/v2/data/llms/models`
- `https://artificialanalysis.ai/api/v2/language/models/free` (all pages)
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

### Artificial Analysis speech-to-speech scrape

The checked-in speech-to-speech extract continues to supply voice benchmark
rows and can be refreshed independently. Rows without
`costPerHourOfInputAudio` are visible, but do not qualify for recommendations
that require `maxAudioInputCostPerHour`.

Known source rows without that input-audio cost are:

- `google-gemini-2-5-flash-native-audio-dialog-thinking`
- `google-gemini-2-5-flash-native-audio-preview-dec-2025`
- `openai-4o-audio-chatcompletions`

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
  relevant incomplete rows with a recommendation-eligibility reason.
- `/v1/models/recommend` retains its existing response shape and only considers
  rows with positive pricing, production availability, and all evidence
  required by the selected use case.
- `/v1/health` reports registry, benchmark, and recommendable counts separately;
  `/v1/models/providers` derives provider totals from registry records.

This is a show-first, qualify-later policy: visibility in a registry or
benchmark response does not imply recommendation eligibility.

### Freshness and source precedence

Current Artificial Analysis input/output pricing takes precedence when present;
models.dev pricing is the registry fallback. Source USD pricing and benchmark
costs are converted to AUD with the catalog's Frankfurter exchange rate.

The normalized KV cache uses `catalog:v28` so older response shapes cannot be
served after deployment. A models.dev failure always prevents a cache write.
When an Artificial Analysis key is configured, failure of any current-free page
also prevents a cache write; legacy LLM and speech-to-text failures may use
checked-in fallback extracts. If a valid older catalog is already cached, the
Worker continues serving it rather than overwriting it with partial data.

After deployment, verify that the three named model families appear in registry
JSON when present upstream, `/v1/models` and `/v1/benchmarks` differ as intended,
incomplete rows are visible but not recommendable, health/provider counts match
their respective datasets, and all three homepage modes render distinct table
content.
