# @esposter/follow-ups

[![Apache-2.0 licensed][badge-license]][url-license]

A Claude Code plugin that writes the follow-ups a session leaves unfinished into an Esposter TodoList, tagged with the repository and session that found them, and drains a repository's follow-ups again one change at a time until none is left.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/resource/todolist-agent-follow-ups).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Open a TodoList, press **Connect an agent** and follow its steps: create an API key with the Follow-ups scope under API keys in your settings, then install the plugin and give it the site, the list's id and the key.

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install follow-ups@esposter
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
