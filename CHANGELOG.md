# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2026-08-18

### Added

- Added the completed GPT-5.6 Luna, Terra, and Sol Codex auto-close benchmark evidence for all supported reasoning efforts, with the failed zero-false-positive gate stated on every row.
- Added the opt-in `selectionPolicy=latest-cost-quality` customer-support policy. It selects a newer stable Artificial Analysis configuration only when task cost does not increase, Intelligence does not decrease, required capabilities are present, and comparable IT Solver evidence does not show a safety regression.
- Added complete recommendation audit metadata for the incumbent, selected configuration, release date, Artificial Analysis cost per task, Intelligence, and evidence time.
- Added `front-end-web-dev` benchmark browsing and recommendations from Arena Frontend Code, with Claude Opus 5 Max as the current preference leader.
- Added Moonshot AI and the canonical `kimi-k3` models.dev/API identity to the public registry.
- Added a guarded Arena refresh command that validates supported rows and canonical models.dev mappings before it writes the generated snapshot.

### Changed

- Set the catalog refresh schedule to daily: the Worker captures sources at 06:00 Australia/Brisbane and GitHub Actions rebuilds the catalog at 06:10.
- Moved complete catalog construction to a daily GitHub Actions job. The Worker now streams authenticated Artificial Analysis responses into KV before the Action validates and normalizes them.
- Kept successful catalog entries for seven days as last-good data. Requests do not run source refreshes and mark data older than 24 hours as stale.
- Rejected Artificial Analysis refreshes that return less than half of the last-good row coverage.
- Refreshed `/webdev` with the August 15 Arena snapshot and the August 13 Vibe Code Bench functional cross-check; unavailable and stale boards are excluded rather than blended.
- Added a 30-day fail-closed freshness gate so the Arena extract cannot keep driving recommendations after it becomes stale.
- Split front-end recommendation priorities into highest Arena score, best top-10 value, and lowest top-20 output cost.
- Made highest Arena score the default front-end priority and exposed the top three distinct Arena-ranked model families in recommendation responses and the homepage table.
- Credited the Arena Frontend Code leaderboard directly in the front-end recommendation view.
- Replaced the verbose `/webdev` report with a minimal winner view, one model table, and two source notes; removed the stale excluded board from the page and audit.

### Fixed

- Mapped Arena harness and effort configurations to explicit deployable registry IDs, preserving their evaluation metadata and keeping configuration-specific scores off base registry rows.

### Fixed

- Prevented request and scheduled events on the Workers Free plan from running the CPU-heavy complete catalog build.
- Processed the daily Artificial Analysis source capture sequentially and retried transient source failures. This keeps the capture within Worker connection limits and does not publish a manifest unless all required sources succeed.
- Used the Artificial Analysis Free speech endpoints for daily capture. Free speech rows validate source completeness but keep the priced bundled speech snapshot until a configured Pro response is available.
- Kept the previous raw-source manifest and normalized catalog when a required source is missing, partial, invalid, or more than two hours old.
- Reconciled the repository cache key with the live `catalog:v31` production key so a Worker deployment keeps the existing last-good catalog.

## 2026-07-17

### Added

- Added automatic Artificial Analysis speech-to-speech refreshes with authenticated API, public-page, last-known-good KV, and bundled emergency-snapshot fallback stages.
- Added models.dev audio input/output token pricing and visible `missing_voice_benchmark` rows for current audio models that Artificial Analysis has not evaluated yet.
- Added the best-tier `allowUnbenchmarkedLatest=true` option and homepage evidence-policy control, with response metadata that distinguishes a `latest_release` heuristic from benchmark-backed and value-optimized selections.

### Changed

- Ranked best-tier benchmark-backed voice models by Artificial Analysis's Speech-to-Speech Index and kept missing quality values last.
- Limited fallback voice evidence to 14 days for recommendation purposes; older rows remain visible as `stale_voice_benchmark` but cannot drive a recommendation.
- Made the opted-in latest-model path capability-first by preferring full-size variants before release recency and use-case-specific tie-breakers, while preserving benchmark-required behavior for fast, balanced, and non-opted-in best requests.

### Fixed

- Rejected truncated Artificial Analysis voice and models.dev refreshes using persisted coverage high-water marks (separate for the voice API and public page), required complete same-row voice evidence, and kept KV write failures inside the fallback chain.
- Re-evaluated the 14-day voice fallback cutoff whenever a cached catalog is read, and used structured API input list pricing when page-only benchmark cost is unavailable.

## 2026-07-16

### Added

- Restored a live models.dev-backed base-model registry and enriched it from both the legacy Artificial Analysis LLM endpoint and the paginated current free Language Models endpoint.
- Added visible recommendation-eligibility reasons to relevant incomplete benchmark rows.
- Added distinct homepage views for recommendations, use-case benchmark rows, and base registry models.

### Changed

- Made `/v1/models` return canonical registry records, kept `/v1/benchmarks` focused on benchmark/configuration rows, and reported registry, benchmark, and recommendable counts separately.
- Preserved Artificial Analysis effort variants as distinct benchmark rows while matching them to base registry families.
- Kept new models visible before they qualify for recommendations, while retaining strict positive-pricing, production-availability, and use-case evidence requirements.
- Versioned the normalized catalog cache and retained a valid cached catalog when a primary live refresh fails instead of replacing it with partial data.

### Fixed

- Parsed current Artificial Analysis nested pricing, performance, and Intelligence Index task-cost fields so newly published models are not hidden by missing normalized prices.
- Prevented late requests from a previously selected homepage mode from replacing the active table, so all three browse choices now render their own rows and columns.
- Deduplicated recommendation failovers by canonical base model before applying the failover limit, including when an effort row is missing family metadata.
- Preserved explicit Artificial Analysis reasoning and vision capability values on effort variants joined to a base registry model.
- Preferred exact Artificial Analysis effort configurations over stripped base aliases when filling missing benchmark fields.
- Distinguished a shortage of base-model families from a shortage of IT Solver auto-close benchmark rows in failover status responses.
- Prevented effort variants without an exact IT Solver auto-close run from inheriting a base model's benchmark result.

## 2026-07-08

### Fixed

- Fixed document-processing follow-ups from PR review: preserve image pricing with token pricing, avoid customer-support availability exclusions for OCR recommendations, keep hidden support capability filters out of document tables, and scope vision output speed to document rankings.

## 2026-07-07

### Added

- Added document-processing OCR recommendations using Artificial Analysis visual reasoning, image pricing, latency, instruction following, intelligence, and Task AUD signals.
- Added `document-processing`, `ocr`, and `document-ocr` use-case parsing.
- Added document-processing filters for `minVisualReasoning` and `maxImageInputCostPer1kImagesAud`, with `maxImageInputCostPer1kImages` accepted as a compatibility alias.
- Added `recommendation.failover` to recommendation responses for the next-best model under the same filters.

### Changed

- Split homepage query builder endpoint choices into recommendations, benchmark rows, and raw registry models so copied/opened URLs match the visible table source.
- Made homepage query-builder filters use explicit use-case profiles so document processing, customer support, speech-to-speech (voice), and speech-to-text only serialize their active controls.
- Renamed the public `voice` use-case label to `speech to speech (voice)` while keeping `useCase=voice` compatible and accepting `speech-to-speech` aliases.
- Added `includeItsEval=false` as the public customer-support benchmark-source alias while preserving legacy `includeItsBenchmark=false`.
- Limited nested `recommendation.failover` to the requested provider when `provider` is supplied.
- Skipped same-family variants when choosing nested `recommendation.failover` so same-provider fallbacks remain operationally distinct.

## 2026-06-06

### Added

- Added Artificial Analysis Intelligence Index Task AUD to customer-support benchmark data, filters, and homepage tables.
- Added a public web application development benchmark composite page at `/webdev`.
- Added Gemini-only IT Solver auto-close benchmark results to generated data, model details, benchmark APIs, and `/its`.
- Added newer Grok 4.3 low/medium/high and Gemma IT Solver auto-close benchmark rows to generated data and `/its`.
- Added customer-support recommendation failovers and refreshed no-cost IT Solver auto-close benchmark rows.
- Added a public aggregate ITS auto-close benchmark page at `/its`.

### Changed

- Replaced customer-support Run AUD emphasis with Intelligence Index Task AUD while keeping legacy Run AUD filters supported.
- Increased the homepage Task AUD range to $5 so expensive benchmark rows like Claude Fable can be selected.
- Removed the customer-support output-tokens-per-task metric from homepage tables and ranking so Task AUD is the cost representation.
- Filled more Task AUD values by merging Artificial Analysis model comparison chart data into the LLM efficiency extract.
- Refocused the `/webdev` page around winner models, benchmark breakdown, cost, and execution-time context.
- Hid deprecated ITS auto-close benchmark rows by default while keeping them available behind an explicit toggle.
- Populated customer-support model table rows with the curated ITS auto-close benchmark results where the registry already has matching models.
- Clarified customer-support AA-only score and safety labels, and made balanced AA-only recommendations pick the median candidate from the AA support-score ordering.
- Renamed the customer-support `best` recommendation label from highest ITS safety to lowest false-positive risk.
- Tightened the desktop homepage query builder so filters and preview content fit higher in the viewport.
- Removed the duplicate generated URL from the homepage query builder.

### Fixed

- Preserved balanced-tier query serialization, made live STT refresh failures non-fatal, and filtered AA-only support rows to the source capability constraints.

## 2026-06-05

### Changed

- Simplified the homepage intro into a compact header so the builder and benchmarks start in the first viewport.
- Preserved homepage builder filters across page refreshes by syncing them into the page URL.
- Renamed the speech-to-text fast tier to fast and cheap, made it cost-first, and made balanced recommendations distinct from highest accuracy.

## 2026-06-01

### Added

- Added `maxAaWer` filtering and a homepage AA-WER ceiling slider for speech-to-text models.
- Added Artificial Analysis-backed speech-to-text recommendations, filtering, and homepage benchmark table.
- Added Groq as a speech-to-text provider candidate.
- Added a checked-in Artificial Analysis speech-to-text table extract and refresh command.

### Changed

- Removed secondary speech-to-text dataset columns from the homepage table so it focuses on AA-WER, speed, and price.
- Defaulted the speech-to-text homepage builder to a 4.6% AA-WER cap and $10 AUD/1k minute filter.
- Excluded locally retired speech-to-text models from public benchmark, model, and recommendation results.

## 2026-05-22

### Added

- Added AA benchmark-backed customer support data.

### Changed

- Updated benchmark UI and AA documentation.

## 2026-05-21

### Added

- Added AA output efficiency signals.

### Changed

- Customized benchmark use case panels.
- Stabilized builder benchmark tables.
- Removed the coding use case.

## 2026-05-20

### Added

- Added use-case benchmark tables.
- Added benchmark FAQ content and selected-result highlighting.
- Added an audit of model data sources.

### Changed

- Replaced the static registry with a Cloudflare Worker.
- Clarified use cases and output cost filters.
- Required audio-capable models for voice recommendations.
- Used the AA speech leaderboard for voice model recommendations.
- Showed voice benchmarks on the homepage.
- Defaulted the builder tier filter to `any`.
- Showed the selected use case benchmark near the builder.

### Removed

- Reverted xAI voice recommendation support after adding it.

## 2026-05-19

### Added

- Added Anthropic models to the registry.
- Added reconciliation models to the registry.

### Changed

- Updated GitHub Pages workflow actions for Node 24-compatible majors.
- Simplified the canonical registry URL to `models.json`.

## 2026-05-18

### Added

- Created the initial AI model registry.
- Added the `ai.itsolver.au` custom domain file.

### Changed

- Configured Cloudflare static deploy.
- Switched registry deployment to GitHub Pages.
