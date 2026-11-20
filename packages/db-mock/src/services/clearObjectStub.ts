import type { ObjectCall } from "#src/models/ObjectCall";
import type { ObjectReply } from "#src/models/ObjectReply";

// A suite clears the calls and the answers it scripted, so each test starts from an object that has been asked nothing
export const clearObjectStub = (objectCalls: ObjectCall[], objectReplies: Map<string, ObjectReply>): void => {
  objectCalls.length = 0;
  objectReplies.clear();
};
