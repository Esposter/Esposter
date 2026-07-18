import type { PollMessageContent } from "@/models/message/poll/PollMessageContent";

export const getVoteCountMap = (votes: PollMessageContent["votes"]) => {
  const map = new Map<string, number>();
  for (const optionId of Object.values(votes)) map.set(optionId, (map.get(optionId) ?? 0) + 1);
  return map;
};
