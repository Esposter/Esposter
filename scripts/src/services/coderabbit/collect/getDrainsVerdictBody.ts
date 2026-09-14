import { getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";

// The one comment shape a review's body-only findings are answered in, whichever half of the answer it carries:
// The rejections the drain wrote, posted the moment it ends, or the commits that fixed the rest, posted once the
// Window lands. Both carry the marker `getOpenBodyReviewId` closes the review on.
export const getDrainsVerdictBody = (reviewId: number, verb: string, lines: string[]): string =>
  `${getMarker(DRAINS_MARKER, reviewId)}\nBody-only findings of review ${reviewId} are ${verb}:\n${lines.join("\n")}`;
