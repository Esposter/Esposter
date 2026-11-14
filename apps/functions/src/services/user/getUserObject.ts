import { env } from "cloudflare:workers";

// The person's object, named by the person's id. Its stub is typed by the class the functions Worker exports
export const getUserObject = (userId: string) => env.USER.get(env.USER.idFromName(userId));
