import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";

export const MessageDisplayModeItems = [
  {
    description: "Modern, beautiful, and easy on your eyes.",
    title: MessageDisplayMode.Cozy,
    value: MessageDisplayMode.Cozy,
  },
  {
    description: "Fit more messages on screen at one time.",
    title: MessageDisplayMode.Compact,
    value: MessageDisplayMode.Compact,
  },
] satisfies { description: string; title: string; value: MessageDisplayMode }[];
