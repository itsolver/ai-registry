# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
