---
title: Anime
description: The Desmos math-art gallery — anime characters drawn entirely from graph expressions.
---

# Anime

The anime page at `/anime` is a full-screen art gallery of characters drawn purely with Desmos graphing-calculator expressions — Frieren, Yui, and Azunyan, each a few hundred parametric curves. A carousel cycles the drawings; clicking the left or right half of a drawing navigates (arrows and delimiters are deliberately hidden so nothing competes with the art).

Each drawing is a tiny component pairing an expressions file with `VisualDesmosDisplayGraph` — the same Desmos display component the dashboard's visual system uses, so the page doubles as its showcase.

## Key files

Paths relative to `packages/app/app`.

| File                             | Role                                        |
| -------------------------------- | ------------------------------------------- |
| `pages/anime.vue`                | carousel + click navigation                 |
| `services/anime/constants.ts`    | the drawing list (async components)         |
| `components/Anime/*.vue`         | one component per character                 |
| `services/anime/*Expressions.ts` | the Desmos expression sets (the actual art) |

## Notes

- Adding a drawing = an expressions file + a 7-line component + a `Drawings` entry; snapshot tests cover each drawing's rendered HTML.
- The area is a finished gallery with no roadmap — it grows when someone makes new art, which is an authoring act, not a feature.
