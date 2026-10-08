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
    {
      method:
        "`pnpm -C scripts genshin:assets locomotion Girl`: each clip's root read off where it starts and stops over the clip's span, beside the average speed the clip records",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The clips carry their root's motion, each speed off its start and stop within 0.3% of the average it records: the walk 1.24 m/s, the run 5.66 and the sprint 7.22; the sprint's start, the dash, 8.48 m/s over 1.22 s; the climb 0.84 m/s up; the climb jump 3.36 m up over 1.08 s; the swim 1.94 m/s over a 1.67 s cycle and its dash 3.88; drowning 3 s. The glide's FlyNormal holds its root still, and the jump's root falls 12 m over its 1.1 s, so neither moves the body, and both are read off recordings",
    },
  ],
  openQuestions: [
    "The jump's height and the fall's gravity, the glide's forward speed and its sink, the plunge's speed, the step, the steepest walkable slope, the wading depth, the glider's height and the slide down ground too steep to stand on, which no clip holds and a recording's motion pass reads",
    "The capsule each body type collides with, read from its character's collider in the exports",
  ],
};
