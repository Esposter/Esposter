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

- [References](references/design.md): where a screen's images and recordings come from, and how the game is recorded.
- [Tracing](tracing/design.md): a mark traced into the SVG path a component draws.
- [Screens](screens/design.md): a component folder with its fixture, on the parity page and in the suite.
- [Witness](witness/design.md): the game's exports drawn through our scene and priced against the reference.
- [Clean plate](clean-plate/design.md): a reference behind an interface, compared over its scene.
- [Comparison](compare/design.md): the scores, FLIP and the committed report.
- [Light](light/design.md): the stone light solved from a reference.
- [Passes](passes/design.md): a new screen derived in passes, each with its measure.
- [Motion](motion/design.md): motion matched frame by frame.
- [Visual suite](visual-suite/design.md): approved screens held by the browser suite.
- [Costs](costs/design.md): the loop's cost, the benches and the GPU reduction.
- [Commands](commands/design.md): every `genshin:parity` command.

## Shapes come from the game's assets

The interface is rebuilt from screenshots, which its overlay compare holds exactly; a scene's towers, doors and profiles come from the installed game's files. AnimeStudio exports them with the game closed into the references folder, outside the repository like every other reference, and a transform fits our own kits' parameters to them, so only numbers of ours ship ([derived assets](../derived-assets/design.md)).
