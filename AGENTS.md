## Changelog

- Keep a root `CHANGELOG.md` in the repository. If it is missing, create it.
- `CHANGELOG.md` should include this header template:

```md
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
```

## Publishing

- After changing runtime behavior, model data, generated registry files, or the public UI, run `npm test` and `npm run typecheck`, then publish with `npm run deploy` unless the user explicitly asks not to deploy.
- After deploy, verify the live `https://ai.itsolver.au` endpoint or page that the change affects. Do not report the work as complete until the live check passes or the deploy blocker is clearly stated.
