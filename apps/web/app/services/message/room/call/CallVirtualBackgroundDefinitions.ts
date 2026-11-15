import { CallVirtualBackground } from "#src/models/message/room/call/CallVirtualBackground";
import { CallVirtualBackgroundUrlMap } from "#src/services/message/room/call/CallVirtualBackgroundUrlMap";

export const CallVirtualBackgroundDefinitions = [
  { id: "", title: "None", url: "" },
  ...Object.values(CallVirtualBackground).map((id) => ({ id, title: id, url: CallVirtualBackgroundUrlMap[id] })),
];
