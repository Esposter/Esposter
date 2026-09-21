---
name: language
description: Sets the language every word the plugin writes is in — the card, the spinner's verbs and tips, the status line and each verb's own output — and carries the reply language with it. Given no language, reports what is set and lists the ones the data package answers in.
argument-hint: [language]
disable-model-invocation: true
---

# Language

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" language $ARGUMENTS
```

Relay its lines as written. The card it prints is the session's card from this reply on.
