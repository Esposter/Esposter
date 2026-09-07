import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";

// The outlined icon is the same name suffixed, so only the filled one is named here
export const PostVoteDefinitionMap = {
  [-1]: { activeColor: "error", icon: "mdi-arrow-down-bold" },
  1: { activeColor: "primary", icon: "mdi-arrow-up-bold" },
} as const satisfies Record<CreateLikeInput["value"], { activeColor: string; icon: string }>;
