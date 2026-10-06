import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The recordings of Windrise, the hours they show and the cameras solved on them
export const recordingsTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "YouTube for Windrise ambience, day and night cycles, time lapses and HUD-free footage, frames read at several seconds of each",
      outcome: InvestigationOutcome.Found,
      result:
        "Four fixed-camera recordings with no interface: the statue under the oak through a whole day on the 2026 build, the valley from the south through a whole day on a 2022 build, the oak before the mountain through a day on a 2021 build, and the oak beside Venti by day in 4K on the 2026 build. A painted live wallpaper among the results is not the game's",
    },
    {
      method: "A frame a minute of each 24-minute recording laid out as a contact sheet",
      outcome: InvestigationOutcome.Found,
      result:
        "One real second is one game minute in both whole-day recordings: the statue's opens before dawn and sets its sun near its twelfth minute, the valley's opens near noon and sets near its seventh",
    },
    {
      method:
        "A contact sheet of the recording at its 120th, 360th, 720th and 960th seconds, then genshin:parity pose on five landmarks (the paving stones, the statue's dish and top, the oak's trunk) at its 360th second, refined on the statue's edges, checked by overlay and by blending the witness over the frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The statue recording's camera stands still for the whole day, at 70.818, -4.053, 8.283 round the oak's foot, heading 64.614, pitch 8.047, a vertical field of view of 58.365. Its statue's outline lies within a pixel of the recording's edges and the landmarks' reprojection is 12.75 pixels, the paving stones the most (14 and 21) where grass covers their edges. Refining on the paving's edges too drifts to a 71-degree view that matches other stones and leaves the paving landmarks 125 pixels off",
    },
  ],
  openQuestions: [
    "The other recordings' cameras, solved with landmarks named on the witness, which cross-check the statue recording's field of view, then the parity references at the hours each recording shows",
  ],
};
