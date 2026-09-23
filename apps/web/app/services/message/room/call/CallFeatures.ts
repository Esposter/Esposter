// @unocss-include
import type { CallFeature } from "@/models/message/room/call/CallFeature";

export const CallFeatures: CallFeature[] = [
  {
    description: "Present tabs, windows, or your display in the call.",
    icon: "i-mdi:monitor-share",
    title: "Share your screen",
  },
  {
    description: "Switch microphone, speakers, and camera while connected.",
    icon: "i-mdi:cellphone-link",
    title: "Choose devices",
  },
  {
    description: "Copy the call link and send it to anyone joining.",
    icon: "i-mdi:link-variant",
    title: "Invite with a link",
  },
];
