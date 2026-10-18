# Characters

This page builds on [characters](../../specs/genshin/characters/README.md) as built: the engine reads a character's official model pack, draws it at rest in the game's character shader at its holder's origin, and holds it on the [character controller](../../specs/genshin/character-controller/design.md)'s body, which it stands and faces with. What is left is the character's motion, its scale and where its terms are shown.

## Decisions

- **Its motion is fitted to the game's own locomotion clips** in the [recreation passes](../genshin-recreation-passes/design.md)' motion pass, so only the fitted parameters ship, never a motion file. How far and how fast the body moves is the controller's, and how it is seen is the [follow camera](../../specs/genshin/follow-camera/design.md)'s.
- **Its scale is the game's.** MMD's unit stands at the community's reckoning of eight centimetres until the game's own model of the character measures it: that model's height in the exports over the PMX's height in units.
- **The Traveler is fitted first.** The world plays the Traveler (`TRAVELER_CHARACTER_ID`, 10000007, the medium female body), whose `Ani_Avatar_Girl_` clips the controller already reads for its speeds, so its standing, walk, run and sprint cycles in `00/00035183.blk` are the first clips the motion pass fits.
- **Its terms are shown beside the character the Character screen shows.** The terms view already shows a pack's terms with their credit; the loader at the Character screen's foot mounts it beside the character, in place of the dialog its button opened. Party Setup has no chosen character, so the party's screens take no part.

## How it works

```mermaid
flowchart LR
  CLIPS["The game's locomotion clips, decoded by clips"] --> FIT["The motion pass: each bone's track fitted"]
  PACK["The pack's skeleton"] --> FIT
  FIT --> PARAMETERS["Fitted parameters, beside the character's data"]
  BODY["The controller's body: place, facing, state"] --> POSE["The model posed each frame"]
  PARAMETERS --> POSE
  POSE --> WORLD["The character in the world"]
```

## Scope

**Today:** a character's model is drawn at rest at its holder's origin, at MMD's reckoned scale, held by the controller's body in Windrise's scene (`World/Windrise/Index.vue`), so it stands and faces where the body does, and nothing poses it.

**This adds:**

```text
packages/genshin-world/src/components/Character/Model/Index.reference.ts
```

1. **The Traveler's locomotion clips decoded**, the motion pass's first input.
   - `scripts/src/models/genshinAssets/shared/DerivedAssetComponent.ts` gains `Traveler = "traveler"`, and `DerivedAssetComponentMap` its entry: `clipPattern: "^Ani_Avatar_Girl_(Standby|WalkCycle|RunCycle|SprintCycle)$"`, `roots: []` and `screen: "WorldScreen"`, with a comment naming the clips' block, `00/00035183.blk` in the asset index. `DerivedAssetLandmarkMap` takes an empty `Traveler` entry, since it holds one for every component.
   - Run `pnpm -C scripts genshin:assets clips traveler` with the game closed. It prints each clip's seconds and, for each curve, the bone path it animates and its range.
   - Write `Index.reference.ts` in the shape of `World/Character/Locomotion.reference.ts`: the four clips with their block and seconds, the bone paths their curves move, which is the skeleton the fit maps the pack's bones onto, and the run that read them.
   - The entry is data and the printout is its proof, so no unit test is owed.
2. **Its motion.** The motion pass reads the character's locomotion clips, exported from the game's blocks under `~/Esposter/genshin-parity/extracted/` and decoded by `genshin:assets clips` once the character's component names their pattern, and the pack's model. It writes the fitted parameters as data beside the character's in `genshin-world`. Each bone's track is judged against its clip's, as the motion pass judges any track. It goes to the [compute queue](../genshin-roadmap/tasks.md) once its inputs are named (below), and reads the Traveler's official pack, which the user has extracted under `~/Esposter/character-packs/extracted/10000007/`.
3. **Its scale**, measured from the game's own model of the character, replacing MMD's reckoned unit. The Traveler's model prefab is `Avatar_Girl_Sword_PlayerGirl_Model`, whose Animator the asset index places in `00/02666572.blk`. It is the body `PlayerGirl`'s entry in `DerivedAssetComponentMap` already roots, so the Traveler reads that root rather than a second component's, and the scale needs the pack's height as well.
4. **Its terms beside the character**, shown by the Character screen's loader without a button, and the loader's terms button and dialog removed.

## Open questions

- **What the fitted parameters are.** A clip fitted as each bone's rotation over a loop of a few samples, or as a few gait parameters per state that a pose is computed from; the motion pass's measure decides which ships.

## Sources

- Each official model's bundled terms, as the [characters](../../specs/genshin/characters/README.md) page cites them.
