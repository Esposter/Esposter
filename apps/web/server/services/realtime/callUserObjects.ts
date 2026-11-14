import type { UserObjectRpc } from "@esposter/db-schema";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { getResultAsync, noop } from "@esposter/shared";

// Sends one personal event to each person's object, settled independently: a person whose object cannot be reached
// Loses that one event, and the write that raised it has already committed by the time this runs
export const callUserObjects = (
  userIds: string[],
  call: (userObject: UserObjectRpc) => Promise<void>,
): Promise<void[]> =>
  Promise.all(
    userIds.map((userId) =>
      getResultAsync(() => call(useUserObject(userId))).match(noop, (error) => {
        console.error("A personal event failed to reach a user object", { error, userId });
      }),
    ),
  );
