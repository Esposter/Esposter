---
title: Anime
description: The Desmos math-art gallery — anime characters drawn entirely from graph expressions.
---

# Anime

The anime page at `/anime` is a full-screen art gallery of characters drawn purely with Desmos graphing-calculator expressions — Frieren, Yui, and Azunyan, each a few hundred parametric curves. One drawing shows at a time and fades into the next; the previous and next buttons sit at the screen's edges and an Animate button replays the drawing curve by curve, with no delimiters so nothing else competes with the art. A drawing left stays alive, so returning to it builds no second calculator.

Each drawing is a tiny component pairing an expressions file with `VisualDesmosDisplayGraph` — the same Desmos display component the dashboard's visual system uses, so the page doubles as its showcase.

## Key files

Paths relative to `apps/web/app`.

| File                             | Role                                        |
| -------------------------------- | ------------------------------------------- |
| `pages/anime.vue`                | the page                                    |
| `components/Anime/Carousel.vue`  | one drawing at a time + its navigation      |
| `services/anime/constants.ts`    | the drawing list (async components)         |
| `components/Anime/*.vue`         | one component per character                 |
| `services/anime/*Expressions.ts` | the Desmos expression sets (the actual art) |

## Notes

- Adding a drawing is an expressions file, a component thin enough to be all boilerplate, and a `DRAWINGS` entry.
- The area is a finished gallery with no roadmap — it grows when someone makes new art, which is an authoring act, not a feature.
