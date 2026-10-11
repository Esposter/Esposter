import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The party's stamina: its pool, its refill and what each action costs
export const staminaTopic: ReferenceTopic = {
  investigations: [
    {
      method: "The wiki's Stamina, Sprint, Climbing, Gliding and Swimming pages, read through its API's wikitext",
      outcome: InvestigationOutcome.Found,
      result:
        "The pool starts at 100 and refills at 25 a second once 1.5 seconds pass with no action that costs it. A dash costs 18 and a second of sprint 18, a climb jump 25, a stroke in water 4 by the animation rather than by the second, a swim dash 2 and then 10.2 a second while moving, and a second of glide 3, approximated from player testing. Climbing needs 5 to start and its cost is unknown",
    },
    {
      method:
        "A published study of every action's stamina, each timed or counted against a full pool of 240 (Bilibili av251752644, `captures/bili-av251752644-stamina.mp4`), its slides and subtitles read",
      outcome: InvestigationOutcome.Adopted,
      result:
        "A glide drains 240 in 80 s, 3 a second, confirming the wiki's approximation. A climb costs 1 an action, 240 actions draining the pool, the short female's 0.89 over 270; a climb jump 24, ten draining it whatever the body. A slow swim costs 3.4 a stroke over 70 strokes and a fast one 4 an action, the short female's 2.2. A dash costs 18, a sprint 17 a second, a step's share differing by body, and the refill runs 24 a second after 1.5 s. Where the wiki gives a cost it stands, so the study sets only the climb's: two actions to each second-long ClimbU cycle make 2 a second, which the meter in `yt-hRR2yoP3uY0-world-stamina.mp4` bears out, a climb draining 0.51° of its 54° arc a second against a climb jump's 6 to 7.5°, about 1.9 a second at 25 a jump. A stroke lasts the swim clip's 1.67 s cycle",
    },
  ],
  openQuestions: [
    "Whether a body treading still water strokes, read off a recording of the meter in still deep water; it is charged as stroking, a best estimate on the roadmap's Manual verification list",
  ],
};
