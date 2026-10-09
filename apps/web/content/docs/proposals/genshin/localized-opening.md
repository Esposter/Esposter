---
title: Localized opening
description: Proposal — the rest of the opening as each client language's build shows it, the publisher's splash and every layout difference measured off recordings of those clients, chosen by the reader's language like the opening's text and its title logo.
model: claude-opus-5-5
needs: [game-install]
---

# Localized opening

The opening already speaks the reader's language: its words come from [game text](/docs/genshin/game-text) in all fifteen languages, and its [title splash](/docs/genshin/title-splash) draws each language's client's logo. Its other pictures and its layouts do not: the screens are measured off recordings of the English client and one Japanese one, and the Chinese, Japanese and Korean clients may sit their words differently and show their own publisher's logo.

## How it would work

```mermaid
flowchart LR
  Videos["Recordings of each client's opening<br/>Chinese, Japanese, Korean"] --> Frames["genshin:parity frames<br/>splashes, title, door"]
  Frames --> Measure["measure what differs:<br/>the publisher's logo, the text's sizes and wraps"]
  Measure --> Screens["Each screen's layout keyed by language<br/>where it differs, one layout where it does not"]
  Screens --> Visual["A visual suite image per language that differs"]
```

- **Recordings are the references.** A public recording of each client's opening, found before any of the game is recorded by hand, gives the logo, its place and how the screens differ, the way the English and Japanese recordings already do ([parity](/docs/genshin/parity)).
- **A layout differs only where a recording shows it.** Every language reuses the English measures unless its own recording differs, and the visual suite gains an image only for a language that does.
- **The opening already knows the language.** It takes the reader's language for the title splash, so a screen whose layout differs reads the same prop.
- **A localized reference is compared in its client's words.** A reference naming a `language` in its props has the parity page load that language's text for the screen ([parity](/docs/genshin/parity)). The mainland's health notice, 7 to 12 seconds into its launch recording (`captures/bili-av532052219.mp4`, its logo at 3 to 6 seconds and its door at 12 to 17), is the reference `health-notice-mainland`, already compared in its own words (its row in the parity reference snapshot).

## Scope

- The publisher splash where a client shows a different publisher's logo.
- The health notice and login screen's layout where a recording shows a difference.
- The mainland's door with its prompt. Its reference `login-interface-door-mainland` is registered at 15.5 seconds, the first of the 12 to 17 second stills with the prompt whole, and its whole-frame compare waits in the [roadmap](/docs/genshin/roadmap)'s compute queue.
- The Japanese and Korean clients' openings, each waiting on a public recording found of it.

## Key files

| File                                                               | Role after the change                            |
| :----------------------------------------------------------------- | :----------------------------------------------- |
| `packages/genshin-world/src/components/Splash/Publisher/Index.vue` | The publisher's logo per client where it differs |
| `packages/genshin-world/parity/screens.visual.ts`                  | An image per language whose screen differs       |
