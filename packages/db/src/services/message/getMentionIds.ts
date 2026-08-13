import { getMentions, MENTION_ID_ATTRIBUTE } from "@esposter/shared";
// How a mention's id is read out of message html, so a create and an edit can never disagree about it
export const getMentionIds = (message: string): string[] =>
  getMentions(message)
    .map((mention) => mention.getAttribute(MENTION_ID_ATTRIBUTE))
    .filter((id) => id !== undefined);
