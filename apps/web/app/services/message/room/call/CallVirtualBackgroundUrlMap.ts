import aurora from "@/assets/message/room/call/backgrounds/aurora.svg?url";
import forest from "@/assets/message/room/call/backgrounds/forest.svg?url";
import studio from "@/assets/message/room/call/backgrounds/studio.svg?url";
import sunrise from "@/assets/message/room/call/backgrounds/sunrise.svg?url";
import { CallVirtualBackground } from "@/models/message/room/call/CallVirtualBackground";

// Typed over every member, so a preset added to the enum without its file is a type error rather than a missing picture
export const CallVirtualBackgroundUrlMap = {
  [CallVirtualBackground.Aurora]: aurora,
  [CallVirtualBackground.Forest]: forest,
  [CallVirtualBackground.Studio]: studio,
  [CallVirtualBackground.Sunrise]: sunrise,
} as const satisfies Record<CallVirtualBackground, string>;
