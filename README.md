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
- `wrangler.toml`: Cloudflare Workers static-assets config for projects that run `npx wrangler deploy`.

## Validate Locally

```bash
python3 scripts/validate_registry.py public/model-registry.json
```

## Deployment

Serve `public/` as the static site root and map `ai.itsolver.au` to it.

Cloudflare Pages settings:

```text
Framework preset: None
Build command: leave blank
Build output directory: public
Root directory: /
Production branch: main
```

If the Cloudflare project is configured to run `npx wrangler deploy`, `wrangler.toml` deploys the same `public/` directory as static Worker assets.
