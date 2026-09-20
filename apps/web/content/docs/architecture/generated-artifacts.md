---
title: Generated artifacts
description: Every file a script writes from another source lives under a generated/ folder in the package that consumes it, one file per entity, committed, cleared and rewritten by its generator and never edited by hand — and an authored file never holds a generated value, so what a person chose and what a tool derived are told apart by path alone.
---

# Generated artifacts

Some files in this repository are written by a script from a source outside it — a map editor's file, the game's data and audio, the speech catalogue. They are code the repository depends on and did not author, and the standard here is one rule about where such a file lives and one about what it may share a file with.

## Where one lives

**Under a `generated/` folder in the package that consumes it, in a sub-folder named for the generator, one file per entity.** The folder name is the whole marker: no per-file header, no `.generated` suffix, no comment saying who wrote it. A reader who sees `generated/` in the path knows the file is an output, and a reader who does not sees an authored file.

| Generator                                  | Writes                                                                                   | Consumer              |
| :----------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------- |
| `pnpm tiled:gen`                           | `apps/web/shared/generated/tiled/` — enums and typed properties per map                  | the dungeons game     |
| `pnpm phaser:gen`                          | `apps/web/shared/generated/phaser/` — the asset key enum and manifest                    | the dungeons game     |
| `pnpm ai:voice-match:reference` and `bank` | `scripts/src/generated/voiceMatch/` — one profile per character and per voice            | `ai:voice-match:rank` |
| `pnpm ai:voice-match:rank --write`         | `packages/genshin-persona/src/generated/personaVoices/` — one voice module per character | the persona plugin    |

One file per entity because that is how the consumer reads them — a session that needs one character's voice loads one module, exactly as it loads one card — and because a re-run then changes only the entities whose numbers moved, so the diff a review reads is the change itself rather than a rewrite of one table.

**Committed, because the consumer must not need the generator's inputs.** The voice map is read on every spoken reply, by a plugin copy installed on a machine with no game and no speech key; the tiled types are what the game is type-checked against. A generated file that only existed after a local run would make every consumer's build depend on a source the repository does not hold.

## What one never does

**It is never edited by hand.** A wrong value is a wrong generator or a wrong input, and the fix goes there and is re-run — an edit in the output is overwritten by the next run without a trace. Each generator treats its folder as the run's whole output: it clears the folder and writes it again, so an entity the source no longer holds leaves no stale file behind, and nothing has to know what the previous run wrote.

**An authored file never holds a generated value, and a generated file never holds an authored one.** The persona card is the person's — how the character speaks, in our words, and the voice someone listened to and chose; the measured voice the benchmark computes for the same character is a generated module beside it. When both exist the precedence is resolved in code, never by copying one value into the other's file:

```mermaid
flowchart LR
    Source["A source outside the repo<br/>game data, audio, a catalogue"]
    Generator["A generator script<br/>clears its folder, writes it again"]
    Generated["generated/&lt;generator&gt;/<br/>one file per entity, committed"]
    Authored["An authored file<br/>what a person chose"]
    Consumer["The consumer<br/>precedence resolved in code"]

    Source --> Generator --> Generated --> Consumer
    Authored --> Consumer
```

The plugin reads a character's voice through one function: the card's voice where the ear wrote one, else the generated module's, else the configured default. Deleting a card's voice restores the measurement; regenerating the measurement never touches a card.

## Formatting and lint

A generated `.ts` is source and is formatted as source — the generator emits the formatter's own shape so that `pnpm format` leaves it alone, and a generator whose output the formatter rewrites is fixed at the generator. A generated `.json` holding numeric arrays is on the formatter's ignore list, since one number per line would turn a few hundred profiles into hundreds of thousands of lines for nothing a reader gains.

## Key files

| File                                                          | Role                                           |
| :------------------------------------------------------------ | :--------------------------------------------- |
| `apps/web/scripts/tiled/index.ts`                             | The map generator                              |
| `apps/web/scripts/phaser/index.ts`                            | The asset generator                            |
| `scripts/src/voiceMatch/rank/index.ts`                        | Clears and rewrites the plugin's voice modules |
| `scripts/src/services/voiceMatch/writeGeneratedJson.ts`       | One profile to one file                        |
| `packages/genshin-persona/src/services/readPersonaModule.ts`  | Loads one character's card or voice by path    |
| `packages/genshin-persona/src/services/readCharacterVoice.ts` | The authored voice over the generated one      |
| `.oxfmtrc.json`                                               | The formatter's ignore list                    |
