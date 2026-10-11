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
        "The medium female body in metres: the walk 1.15 m/s, the run 5.25 and the sprint 6.69; the dash 7.86 m/s over 1.22 s, each speed within 0.3% of the average its clip records; the climb 0.78 m/s up; the climb jump 3.11 m up over 1.08 s; the swim 1.8 m/s over a 1.67 s cycle and its dash 3.6; drowning 3 s. The glide's FlyNormal holds its root still, so it does not move the body and is read off recordings. The jump's root falls 11.1 m between its start and stop over its 1.1 s, a read of its ends alone that the curve's decode below supersedes",
    },
    {
      method: "`pnpm -C scripts genshin:assets locomotion Boy`: the same read at the medium male body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The medium male body in metres: the walk 1.23 m/s, the run 5.33 and the sprint 6.86; the dash 8.15 m/s over 1.28 s; the climb 0.8 m/s up; the climb jump 3.18 m up over 1.08 s; the swim 1.17 m/s and its dash 3.6; drowning 3 s. Its glide's FlyNormal holds its root still as the female's does, so it stays read off recordings, and its jump is the curve's decode below",
    },
    {
      method: "`pnpm -C scripts genshin:assets locomotion Lady`: the same read at the tall female body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The tall female body in metres at its human scale of 1.061: the walk 1.24 m/s, the run 5.68 and the sprint 7.17; the dash 7.89 m/s over 1.4 s, within 0.4% of the average its clip records; the climb 0.84 m/s up; the climb jump 3.3 m up over 1.08 s; the swim 1.95 m/s over a 1.67 s cycle and its dash 3.9; drowning 3 s. Its glide's FlyNormal holds its root still, so it stays read off recordings; its jump's root falls 11.7 m between its start and stop, which the curve's decode below supersedes",
    },
    {
      method: "`pnpm -C scripts genshin:assets locomotion Male`: the same read at the tall male body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The tall male body in metres at its human scale of 1.115: the walk 1.2 m/s, the run 5.74 over a 0.77 s cycle and the sprint 7.5 over 0.53 s; the dash 9.47 m/s over 1.18 s, within 0.5% of the average its clip records; the climb 0.94 m/s up; the climb jump 3.72 m up over 1.08 s; the swim 1.38 m/s and its dash 3.9; drowning 3 s. Its glide's FlyNormal holds its root still, so it stays read off recordings; its jump's root falls 11.7 m between its start and stop, which the curve's decode below supersedes",
    },
    {
      method: "`pnpm -C scripts genshin:assets locomotion Loli`: the same read at the short female body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The short female body in metres at its human scale of 0.691: the walk 0.99 m/s, the run 4.8 and the sprint 6.43; the dash 7.24 m/s over 1.28 s, 1.2% under the average its clip records, the widest gap of any body's; the climb 0.78 m/s up, its ClimbU 0.52 m over a 0.67 s clip where every other body's is a second; the climb jump 3.01 m up over 1.08 s; the swim 1.8 m/s and its dash 3.6 over a 0.53 s clip; drowning 3 s. Its glide's FlyNormal holds its root still, so it stays read off recordings; its jump's root falls 10.8 m between its start and stop over its 1.08 s, which the curve's decode below supersedes",
    },
    {
      method:
        "Each body's Jump, JumpForRunL and SwimJumpDrop clips exported by AnimeStudio as JSON, their ACL tracks decoded by ACL's own decompressor with the clip's database passed as its streamer (the database's bulk data, after its 88-byte header), and the root's MotionT curve read at the body's human scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The jump's root does move the body: it rises to an apex and falls back through its take-off height, then on through the clip's end, which is where the earlier read's 11 m fall came from. The medium female's apex is 1.09 m at 0.25 s, back at its take-off height at 0.48 s; the medium male's 1.15 m and 0.48 s, the tall female's 1.28 and 0.51, the tall male's 1.22 and 0.45, the short female's 1.07 and 0.45. Its rise and its fall each differ by up to a fifth from one parabola, so the gravity taken is the one returning the body at the clip's time: 37.5, 39.8, 40, 48.5 and 42.9 m/s². Its fall then settles at 21 m/s for the medium female, 20.9 for the medium male, 21.3 for the tall female and 18 for the tall male and the short female, the speed the fall tops out at; SwimJumpDrop falls at a steady 20 to 23. A run's jump peaks within 0.15 m of the standing one's. AnimeStudio's own decode passes no streamer, so its export reads a clip's scalar tracks, the root's among them, as noise",
    },
    {
      method:
        "The community dump's ConfigAvatar files of twenty characters compared field by field, and each body's avatar's T-pose composed down its human skeleton to its head bone",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Two obfuscated fields under GKHILJFNBBO alone differ by character, both a height: INEGOFOEJIA reads Ayaka 1.56, Mika 1.62, Jean 1.73, Neuvillette 1.86 and Sigewinne 1.34 (Klee 1.27, Diluc 1.85), each standing 0.26 to 0.34 m over its avatar's head bone (1.29, 1.31, 1.47, 1.57 and 1.0 m), a head's height, so it is the character's height, and each body's capsule stands as tall as its avatar's character. No field gives a collider's radius by body",
    },
    {
      method:
        "A published clip timing a glide, a glide with the Red Feather Fan and the tall male's sprint along one Mondstadt street, from its fountain to its gate (YouTube kyXg-Hx3Xlo, `captures/yt-kyXg-Hx3Xlo-glide-compare.mp4`), its on-screen timer read in seconds and frames at 60 a second",
      outcome: InvestigationOutcome.Found,
      result:
        "The sprint covers the street in 11.9 s, the glide in 15.0 s and the fan's glide in 13.7 s; the glide lands about 10.5 s in and the fan's about 13, each running the rest, and the glides start off a height the sprint does not. So a glide is slower than a sprint, but the clip gives no distance to measure it by: the forward speed is taken as 6 m/s, the tall male's dash and sprint over the glide's time, a best estimate",
    },
  ],
  openQuestions: [
    "The glide's forward speed and its sink, the glider's height, the plunge's speed, the step, the steepest walkable slope, the capsule's radius, the wading depth's share of the body's height and the slide down ground too steep to stand on, which no clip or field holds, each a best estimate on the roadmap's Manual verification list until a recording's motion pass reads it",
  ],
};
