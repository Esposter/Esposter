import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// How the login interface moves: its clips, what they animate, and the loading's end on the recording
export const motionTopic: ReferenceTopic = {
  investigations: [
    {
      method: "The recording's loading end at 4 frames a second (8 s to 13 s)",
      outcome: InvestigationOutcome.Found,
      result:
        "The bar is full by 8 s, folds over 9 to 9.5 s with its words, and the flight runs on bare until the door rises at 11.75 s; the bar opened at 2.5 s and filled as the recording's own load went, so its pace is loading's, not a floor",
    },
    {
      method: "The properties the page's clips animate",
      outcome: InvestigationOutcome.Found,
      result: "m_Alpha, m_IsActive, m_Color.a, m_AnchoredPosition.x, m_SizeDelta.x and m_SizeDelta.y, by CRC32",
    },
  ],
  openQuestions: ["Each button's hover and pressed states, from the recordings and the page's sprites"],
};
