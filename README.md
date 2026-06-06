# AI Registry

Public Cloudflare Workers API for IT Solver model recommendations.

Production URL:

```text
https://ai.itsolver.au
```

The Worker uses Artificial Analysis data for OpenAI, Google, xAI, Anthropic, NVIDIA, ElevenLabs, and Groq benchmark candidates, then exposes a small `/v1/...` API with recommendation tiers.

Recommendations are tuned for IT Solver customer support, voice-agent API work, and speech-to-text transcription. For customer support, recommendations require real token pricing, a local auto-close benchmark result, and default-production availability. Ranking is safety-first: false positives sort first, accuracy second, and expected Run AUD/token efficiency third. Deprecated and retired models are excluded from public model, benchmark, and recommendation results. Preview-only, experimental, latest-alias, and near-retirement text models are not default production recommendations. Voice recommendations use a cached Artificial Analysis speech-to-speech leaderboard extract. Speech-to-text recommendations use Artificial Analysis STT rows with AA-WER, speed, and provider pricing.

Model pricing from Artificial Analysis is converted to AUD using the daily USD to AUD rate from Frankfurter. The API only returns AUD pricing.

## Endpoints

All API endpoints are public and require no bearer token or IP allowlist.

```text
GET /v1/health
GET /v1/benchmarks?useCase=customer-support|voice|speech-to-text
GET /v1/models
GET /v1/models/recommend
GET /v1/models/providers
GET /v1/models/:provider/latest
```

Unprefixed `/benchmarks`, `/models`, `/models/recommend`, `/models/providers`, and `/models/:provider/latest` mirror v1. The old `/models.json` and `/model-registry.json` registry documents are intentionally gone.

Example:

```bash
curl "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast"
```

Recommendation responses keep the primary model in `recommendation` and include
up to two `failovers` for customer-support overload handling. Failovers are
ranked with the same production filters and require IT Solver auto-close
benchmark data; when fewer than two are available, `failoverStatus.reason` is
`insufficient_its_autoclose_benchmarks`.

Supported filters:

```text
provider=openai|google|xai|anthropic|nvidia|elevenlabs|groq
tier=fast|balanced|best
capability=vision|pdf|reasoning|toolCalling|structuredOutput
maxInputCostPerMTok=2               # max input AUD per million tokens
maxOutputCostPerMTok=10             # max output AUD per million tokens
minRunCostAud=100                   # min AA benchmark Run AUD
maxRunCostAud=500                   # max AA benchmark Run AUD
maxRunCostUsd=900                   # max AA benchmark Run USD, converted with the catalog FX rate
minIntelligence=30                  # min AA Intelligence Index for benchmark-backed text rows
maxAudioInputCostPerHour=5          # max voice input/cost-to-run AUD per hour
maxAudioOutputCostPerHour=5         # max voice output AUD per hour
maxTranscriptionCostPer1kMinutes=10 # max speech-to-text AUD per 1,000 minutes
maxAaWer=4.6                        # max speech-to-text AA-WER error rate
maxCostPerMTok=2                    # legacy alias for maxInputCostPerMTok
minContextWindow=200000
useCase=customer-support|voice|speech-to-text  # stt is accepted as an alias
includeItsBenchmark=false              # omit IT Solver auto-close ranking for customer support
allowPreview=true                      # allow preview models in customer-support recommendations
```

## Local Development

```bash
npm install
npm test
npm run build
npm run dev
```

Refresh the cached Artificial Analysis extracts:

```bash
npm run refresh:aa-customer-support
npm run refresh:aa-llm-efficiency
npm run refresh:aa-llm-pricing
npm run refresh:aa-stt
npm run refresh:aa-voice
```

Do not run a new Anthropic customer-support auto-close benchmark from this repo
without a manual approval checkpoint. A benchmark proposal may list candidate
Anthropic model names and estimated cost, but execution requires explicit human
approval before any API calls are made.

## Cloudflare Setup

Create the KV namespace used for the normalized catalog cache and replace the placeholder IDs in `wrangler.toml`:

```bash
wrangler kv namespace create MODEL_CACHE
wrangler kv namespace create MODEL_CACHE --preview
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
