# @esposter/follow-ups

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that writes the follow-ups a session leaves unfinished into an Esposter TodoList, tagged with the repository and session that found them, and drains a repository's follow-ups again one change at a time until none is left.

- **Capture** — work a session saw and is leaving undone becomes a todo the moment it is recognised, instead of a line in scrollback.
- **Drain** — a session takes its repository's open follow-ups in the owner's order, does each through the repository's own change loop, and ticks it or hands it back.
- **One install, every repository** — the endpoint, the session's values and the skills travel with the plugin, and the API key stays in the credential store.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Open a TodoList, press **Connect an agent** and follow its steps: create an API key with the Follow-ups scope under API keys in your settings, then install the plugin and give it the site, the list's id and the key.

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install follow-ups@esposter
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/blob/main/openspec/specs/resource/todolist-agent-follow-ups/design.md) to level up. It covers the origin a follow-up carries, the procedures the plugin's tools call, and what counts as a follow-up.

---

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
