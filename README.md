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

- `model-registry.json`: production registry document.
- `schema/model-registry.schema.json`: JSON Schema reference for tooling.
- `scripts/validate_registry.py`: dependency-free validator used by CI.

## Validate Locally

```bash
python3 scripts/validate_registry.py model-registry.json
```

## Deployment

Serve the repo root as a static site and map `ai.itsolver.au` to it. Cloudflare Pages is the preferred v1 host because it provides static hosting, custom domain support, deploy previews, and rollback without running an app server.
