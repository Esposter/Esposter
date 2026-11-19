import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The person's object, named by the person's id. It lives in the realtime Worker, and each RPC it is called with runs through
// The person's invoke, so the writes it makes are published by the person's object
export const getUserObject = (userId: string) => getObjectStub(env.USER, userId);
