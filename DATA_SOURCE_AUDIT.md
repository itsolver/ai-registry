# Data Source Audit

Last audited: 2026-05-20

Sources checked:

- `https://models.dev/api.json`
- `https://artificialanalysis.ai/api/v2/data/llms/models`
- `https://artificialanalysis.ai/leaderboards/models`
- `https://artificialanalysis.ai/speech-to-speech`
- Live registry: `https://ai.itsolver.au/v1/models?includeDeprecated=true`

## Findings

### models.dev import

The live registry matched the current models.dev source for the supported providers.

- Supported models.dev records: 129
- Live registry records: 144
- Extra records: 15 Artificial Analysis speech-to-speech records
- Missing models.dev records: 0
- AUD pricing mismatches after USD to AUD conversion: 0
- Context window / output limit / deprecated status mismatches: 0

No code change was needed for models.dev normalization.

### Artificial Analysis speech-to-speech scrape

The public speech-to-speech page scrape produced the same 15 records as the committed generated data. Only the extraction timestamp changed.

The live registry matched the extracted AA speech records after AUD conversion:

- AA speech records: 15
- Live AA voice records: 15
- Missing records: 0
- Pricing mismatches: 0

AA source records without `costPerHourOfInputAudio`:

- `google-gemini-2-5-flash-native-audio-dialog-thinking`
- `google-gemini-2-5-flash-native-audio-preview-dec-2025`
- `openai-4o-audio-chatcompletions`

These are not simple registry bugs. The source page does not provide the benchmark input-audio cost field for those rows, so the registry correctly avoids using them for `maxAudioInputCostPerHour` recommendations.

### Artificial Analysis LLM data

The live registry matched all 47 benchmarked text models back to public Artificial Analysis leaderboard records by provider and model id/name/slug.

Simple fix applied:

- `tau2` is now accepted as a telecom benchmark alias.
- `gdpval_normalized` is now accepted as a professional-task benchmark alias if the API provides it.
- `0` speed / latency values are now treated as missing, not real benchmark values.

After deployment and cache refresh:

- Text models with AA LLM benchmarks: 47
- Intelligence signals: 45
- Coding signals: 43
- IFBench signals: 34
- TerminalBench signals: 34
- Telecom signals: 34
- Speed signals: 37
- Latency signals: 37
- Zero speed / latency placeholders: 0

Remaining unresolved issue:

- The public AA leaderboard includes GDPval-style professional-task values, but the free AA LLM API response available to the Worker did not populate `professional` in the live registry after the alias patch. Fixing this likely requires either scraping the public leaderboard payload or using a richer AA API/data product. That is possible, but brittle enough that it should be a deliberate product decision.

### Source disagreements

Some overlapping public AA leaderboard pricing values disagree with models.dev. The registry currently treats models.dev as the source of truth for text model pricing.

Examples in USD:

| Model | models.dev input/output | AA public input/output |
| --- | ---: | ---: |
| `openai:o1-preview` | 15 / 60 | 16.5 / 66 |
| `google:gemini-2.0-flash` | 0.1 / 0.4 | 0.15 / 0.6 |
| `anthropic:claude-sonnet-4-6` | 3 / 15 | 3.75 / 15 |
| `anthropic:claude-opus-4-7` | 5 / 25 | 6.25 / 25 |
| `google:gemma-3-27b-it` | 0 / 0 | 0.1095 / 0.25 |

These are not safe to auto-rectify without deciding which source should own pricing. The current implementation keeps the simpler rule: models.dev owns text model pricing; Artificial Analysis owns benchmark scores and voice benchmark-run pricing.

AA public speed/latency values also differ from the AA free API values for some models, even after a fresh cache refresh. Example:

- `openai:gpt-5.2`
  - Live AA API-derived speed / latency: 66.747 tok/s / 68.508s
  - Public leaderboard speed / latency: 75.999 tok/s / 103.381s

This may be due to different prompt options, API freshness, or leaderboard-specific aggregation. The registry continues to use the AA free API values because they are the supported API source.

