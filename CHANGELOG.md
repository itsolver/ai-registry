# Changelog

## 2026-05-18

- Created initial static AI model registry.
- Added schema and dependency-free validation workflow.
- Moved deployable assets into `public/` and added Wrangler static-assets config for Cloudflare deploys.
- Switched deployment to GitHub Pages and added the `ai.itsolver.au` custom domain file.
- Updated the GitHub Pages workflow actions to Node 24-compatible majors.
- Added `/models.json` as the canonical registry URL and made the bare site redirect there.
- Added Anthropic model entries and logical keys for seasonality extraction and billing categorization.
- Added reconciliation and browser-recovery logical model keys.
