import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";

export const getOptionIdVoteCountMap = (votes: PollMessageContent["votes"]) => {
  const optionIdVoteCountMap = new Map<string, number>();
  for (const optionId of Object.values(votes))
    optionIdVoteCountMap.set(optionId, (optionIdVoteCountMap.get(optionId) ?? 0) + 1);
  return optionIdVoteCountMap;
};
