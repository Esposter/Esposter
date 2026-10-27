# @esposter/scripts

[![Apache-2.0 licensed][badge-license]][url-license]

The repository's own tooling — the workspace dependency graph, the outdated-dependency report, the custom oxlint plugins, the sweep scans and the cross-platform launcher.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="commands">⌨️ Commands</a>

Run from `scripts/`:

```bash
pnpm ai:ci:watch
pnpm ai:citations:sync
pnpm ai:dependencies:score
pnpm ai:fleet:claim
pnpm ai:fleet:data
pnpm ai:fleet:hold
pnpm ai:fleet:next
pnpm ai:fleet:profile
pnpm ai:fleet:release
pnpm ai:fleet:status
pnpm ai:gcsim:configs
pnpm ai:identifiers:rename
pnpm ai:machine:watch
pnpm ai:package:new
pnpm ai:proposals:report
pnpm ai:resume
pnpm ai:review
pnpm ai:review:fix
pnpm ai:review:settle
pnpm ai:skills:extract
pnpm ai:sweep:constant-scope
pnpm ai:sweep:duplicate-code
pnpm ai:sweep:duplicate-prose
pnpm ai:sweep:file-organization
pnpm ai:sweep:ledger-coverage
pnpm ai:sweep:repeated-list-items
pnpm ai:sweep:shared-export-consumers
pnpm ai:sweep:skill-docs
pnpm ai:sweep:unterminated-results
pnpm ai:triage:label
pnpm ai:usage
pnpm ai:voice-match
pnpm ai:worktree:remove
pnpm crossOS
pnpm genshin:animestudio:build
pnpm genshin:assets
pnpm genshin:data
pnpm genshin:parity
pnpm genshin:text
pnpm graph:gen
pnpm outdated:dependencies
pnpm recreation
pnpm update:node
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
