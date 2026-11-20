import type { Rpc } from "@cloudflare/workers-types";
import type { UserObjectRpc } from "@esposter/db-schema";

import { createObjectStub } from "#src/services/createObjectStub";
import { userObjectCalls } from "#src/services/userObjectCalls";
import { userObjectReplies } from "#src/services/userObjectReplies";

// A person's object as the jobs Worker reaches it
export const getUserObject = (userId: string): DurableObjectStub<Rpc.DurableObjectBranded & UserObjectRpc> =>
  createObjectStub<UserObjectRpc>(userId, userObjectCalls, userObjectReplies);
