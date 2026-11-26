import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

// A cast vote takes its direction's variant, the accent for an upvote and the danger colour for a downvote, so the two
// Are drawn by the same surface and differ only in colour. Typed so that a direction cannot leave its variant out
export const PostVoteDefinitionMap: Record<
  CreateLikeInput["value"],
  { castVariant: UiButtonVariant; label: string; meaning: UiIconMeaning }
> = {
  [-1]: { castVariant: UiButtonVariant.Danger, label: "Downvote", meaning: UiIconMeaning.Downvote },
  1: { castVariant: UiButtonVariant.Accent, label: "Upvote", meaning: UiIconMeaning.Upvote },
};
