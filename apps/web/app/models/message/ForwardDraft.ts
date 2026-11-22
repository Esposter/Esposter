import type { ForwardMessageInput } from "#shared/models/db/message/ForwardMessageInput";

// What a forward sends from its panel: the note it carries, and the rooms it is sent to
export type ForwardDraft = Pick<ForwardMessageInput, "message" | "roomIds">;
