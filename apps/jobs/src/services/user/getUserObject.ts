import { env } from "cloudflare:workers";

// The person's object, named by the person's id. It lives in the realtime Worker, and its stub is typed by the RPC surface it implements
export const getUserObject = (userId: string) => env.USER.get(env.USER.idFromName(userId));
