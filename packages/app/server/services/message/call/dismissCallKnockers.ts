import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";

export const dismissCallKnockers = (callSessionId: string) => {
  const knockerMap = callKnockerMap.get(callSessionId);
  if (!knockerMap) return;

  for (const knockerSessionId of knockerMap.keys())
    callEventEmitter.emit("knockerDismissed", { callSessionId, knockerSessionId });
  callKnockerMap.delete(callSessionId);
};
