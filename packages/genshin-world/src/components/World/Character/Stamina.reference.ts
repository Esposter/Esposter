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
  ],
  openQuestions: [
    "A second of climbing's cost, and the glide's own, read off a recording of the meter draining on a wall and in a glide",
    "Whether a body treading still water strokes, read off a recording of the meter in still deep water",
  ],
};
