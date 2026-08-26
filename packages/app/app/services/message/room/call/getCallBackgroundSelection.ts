import type { CallBackground } from "#shared/models/message/call/CallBackground";

// What a slot is called once it is a selection. One settings column holds both kinds of background, and a
// Preset's path can never collide with a slot number, so the two need no tag to tell apart
export const getCallBackgroundSelection = ({ slot }: Pick<CallBackground, "slot">) => String(slot);
