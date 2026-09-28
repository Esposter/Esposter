import type { SessionChild } from "#src/models/window/SessionChild";

// The forwarded command a reply answers, taken off the window's waiting list so it settles once
export const takeChildReply = (
  { pendingReplyMap }: SessionChild,
  commandId: string,
): PromiseWithResolvers<string> | undefined => {
  const reply = pendingReplyMap.get(commandId);
  pendingReplyMap.delete(commandId);
  return reply;
};
