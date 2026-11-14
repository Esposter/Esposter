import { env } from "cloudflare:workers";

// The call's object, named by the call session's id. Its stub is typed by the class the functions Worker exports
export const useCallObject = (callSessionId: string) => env.CALL.get(env.CALL.idFromName(callSessionId));
