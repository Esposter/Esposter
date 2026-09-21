---
name: reply
description: Sets the language replies are written in, on its own, for someone who wants the plugin's labels in one language and its prose in another. Given nothing, reports what is set and whether it was set or cascaded from the interface language.
argument-hint: [language]
disable-model-invocation: true
---

# Reply

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" reply $ARGUMENTS
```

Relay its lines as written, and write every reply in that language from this one on.
