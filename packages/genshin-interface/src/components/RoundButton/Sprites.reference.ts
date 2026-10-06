import type { ReferenceTopic } from "#src/models/reference/ReferenceTopic";

import { InvestigationOutcome } from "#src/models/reference/InvestigationOutcome";

// The round button's sprites: its disc, rim and shadow, and each glyph centred on its ink
export const spritesTopic: ReferenceTopic = {
  investigations: [
    {
      method: "Why the spanner, the calendar and the exit glyph sat off the button's middle",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Every icon's sprite is trimmed to its ink and centred in its own box, so the game centres each glyph on its button; the traces were up to 2.6 units off, set by their crops, and are centred on their ink's box by InterfaceIconCentreMap",
    },
    {
      method: "Which sprites draw the round button",
      outcome: InvestigationOutcome.Found,
      result:
        "UI_BtnFrame_W52 is the disc (80 by 80 with a 78 unit ink), with UI_BtnFrame_W52_Outline and UI_BtnFrame_W52_Shadow (100 by 100) its rim and shadow",
    },
  ],
  openQuestions: [
    "Each glyph re-traced from its sprite, enlarged, in place of the recording's crop",
    "The disc, rim and shadow's colours and sizes checked against their sprites",
    "The hover and pressed states, from the recordings and the button's sprites",
  ],
};
