import type { ComponentReference } from "genshin-interface";

import { locomotionTopic } from "#src/components/World/Character/Locomotion.reference";
import { staminaTopic } from "#src/components/World/Character/Stamina.reference";
import { GameSourceKind } from "genshin-interface";

// The character's movement in the game's data and its recordings, and its topics, each with what every investigation
// Found and what is still open. A body type's clips are named Ani_Avatar_<body>_<action>, its body Girl, Boy, Lady,
// Male or Loli
export const reference: ComponentReference = {
  sources: {
    assetIndex: {
      kind: GameSourceKind.DataTable,
      name: "The asset index AnimeStudio's map is read into, every asset's name, type, block and path ID",
      role: "Which blocks hold a body type's locomotion clips",
      table: "extracted/maps/index.tsv, in the parity directory",
    },
    mediumFemaleClips: {
      block: "00/04161624.blk, 00/04523043.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_Avatar_Girl_WalkCycle, RunCycle, SprintCycle, SprintBS, Jump, ClimbU, ClimbDashU, SwimF, SwimDash, SwimDie, FlyNormal",
      role: "The medium female body's walk, run, sprint, dash, jump, climb, climb jump, swim, swim dash, drowning and glide, whose root motion the body's speeds are read off",
    },
  },
  topics: { locomotion: locomotionTopic, stamina: staminaTopic },
};
