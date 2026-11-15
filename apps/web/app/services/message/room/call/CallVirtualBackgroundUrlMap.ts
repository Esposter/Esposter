import aurora from "#src/assets/message/room/call/backgrounds/aurora.svg";
import forest from "#src/assets/message/room/call/backgrounds/forest.svg";
import studio from "#src/assets/message/room/call/backgrounds/studio.svg";
import sunrise from "#src/assets/message/room/call/backgrounds/sunrise.svg";
import { CallVirtualBackground } from "#src/models/message/room/call/CallVirtualBackground";

// Typed over every member, so a preset added to the enum without its file is a type error rather than a missing picture
export const CallVirtualBackgroundUrlMap = {
  [CallVirtualBackground.Aurora]: aurora,
  [CallVirtualBackground.Forest]: forest,
  [CallVirtualBackground.Studio]: studio,
  [CallVirtualBackground.Sunrise]: sunrise,
} as const satisfies Record<CallVirtualBackground, string>;
