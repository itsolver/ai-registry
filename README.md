# AI Registry

Static model registry for IT Solver AI integrations.

Intended production URL:

```text
https://ai.itsolver.au/model-registry.json
```

Consumers should set:

```text
AI_MODEL_REGISTRY_URL=https://ai.itsolver.au/model-registry.json
```

Explicit model environment variables in consuming apps still take precedence. For example, unset `GEMINI_MODEL`, `OPENAI_STANDARD_MODEL`, and similar variables when the app should use this registry.

## Files

- `public/model-registry.json`: production registry document served at `/model-registry.json`.
- `public/schema/model-registry.schema.json`: JSON Schema reference for tooling.
- `scripts/validate_registry.py`: dependency-free validator used by CI.
- `public/CNAME`: GitHub Pages custom domain declaration for `ai.itsolver.au`.
- `.github/workflows/validate.yml`: validates pull requests and deploys `public/` to GitHub Pages on `main`.

## Validate Locally

```bash
python3 scripts/validate_registry.py public/model-registry.json
```

## Deployment

The repository deploys `public/` to GitHub Pages on every push to `main`. No Cloudflare API token or deployment secret is required.

GitHub Pages settings:

```text
Source: GitHub Actions
Custom domain: ai.itsolver.au
Enforce HTTPS: enabled
```

DNS should point the `ai` subdomain at GitHub Pages:

```text
Type: CNAME
Name: ai
Target: itsolver.github.io
Proxy status: DNS only
```

Keep Cloudflare proxying disabled for this hostname so non-browser clients can fetch the registry without bot/WAF interference.
