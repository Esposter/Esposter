import { CallVirtualBackground } from "@/models/message/room/call/CallVirtualBackground";
import { CallVirtualBackgroundUrlMap } from "@/services/message/room/call/CallVirtualBackgroundUrlMap";

export const CallVirtualBackgroundDefinitions = [
  { id: "", title: "None", url: "" },
  ...Object.values(CallVirtualBackground).map((id) => ({ id, title: id, url: CallVirtualBackgroundUrlMap[id] })),
];
