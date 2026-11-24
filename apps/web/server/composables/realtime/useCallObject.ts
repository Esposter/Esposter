import { recordObjectReads } from "#server/services/realtime/recordObjectReads";
import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The call's object, named by the call session's id. Its stub is typed by the class the realtime Worker exports, and
// Each RPC it is called with records the read set the call reports into the request in scope
export const useCallObject = (callSessionId: string) => getObjectStub(env.CALL, callSessionId, recordObjectReads);
