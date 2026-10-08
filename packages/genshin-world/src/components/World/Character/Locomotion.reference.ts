import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// How the body moves: its speeds, heights, thresholds and capsule, per body type
export const locomotionTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The asset index searched for AnimationClip names holding Girl, then for those of no weapon or character with a locomotion action in their name",
      outcome: InvestigationOutcome.Found,
      result:
        "Every body type's movement is its own clip set, Ani_Avatar_<body>_<action>: the medium female body's walk, run and sprint cycles, the sprint's start, the jump, the climb and its dash, the swim and its dash, drowning and the glide sit in two blocks, beside clips for uphill and downhill runs, stops and the jumps a run or a sprint starts. A weapon's and a character's own clips are named with them",
    },
  ],
  openQuestions: [
    "Whether the clips carry root motion, which `genshin:assets locomotion` reads off each clip's start and stop and the average speed it records",
    "The jump's height and the fall's gravity, the glide's sink, the plunge's speed, the step, the steepest walkable slope, the wading depth, the glider's height and the slide down ground too steep to stand on, which no clip holds and a recording's motion pass reads",
    "The capsule each body type collides with, read from its character's collider in the exports",
  ],
};
