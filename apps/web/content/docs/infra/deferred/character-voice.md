---
title: Character voice
description: Stage 3 of the Claude interface — the persona plugin's speak hook pointed at a local few-shot voice model instead of Azure, kept off this repository entirely, behind two gates.
---

# Character voice

**What it was.** The [spoken replies](/docs/infra/claude-interface/spoken-replies) hook talks to an HTTP text-to-speech endpoint and knows nothing about whose voice answers, so a character's voice is the same hook pointed at a local server. Azure cannot carry it: its custom and personal voice features require a recorded consent statement from the voice talent before a model can be trained, which a game character's actor will never give, so the free-tier account stops at generic voices by design. The open-source few-shot voice toolkit the character-voice community has settled on is MIT-licensed, has an ONNX inference engine with an HTTP server, and fine-tunes from minutes of reference audio.

The character-specific half stays local and unpublished. The publisher of the game requires written consent from both the company and the voice artist for any generative use of a character voice, sued a commercial voice-cloning service over it and won, and asks the community to report unauthorised use. Personal use on one machine, from reference audio never redistributed and a model never committed anywhere, is the only defensible shape: the public plugin ships the adapter, and the voice is a file on this machine.

**Why deferred.** Two gates, in order:

1. Spoken replies are still switched on after two weeks of daily use. This stage exists to make that voice a character's; if the generic voice is muted within a fortnight, a better voice would be muted too.
2. The stage is the first with real maintenance — a Python environment, model formats that change with the toolkit, a GPU-or-not question the machine answers. It opens when an inference engine installs in one command on Windows with no Python environment to keep alive, which is what the next generation of these engines is converging on; waiting for it is cheaper than owning the current one.

**Revisit when:** both gates answer yes — the mute flag has stayed off for two weeks, and a few-shot engine ships a one-command Windows install. Then the change is a second endpoint in the plugin's user configuration and nothing in the estate.
