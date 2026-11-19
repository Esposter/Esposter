import { createObjectStub } from "#server/services/realtime/createObjectStub";
import { env } from "cloudflare:workers";

// The one person's User object, named by the person's id. Its stub is typed by the RPC contract its class implements, and each
// RPC it is called with records the read set the object reports into the request in scope
export const useUserObject = (userId: string) => createObjectStub(env.USER.get(env.USER.idFromName(userId)));
