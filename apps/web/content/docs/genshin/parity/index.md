---
title: Parity
description: How a screen is made to match the game's. The references are the wiki's images and recordings of the installed game, kept outside the repository. A glyph is traced from the game's own mark at full resolution. A screen renders without Nuxt on the world package's parity page, where one command shoots it at the reference's size and scores the difference cell by cell. Motion is matched frame by frame against sampled recordings. Every approved screen is held by a visual suite whose images live beside the components.
---

# Parity

The Genshin area recreates the game's own screens, so "does it look right" has an exact answer: the game. Parity is the loop that asks it. It is built for an agent, which reads images but drives no browser of its own: every step is one command that prints numbers and writes an image the agent reads. The user's eye stays the final check. The loop is fast enough that nobody has to wait on that check.

## How it works

```mermaid
flowchart TD
  WIKI[Wiki images and animations] --> FETCH[fetch / frames]
  GAME[The installed game: the user plays, the tool records] --> CAP[still / record]
  CAP --> FRAMES[frames: fixed-rate stills and a contact sheet]
  FETCH --> REF[(References, outside the repository)]
  FRAMES --> REF
  REF --> TRACE[trace: a mark as one SVG path, full resolution]
  TRACE --> SCREEN[Screen component and its fixture, in the world package]
  REF --> MEASURE[measure / zoom: colours, sizes, positions]
  MEASURE --> SCREEN
  SCREEN --> PAGE[Parity page on Vite, no Nuxt]
  PAGE --> COMPARE{compare: reference, ours, difference, and a score per cell}
  REF --> COMPARE
  COMPARE -->|off| SCREEN
  COMPARE -->|matches| VISUAL[Visual suite: our own image, committed beside the component]
```

## The pieces

- [References](/docs/genshin/parity/references): where a screen's images and recordings come from, and how the game is recorded.
- [Tracing](/docs/genshin/parity/tracing): a mark traced into the SVG path a component draws.
- [Screens](/docs/genshin/parity/screens): a component folder with its fixture, on the parity page and in the suite.
- [Witness](/docs/genshin/parity/witness): the game's exports drawn through our scene and priced against the reference.
- [Clean plate](/docs/genshin/parity/clean-plate): a reference behind an interface, compared over its scene.
- [Comparison](/docs/genshin/parity/compare): the scores, FLIP and the committed report.
- [Light](/docs/genshin/parity/light): the stone light solved from a reference.
- [Passes](/docs/genshin/parity/passes): a new screen derived in passes, each with its measure.
- [Motion](/docs/genshin/parity/motion): motion matched frame by frame.
- [Visual suite](/docs/genshin/parity/visual-suite): approved screens held by the browser suite.
- [Costs](/docs/genshin/parity/costs): the loop's cost, the benches and the GPU reduction.
- [Commands](/docs/genshin/parity/commands): every `genshin:parity` command.

## Shapes come from the game's assets

The interface is rebuilt from screenshots, which its overlay compare holds exactly; a scene's towers, doors and profiles come from the installed game's files. AnimeStudio exports them with the game closed into the references folder, outside the repository like every other reference, and a transform fits our own kits' parameters to them, so only numbers of ours ship ([derived assets](/docs/genshin/derived-assets)).
