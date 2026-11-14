import { env } from "cloudflare:workers";

export const getScheduler = (id: string) => env.SCHEDULER.get(env.SCHEDULER.idFromName(id));
