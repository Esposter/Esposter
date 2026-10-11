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
      outcome: InvestigationOutcome.Superseded,
      result:
        "The clips carry their root's motion, each speed off its start and stop within 0.3% of the average it records: the walk 1.24, the run 5.66 and the sprint 7.22 a second; the dash 8.48 over 1.22 s; the climb 0.84 up; the climb jump 3.36 up over 1.08 s; the swim 1.94 and its dash 3.88; drowning 3 s. These are Mecanim's normalised units, not metres, read again at the body's human scale below",
    },
    {
      method:
        "`pnpm -C scripts genshin:assets locomotion Boy`: the same root read, beside the medium male body's clips",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The medium male body's clips read the same way: the walk 1.33, the run 5.78 and the sprint 7.45 a second; the dash 8.85 over 1.28 s; the climb 0.87 up; the climb jump 3.45 up over 1.08 s; the swim 1.27 and its dash 3.91; drowning 3 s. Normalised units too, read again at the body's human scale below",
    },
    {
      method:
        "The clips' bindings read, then the avatars of the blocks holding characters' body textures exported by AnimeStudio (`--types Avatar`) and each one's `m_Human.m_Scale` read",
      outcome: InvestigationOutcome.Found,
      result:
        "The clips bind Mecanim's muscles, so they are humanoid and move their root in its normalised space, which the game scales by the avatar's human scale, the height of the body's centre in its T-pose. Every character of a body reads the same scale within 0.01%: the medium female 0.927 m (the Traveler, Ayaka, Mona and Furina), the medium male 0.921 (Mika, Kinich and Durin), the tall female 1.061 (Jean, Rosaria, Chasca and Arlecchino), the tall male 1.115 (Neuvillette, Wriothesley, Diluc and Itto) and the short female 0.691 (Sigewinne and Aino); Nod-Krai's rigs read 0.25% over for the medium female and 1.1% for the tall male. Unscaled, the bodies sprint in the reverse of the wiki's order, the short female farthest; scaled, the tall male sprints and dashes farthest, then the tall female and the medium male, the medium female and the short female, the wiki's order, and most cycles' strides land on round lengths, the medium female's run 3.5 m a cycle and the tall male's sprint 4 m",
    },
    {
      method:
        "`pnpm -C scripts genshin:assets locomotion Girl`, which reads each clip's root at the body's human scale off its avatar",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The medium female body in metres: the walk 1.15 m/s, the run 5.25 and the sprint 6.69; the dash 7.86 m/s over 1.22 s, each speed within 0.3% of the average its clip records; the climb 0.78 m/s up; the climb jump 3.11 m up over 1.08 s; the swim 1.8 m/s over a 1.67 s cycle and its dash 3.6; drowning 3 s. The glide's FlyNormal holds its root still, and the jump's root falls 11.1 m over its 1.1 s, so neither moves the body, and both are read off recordings",
    },
    {
      method: "`pnpm -C scripts genshin:assets locomotion Boy`: the same read at the medium male body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The medium male body in metres: the walk 1.23 m/s, the run 5.33 and the sprint 6.86; the dash 8.15 m/s over 1.28 s; the climb 0.8 m/s up; the climb jump 3.18 m up over 1.08 s; the swim 1.17 m/s and its dash 3.6; drowning 3 s. Its glide's FlyNormal and jump move the body as the female's do, so both stay read off recordings",
    },
  ],
  openQuestions: [
    "The jump's height and the fall's gravity, the glide's forward speed and its sink, the plunge's speed, the step, the steepest walkable slope, the wading depth, the glider's height and the slide down ground too steep to stand on, which no clip holds and a recording's motion pass reads",
    "The capsule each body type collides with, read from its character's collider in the exports",
  ],
};
