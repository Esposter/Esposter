import type { PublishEvent } from "@esposter/db-schema";

import { PUBLISH_URL, SERVER_INSTANCE_NAME } from "#src/services/server/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { env } from "cloudflare:workers";

// The web Worker's `server` object is where every live subscription is held, so a change made here reaches them
// Through its own emitters. The route answers only inside that object, so a refusal means the publish did not land
export const publishToServer = async (event: PublishEvent): Promise<void> => {
  const server = env.SERVER.get(env.SERVER.idFromName(SERVER_INSTANCE_NAME));
  const response = await server.fetch(PUBLISH_URL, { body: JSON.stringify(event), method: "POST" });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Create, event.type, `publish refused with status ${response.status}`);
};
