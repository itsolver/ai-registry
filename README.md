# AI Registry

Private Cloudflare Workers API for IT Solver model recommendations.

Production URL:

```text
https://ai.itsolver.au
```

The Worker imports `https://models.dev/api.json`, keeps only `openai`, `google`, `xai`, and `anthropic`, then exposes a small `/v1/...` API with cost-derived recommendation tiers.

Recommendations are tuned for IT Solver support and coding work. The raw `/v1/models` catalog can include broader provider models, but `/v1/models/recommend` only considers work-appropriate OpenAI, Google Gemini, xAI Grok, and Anthropic Claude models with real input/output pricing. It excludes open-weight, image, audio, live, embedding, moderation, and transcription-style models.

Model pricing from models.dev is converted to AUD using the daily USD to AUD rate from Frankfurter. The API only returns AUD pricing.

## Endpoints

All API endpoints require a bearer token unless the request comes from the allowlisted WAN IP.

```text
GET /v1/health
GET /v1/models
GET /v1/models/recommend
GET /v1/models/providers
GET /v1/models/:provider/latest
```

Unprefixed `/models`, `/models/recommend`, `/models/providers`, and `/models/:provider/latest` mirror v1. The old `/models.json` and `/model-registry.json` registry documents are intentionally gone.

Example:

```bash
curl -H "Authorization: Bearer $MODEL_REGISTRY_API_KEY" \
  "https://ai.itsolver.au/v1/models/recommend?tier=fast"
```

Supported filters:

```text
provider=openai|google|xai|anthropic
tier=fast|balanced|best
capability=vision|pdf|reasoning|toolCalling|structuredOutput
maxCostPerMTok=2                    # AUD per million input tokens
minContextWindow=200000
useCase=support|coding|billing|billing-routine|billing-risky|billing-incident|voice
careLevel=triage|standard|essential|premium|complex
includeDeprecated=true
```

## Local Development

```bash
npm install
npm test
npm run build
npm run dev
```

For local authenticated requests, create `.dev.vars`:

```text
MODEL_REGISTRY_API_KEY=local-secret
```

Then call the local Worker with `Authorization: Bearer local-secret`.

## Cloudflare Setup

Create the KV namespace used for the normalized catalog cache and replace the placeholder IDs in `wrangler.toml`:

```bash
wrangler kv namespace create MODEL_CACHE
wrangler kv namespace create MODEL_CACHE --preview
```

Set the API key secret:

```bash
wrangler secret put MODEL_REGISTRY_API_KEY
```

The default allowlisted IP is configured in `wrangler.toml`:

```text
ALLOWED_IPS=203.12.1.95
```

Deploy:

```bash
npm run deploy
```

GitHub Actions deploys the Worker on pushes to `main`. Configure repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_KV_NAMESPACE_ID
CLOUDFLARE_KV_PREVIEW_NAMESPACE_ID
```

Optional benchmark-aware recommendations use Artificial Analysis. Configure:

```bash
wrangler secret put ARTIFICIAL_ANALYSIS_API_KEY
```
