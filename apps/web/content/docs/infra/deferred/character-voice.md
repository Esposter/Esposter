---
title: Character voice
description: Stage 3 of the Claude interface — the persona plugin's speak hook pointed at a local few-shot voice model instead of Azure, kept off this repository entirely, behind two gates.
---

# Character voice

**What it was.** The [spoken replies](/docs/infra/claude-interface/spoken-replies) hook talks to an HTTP text-to-speech endpoint and knows nothing about whose voice answers, so a character's voice is the same hook pointed at a local server. Azure cannot carry it: its custom and personal voice features require a recorded consent statement from the voice talent before a model can be trained, which a game character's actor will never give, so the free-tier account stops at generic voices by design. The open-source few-shot voice toolkit the character-voice community has settled on is MIT-licensed, has an ONNX inference engine with an HTTP server, and fine-tunes from minutes of reference audio.

The character-specific half stays local and unpublished. The publisher of the game requires written consent from both the company and the voice artist for any generative use of a character voice, sued a commercial voice-cloning service over it and won, and asks the community to report unauthorised use. Personal use on one machine, from reference audio never redistributed and a model never committed anywhere, is the only defensible shape: the public plugin ships the adapter, and the voice is a file on this machine.

## The reference audio, and what can be read off it

The game installs its Japanese voice track as Wwise packages under the client's streaming assets — tens of gigabytes, no decoded audio anywhere in it. Turning that into reference clips is **solved and costs two npm packages**, worked out for the [voice match benchmark](/docs/proposals/infra/voice-match-benchmark) and written up there: the packages are unencrypted, and the decoder is pure JavaScript. Nothing extracted is ever committed — the rule above is what makes this stage defensible, and a cache breaks it exactly as a commit would.

Two different things can come off that audio, and only one of them is worth waiting for a toolchain:

- **Timbre** is the stage itself, and it does not transfer across languages. A Japanese performance cannot read English, so what a few-shot engine learns from it is a speaker embedding applied to English text — which is the whole point of this stage and the reason it needs an inference engine at all.
- **Prosody is measurable now, and already has somewhere to go.** Median fundamental frequency and speaking rate are numbers a script reads off a waveform, and [per-character voices](/docs/infra/claude-interface/per-character-voices) already spends both as `pitch` and `rate` on a catalogue voice. Those numbers are the one part of this stage that pays off before the gates open, and the [voice match benchmark](/docs/proposals/infra/voice-match-benchmark) is how they would be spent: choosing the closest catalogue voice needs the reference audio and no inference engine, so it waits on neither of this stage's gates.

**An agent cannot do the listening half of any of this.** Measuring a waveform is code; deciding whether the result sounds like the character is the person at the keyboard, and no amount of tooling moves that across.

**Why deferred.** Two gates, in order:

1. Spoken replies are still switched on after two weeks of daily use. This stage exists to make that voice a character's; if the generic voice is muted within a fortnight, a better voice would be muted too.
2. The stage is the first with real maintenance — a Python environment, model formats that change with the toolkit, a GPU-or-not question the machine answers. It opens when an inference engine installs in one command on Windows with no Python environment to keep alive, which is what the next generation of these engines is converging on; waiting for it is cheaper than owning the current one.

**Revisit when:** both gates answer yes — the mute flag has stayed off for two weeks, and a few-shot engine ships a one-command Windows install. Then the change is a second endpoint in the plugin's user configuration and nothing in the estate.
