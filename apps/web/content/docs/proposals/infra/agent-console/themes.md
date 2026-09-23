---
title: Themes
description: Proposal — what the agent console's theme interface grows beyond the default theme's reactions. The next parts are a palette, the voxel world's rooms, an avatar and a voice. The Genshin theme, built from the persona plugin, is the first to use them.
model: claude-opus-5-5
---

# Themes

The [agent console](/docs/infra/claude-interface/agent-console) already has a theme registry. Today its only theme is the default, and the only part a theme sets is its reactions: the default's is a browser notification for a hidden session. This proposal is the rest of what a theme may set, and the Genshin theme that is the first to set it. Here the hidden-tab notification moves out of the default's reactions and into the console, so every theme gets it.

## What a theme may add

| Part      | What it is                                                                                                                                               | Default theme   |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| Palette   | the colours of the world and its in-game panels                                                                                                          | the world's own |
| Scene     | the rooms and props of the voxel world, receiving the session's events                                                                                   | a bare room     |
| Avatar    | who the session is presented as — a name, a colour, a portrait — read from the session                                                                   | none            |
| Reactions | a map from session event to what the theme does — a pose, a sound, a notification tone — on top of the console's own notification when the tab is hidden | none            |
| Voice     | how the agent's spoken lines are heard                                                                                                                   | none            |

A theme never removes a part of the [voxel surface](/docs/proposals/infra/agent-console/voxel-surface) that [terminal parity](/docs/infra/claude-interface/agent-console/terminal-parity) needs. It may only dress the world and furnish it, which is what keeps a theme cheap to write and impossible to make a downgrade. Each part is added to `AgentConsoleTheme` with the first theme that sets it, never ahead of one.

## The Genshin theme

Built from what the [persona plugin](/docs/infra/claude-interface/persona-plugin) already produces:

- **Avatar** from the session-start hook's output, which the SDK driver already passes through as a hook event. The plugin adds one machine-readable line naming the character, so the theme does not parse prose.
- **Palette** from the character's element.
- **Voice** from the plugin's resident synthesizer, which the theme calls on the loopback with each spoken line it finds in a reply. The terminal's message-display hook has no display to fire on in the console. The theme is the console's one producer of spoken lines: the synthesizer, the [element ambience](/docs/proposals/infra/agent-console/element-ambience) and [spatial chat](/docs/proposals/infra/agent-console/spatial-chat) all take the lines it finds, so no line is synthesized twice.
- **Scene and reactions** from the sub-specs: the [wish banner](/docs/proposals/infra/agent-console/wish-banner), the [voxel atelier](/docs/proposals/infra/agent-console/voxel-atelier), the [element ambience](/docs/proposals/infra/agent-console/element-ambience) and, as an option, [spatial chat](/docs/proposals/infra/agent-console/spatial-chat).

```mermaid
flowchart TD
  E[Session event] --> N[Notification when hidden — every theme]
  E --> TH{Active theme}
  TH -->|default| Q[Nothing more]
  TH -->|Genshin| R{Reaction map}
  R -->|session start| WB[Wish banner, avatar, palette]
  R -->|spoken line in a reply| SY[Resident synthesizer, then ambience]
  R -->|edit, commit, failure| AT[Atelier changes]
  R -->|attention wanted| PO[The figure turns]
```

## Key files

| File                                                                | Role after the change                                          |
| :------------------------------------------------------------------ | :------------------------------------------------------------- |
| `apps/web/app/services/agentConsole/themes/AgentConsoleThemeMap.ts` | The registry the Genshin theme is added to                     |
| `apps/web/app/models/agentConsole/AgentConsoleTheme.ts`             | The theme interface, grown by the parts the Genshin theme sets |
| `packages/genshin-persona/scripts/pick.ts`                          | The session-start hook whose output names the character        |
| `packages/genshin-persona/scripts/speak.ts`                         | The resident synthesizer the Genshin theme speaks through      |

```text
apps/web/app/components/AgentConsole/Theme/Genshin/
```

## Notes

- A theme is chosen per browser and per session: the Genshin theme on one session and the default on a parallel one is a supported state, not an edge case.
- A second persona set — another game, another cast — is another theme reading another plugin's hook line, and nothing in the console changes for it.
