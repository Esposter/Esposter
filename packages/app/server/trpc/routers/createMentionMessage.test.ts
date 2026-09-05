import { MENTION_ID_ATTRIBUTE, MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "@esposter/shared";
import { describe } from "vitest";

// The message body a mention fan-out reads: the span the editor emits, which the server parses for the ids it
// Notifies. Written from the attribute constants rather than a pasted literal, so a suite can never assert an
// Html shape the editor has stopped producing
export const createMentionMessage = (userId: string) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${userId}"></span>`;

describe.todo("createMentionMessage");
