---
name: voice
description: Sets up spoken replies in the character's own cloned voice, or switches the dub the reference lines are taken from — en, ja, ko or zh — installing the engine's runtime and weights into the plugin's state directory on the first run; with no dub, reports what is installed.
argument-hint: [en | ja | ko | zh]
disable-model-invocation: true
---

# Voice

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" voice $ARGUMENTS
```

Relay its lines as written. The first run downloads the engine's runtime and weights — a couple of gigabytes — and prints its progress; it ends by speaking one sentence as this session's character, so the person hears the voice before the first reply does. It also writes the hook that reads each reply's spoken lines into user settings, which the tool reads once per process, so replies are read from the next session.
