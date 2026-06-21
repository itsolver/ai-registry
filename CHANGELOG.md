# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2026-06-06

### Added

- Added a public web application development benchmark composite page at `/webdev`.
- Added Gemini-only IT Solver auto-close benchmark results to generated data, model details, benchmark APIs, and `/its`.
- Added newer Grok 4.3 low/medium/high and Gemma IT Solver auto-close benchmark rows to generated data and `/its`.
- Added customer-support recommendation failovers and refreshed no-cost IT Solver auto-close benchmark rows.
- Added a public aggregate ITS auto-close benchmark page at `/its`.

### Changed

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
