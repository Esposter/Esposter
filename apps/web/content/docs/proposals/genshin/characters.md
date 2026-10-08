---
title: Characters
description: Proposal — the game's characters in the world from HoYoverse's official MMD models, hosted in the app's own Blob Storage beside the terms bundled with each, credited to miHoYo and never put to commercial use. Our own reader, toon material and outline draw each, and a character stands in the world in place of the free camera's ground point.
model: claude-opus-5-5
---

# Characters

This page builds on [exploring](/docs/proposals/genshin/exploring), whose free camera a character replaces, and the engine's toon materials and outlines. HoYoverse publishes MMD models of its characters for fans, so the world can show the game's own characters without our drawing them and without anything taken from the game's files.

## Decisions

- **The official models are hosted, in Blob Storage.** Each character's official model pack, its PMX and textures, is uploaded to the app's own Blob Storage and served from there, never committed to the repository: a pack runs to tens of megabytes, which every clone would carry for good, and Blob Storage is already how the app serves its media ([Azure services](/docs/architecture/azure-services)). Hosting them is the user's decision, taken knowing the terms bundled with each model forbid redistribution (二次配布) as fan sites reproduce them.
- **Each model keeps its own terms beside it.** The terms text bundled with a model is uploaded with it and shown wherever the model is chosen, since the wording varies slightly by character and only the bundled copy is the model's own. The credit the terms carry, the copyright being miHoYo's, is shown with it.
- **Within what the terms forbid otherwise.** No commercial use of the models, and none of the uses the terms list (adult, extreme religious, gore, personal attacks), which the platform's own rules already forbid.
- **Everything else that ships is ours.** The PMX and texture reading, the toon material, the outline and the posing are our code in the engine; the model's data is read at run time from Blob Storage.
- **The character stands where the camera's ground point stood.** It is placed on the ground query exploring adds and faces the camera's heading. Its motion is fitted to the game's own locomotion clips in the [recreation passes](/docs/proposals/genshin/recreation-passes)' motion pass, so only the fitted parameters ship, never a motion file; walking, running and the follow camera are the character controller's, the next play feature's page.

## How it works

```mermaid
flowchart LR
  OFF[HoYoverse's official model pack] -->|uploaded once| BLOB[The app's Blob Storage, with its bundled terms]
  BLOB -->|fetched when chosen| READ[PMX and textures read in the browser]
  READ --> DRAW[Our toon material and outline]
  GQ[Exploring's ground query] --> DRAW
  DRAW --> WORLD[The character in the world]
  BLOB --> TERMS[Its terms and credit shown where it is chosen]
```

## Scope

**Today:** nothing stands in the world; exploring's free camera is the only presence.

**This adds:**

1. **The model's reading**, PMX and its textures, in the engine.
2. **The hosted packs**, each uploaded with its bundled terms, and the terms and credit shown where a character is chosen.
3. **The character in the world**, on the toon material and outline, standing at the ground point.

## Not yet

- **Walking, running and the follow camera**, which the character controller's page adds once a character stands.

## Sources

- The terms bundled with each official model, read secondhand so far from fan sites reproducing them (3dnchu.com, fnoji.com); each pack's own terms file is read when it is uploaded.
