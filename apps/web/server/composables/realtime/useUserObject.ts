import { recordObjectReads } from "#server/services/realtime/recordObjectReads";
import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The one person's User object, named by the person's id.
// Its stub is typed by the RPC contract its class implements.
// Each RPC it is called with records the read set the object reports into the request in scope.
export const useUserObject = (userId: string) => getObjectStub(env.USER, userId, recordObjectReads);
