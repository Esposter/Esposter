import type { Rpc } from "@cloudflare/workers-types";
import type { UserObjectRpc } from "@esposter/db-schema";

import { createObjectStub } from "#src/workers/services/createObjectStub";
import { userObjectCalls } from "#src/workers/services/userObjectCalls";
import { userObjectReplies } from "#src/workers/services/userObjectReplies";

// A person's object as the jobs Worker reaches it
export const getUserObject = (userId: string): DurableObjectStub<Rpc.DurableObjectBranded & UserObjectRpc> =>
  createObjectStub<UserObjectRpc>(userId, userObjectCalls, userObjectReplies);
