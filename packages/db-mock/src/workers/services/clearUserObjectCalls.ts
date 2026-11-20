import { clearObjectStub } from "#src/workers/services/clearObjectStub";
import { userObjectCalls } from "#src/workers/services/userObjectCalls";
import { userObjectReplies } from "#src/workers/services/userObjectReplies";

export const clearUserObjectCalls = (): void => {
  clearObjectStub(userObjectCalls, userObjectReplies);
};
