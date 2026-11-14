import { env } from "cloudflare:workers";

// The call's object, named by its call session, which holds the call's participants, knockers and sockets
export const getCallObject = (callSessionId: string) => env.CALL.get(env.CALL.idFromName(callSessionId));
