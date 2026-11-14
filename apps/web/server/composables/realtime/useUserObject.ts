import { env } from "cloudflare:workers";

// The one person's User object, named by the person's id. Its stub is typed by the RPC contract its class implements
export const useUserObject = (userId: string) => env.USER.get(env.USER.idFromName(userId));
