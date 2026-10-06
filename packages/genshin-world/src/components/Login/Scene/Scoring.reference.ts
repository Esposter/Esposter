import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// How the login's frames are scored and ranked: the loss tables, the stand-ins' gaps and the light rows' ceilings
export const scoringTopic: ReferenceTopic = {
  investigations: [
    {
      method: "genshin:parity attribute over dawn, dusk and night at (0, 5, 75), heading 0, pitch 3, Build_All witness",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Rows within noise of each other: a loss table priced at a pose that fits nothing means nothing, and a recording is too soft to tell a stand-in from its export, so the tool was retired for genshin:parity rank",
    },
    {
      method:
        "genshin:parity compare --witness login at every hour beside compare, then rank's second table (readStandInGains)",
      outcome: InvestigationOutcome.Found,
      result:
        "Drawing the exports in place of every stand-in moves the title frames' FLIP by under 0.01 and the day's the wrong way, so every stand-in term of the frame's ranking read near nothing: a soft recording, light we miss and parts a few pixels off hide what a stand-in lacks. Scored against the exports at the same frame instead, the towers are the largest stand-in gap at every hour, a tenth of the frame's FLIP",
    },
    {
      method:
        "rank on the dawn title, the day title and the door recording with the silhouettes' error split, then overlay on the dawn and the day",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The silhouettes' term was the error either side of them: a silhouette pixel's error averages 0.51 at dawn, the turned-away middle towers' 0.53. Split into the exports' mean error over the pixels within four of it off every silhouette and the excess over that, placement and pose read 0.0034 at dawn, 0.0035 by day and 0.0043 on the door recording, where the whole term read 0.074 to 0.107, so a part a pixel or two off is no longer the largest term. A part a dozen pixels off is charged to the light rows over its area: overlay shows the dawn's left tower standing out into the sky past the recording's",
    },
    {
      method:
        "A scratch mask of each reference's sky, a colour and contrast histogram learnt off our own layout, read per part against the witness's part target on the dawn title and the door recording",
      outcome: InvestigationOutcome.Rejected,
      result:
        "A mask of the reference's sky by its colour and its grain over five pixels, learnt from the pixels at least six from our own parts' outline, reads the dawn's cloud sea and haze as stone, the two sharing colour and grain (IoU 0.65 with ours). On the door recording its upper sky holds: the middle towers stand a few to fifteen pixels off the recording's each, in no one direction, so each tower's place is off rather than the row's or the pose. Not kept, the cloud sea leaving it no measure to solve on",
    },
    {
      method:
        "A scratch oracle over the exports' frame of login-dawn-title, each binning's per-channel gain applied and FLIP scored again, promoted as rank's third table (readLightCeilings)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The exports' dawn frame corrected to the recording's own colour, channel by channel, over every part pixel of a bin and scored again: by rank's bins it falls 0.002, by depth in eight bands, facing in six and how far a face turns up in three 0.010, by each part and its facing 0.016, but the same bins split by twelve rows 0.062 and a smooth field over four pixels 0.127; the albedo's tone split nothing more and the columns 0.017. So no light over depth and facing, the reflection pass's probes, the clamp and the highlight among them, could buy over a hundredth there: the light rows' error varies with the row",
    },
  ],
  openQuestions: [],
};
