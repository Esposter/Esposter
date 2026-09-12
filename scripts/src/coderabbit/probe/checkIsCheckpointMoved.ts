// A checkpoint reading is `<id> <updated_at>` for the bot's most recently touched comment. Comparing the pair
// Rather than the body is what catches an in-place edit: the answer to a probe usually arrives as an edit of
// The walkthrough, which keeps its id and can leave the first line intact, but always moves `updated_at`.
//
// An empty reading is a failed API call, never a new checkpoint. Command substitution discards exit status, so
// The inline form of this loop read a failed call as the reply arriving and stopped waiting.
export const checkIsCheckpointMoved = (before: string, after: string): boolean => Boolean(after) && after !== before;
