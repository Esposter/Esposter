import type { ComponentReference } from "genshin-interface";

import { cameraTopic } from "#src/components/World/Character/Camera.reference";
import { locomotionTopic } from "#src/components/World/Character/Locomotion.reference";
import { staminaTopic } from "#src/components/World/Character/Stamina.reference";
import { GameSourceKind } from "genshin-interface";

// The character's movement and the camera behind it in the game's data and its recordings, and their topics, each with
// What every investigation found and what is still open. A body type's clips are named Ani_Avatar_<body>_<action>, its
// Body Girl, Boy, Lady, Male or Loli
export const reference: ComponentReference = {
  sources: {
    assetIndex: {
      kind: GameSourceKind.DataTable,
      name: "The asset index AnimeStudio's map is read into, every asset's name, type, block and path ID",
      role: "Which blocks hold a body type's locomotion clips and the camera profile",
      table: "extracted/maps/index.tsv, in the parity directory",
    },
    cameraProfile: {
      block: "00/13980307.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "CameraProfile",
      role: "The play camera's config for each camera module and its global config, whose elevation limits and radii the follow camera's are",
    },
    mediumFemaleClips: {
      block: "00/04161624.blk, 00/04523043.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_Avatar_Girl_WalkCycle, RunCycle, SprintCycle, SprintBS, Jump, ClimbU, ClimbDashU, SwimF, SwimDash, SwimDie, FlyNormal",
      role: "The medium female body's walk, run, sprint, dash, jump, climb, climb jump, swim, swim dash, drowning and glide, whose root motion the body's speeds are read off",
    },
    pickupRecording: {
      capture: "world-pickup.mkv",
      kind: GameSourceKind.Capture,
      name: "A published PC video of picking items up, Chongyun on the field",
      role: "The screen's centre against a medium male body under a camera looking down, for the pivot's share of its height",
    },
    sessionRecording: {
      capture: "session-2.mp4",
      kind: GameSourceKind.Capture,
      name: "The user's 3440 by 1440 session in Mondstadt, Xilonen on the field",
      role: "The screen's centre against a tall female body under a near-level camera, for the pivot's share of its height",
    },
  },
  topics: { camera: cameraTopic, locomotion: locomotionTopic, stamina: staminaTopic },
};
