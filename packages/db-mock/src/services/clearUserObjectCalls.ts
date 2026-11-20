import { clearObjectStub } from "#src/services/clearObjectStub";
import { userObjectCalls } from "#src/services/userObjectCalls";
import { userObjectReplies } from "#src/services/userObjectReplies";

export const clearUserObjectCalls = (): void => {
  clearObjectStub(userObjectCalls, userObjectReplies);
};
