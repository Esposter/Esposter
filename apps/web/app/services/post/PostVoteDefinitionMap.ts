import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// A cast upvote fills in the accent, as any pressed toggle does, and a cast downvote in the danger colour, so the
// Two directions never read alike. Typed rather than inferred, since only a downvote has a variant of its own
export const PostVoteDefinitionMap: Record<
  CreateLikeInput["value"],
  { castVariant?: UiButtonVariant; label: string; meaning: UiIconMeaning }
> = {
  [-1]: { castVariant: UiButtonVariant.Danger, label: "Downvote", meaning: UiIconMeaning.Downvote },
  1: { label: "Upvote", meaning: UiIconMeaning.Upvote },
};
