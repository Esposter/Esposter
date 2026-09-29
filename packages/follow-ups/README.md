# @esposter/follow-ups

A Claude Code plugin that writes the follow-ups a session leaves unfinished into an Esposter TodoList, tagged with the repository and session that found them, and drains a repository's follow-ups again one change at a time until none is left.

- **Capture** — work a session saw and is leaving undone becomes a todo the moment it is recognised, instead of a line in scrollback.
- **Drain** — a session takes its repository's open follow-ups in the owner's order, does each through the repository's own change loop, and ticks it or hands it back.
- **One install, every repository** — the endpoint, the session's values and the skills travel with the plugin, and the API key stays in the credential store.

## Getting Started

Open a TodoList, press **Connect an agent** and follow its steps: create an API key under API keys in your settings, then install the plugin and give it the site, the list's id and the key.

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install follow-ups@esposter
```

## Documentation

[TodoList agent follow-ups](https://esposter.com/docs/resource/todolist-agent-follow-ups) — the origin a follow-up carries, the procedures the plugin's tools call, and what counts as a follow-up.
