---
title: Companion window
description: Stage 4 of the Claude interface — a desktop companion that spectates the terminal's hooks and speaks and animates, never driving a session itself, behind a platform gate.
---

# Companion window

**What it was.** A companion on the desktop rather than a terminal. The open-source companion closest to what is imagined is an Electron, Vue and Pinia app under MIT with a Live2D or 3D avatar, speech in and out, and a provider layer that already includes Claude — the same stack as this repository. The catch is the Agent SDK row of the [Claude interface](/docs/infra/claude-interface) survey: it talks to a model through an API key, and so does every SDK or ACP bridge that could put a real Claude Code session behind it, so a companion that drives Claude pays API prices for every turn on top of the subscription the terminal already uses.

The shape that stays cheap is a **spectator**: the terminal keeps driving, and the companion window subscribes to the hooks — the Stop hook for what was said, the notification hook for when attention is needed — and reacts by speaking through the [character voice](/docs/infra/deferred/character-voice) and animating. It holds no session, sends no tokens, and breaks nothing when it is closed. A pane that plays one file at session start — the [burst animation](/docs/proposals/infra/burst-animation) — is smaller than this and waits on none of its gates.

**Why deferred.** It sits behind the character voice, and its own gate is a platform fact nothing here can move.

**Revisit when:** either of two platform moves lands — the subscription becomes permitted for personal SDK or ACP use, or Anthropic ships a companion or avatar surface of its own. Until then the desktop app is the visual shell, and it already runs the persona plugin unchanged.
