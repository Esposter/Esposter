---
title: Claude interface
description: How the terminal is given a personality and a voice without building an interface — a Genshin persona plugin picked by the calendar, spoken replies through the Azure Speech free tier, and the terminal kept as the driver because it is the one surface with zero maintenance.
---

# Claude interface

The wish list was personality (a Genshin character rather than a terseness plugin, changing with the calendar), a spoken voice, and eventually a companion on the desktop. The constraint was maintenance: nothing that has to be re-implemented when the tool moves under it. The two pull against each other, and the survey below is where they met — **the terminal already exposes every hook the wish list needs, so what shipped is one plugin and one free Azure resource, with everything else behind a named gate.**

The two built stages have their own pages: the [persona plugin](/docs/infra/claude-interface/persona-plugin) and [spoken replies](/docs/infra/claude-interface/spoken-replies), with [per-character voices](/docs/infra/claude-interface/per-character-voices) covering how the second one tells the roster apart. This page holds the decision, the survey it rests on, and where the gated stages wait.

## What the terminal offers

Everything here is a shipped Claude Code feature, so it costs nothing to keep. What matters about each is the one fact that shaped a stage.

| Surface                    | The fact that matters                                                                                                                                                                                                                                      |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Output styles              | A style file sets voice and tone every turn; "keep-coding-instructions" keeps the engineering behaviour; a plugin forces its own style on with "force-for-plugin". The model is reminded of the style mid-conversation.                                    |
| Session-start hook         | Its stdout becomes context the model sees, and it fires on clear, compact and resume too — so what it prints survives a compaction.                                                                                                                        |
| Stop hook                  | Receives the final reply text directly as "last_assistant_message", so a script can speak it with no transcript parsing, and runs asynchronously so the prompt never waits on it.                                                                          |
| Plugin user configuration  | A manifest declares typed options; one marked sensitive lands in the credential store rather than a settings file, and every option reaches a hook as an environment variable.                                                                             |
| Plugin dependency install  | A plugin root holding a package manifest and an npm lockfile gets a frozen install with lifecycle scripts off and a one-minute ceiling when the plugin is copied into the cache.                                                                           |
| Plugin settings file       | May set two keys, both about subagents. The status line and the spinner are user settings, so the plugin's skill writes them on request, its hook keeps the spinner on the session's character, and the persona page says how the path survives an update. |
| Voice dictation            | Built in, push-to-talk, no tokens and no cost. Input is solved without building anything.                                                                                                                                                                  |
| Desktop app                | Reads the same settings, hooks and plugins as the CLI. A visual shell already exists; it changes the frame, not the personality.                                                                                                                           |
| Agent SDK and ACP adapters | The only way to drive a real session from a custom window, and both bill through an API key: the subscription login is not permitted for a third-party product, so a home-built driver pays API prices. This row gates stage 4.                            |

There is no Azure integration in the terminal itself; what links the two is a hook calling a REST endpoint, and that is enough.

## The stages and their gates

```mermaid
flowchart TD
    Terminal[Claude Code terminal — the driver at every stage]
    Persona[Stage 1 — persona plugin<br/>output style + a card picked by birthday]
    Speak[Stage 2 — spoken replies<br/>Azure Speech free tier, generic voice]
    Voice[Stage 3 — character voice<br/>deferred]
    Companion[Stage 4 — companion window<br/>deferred]
    Gate2{Still switched on after<br/>two weeks of daily use?}
    Gate3{One-command install,<br/>no Python environment?}
    Gate4{Subscription allowed in the SDK,<br/>or an official companion surface?}

    Terminal --> Persona
    Persona --> Speak
    Speak --> Gate2
    Gate2 -- yes --> Gate3
    Gate3 -- yes --> Voice
    Voice --> Gate4
    Gate4 -- yes --> Companion
    Gate2 -- no --> Persona
    Gate3 -- no --> Speak
    Gate4 -- no --> Voice
```

Stages 1 and 2 were built together, because stage 2 is one Pulumi file and one hook. Each later stage opens only when the gate before it answers yes, and the answer is a fact about use or about the platform, never a wish: the [character voice](/docs/infra/deferred/character-voice) waits on an inference engine that installs in one command, and the [companion window](/docs/infra/deferred/companion-window) waits on a platform move. A stage that closes its gate goes back one step, not to zero — the arrows are the whole rollback plan, because every stage adds a file and removes none.

## Not taken

- **Replacing the terminal with a home-built interface** over the Agent SDK: API billing on every turn and a rewrite every time the harness changes shape, against a terminal that costs nothing to keep. The whole plan is built to avoid this.
- **Third-party graphical front-ends**: every one surveyed solves parallel sessions and diff review, which the desktop app now does, and none carries personality.
- **A terseness plugin kept alongside**: two forces on the voice at once is how a persona becomes a long prompt. The previous one was uninstalled and its marketplace entry removed, not just disabled; if terseness is wanted, it is one line in the output style.
- **A published voice plugin for stage 2**: fewer moving parts we do not own, argued on the [spoken replies](/docs/infra/claude-interface/spoken-replies#why-azure-and-not-a-published-plugin) page.

## Notes

- Voice dictation costs one command and spends no tokens; it is the input half of the companion vision, already shipped.
- The one dependency on the platform is the output style, which has been removed and restored once already; if it goes again, the rules text moves into the session-start script beside the card — exactly how the terseness plugin worked — so the fallback is proven.
