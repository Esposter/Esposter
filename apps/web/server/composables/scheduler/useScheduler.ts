import { env } from "cloudflare:workers";

export const useScheduler = (id: string) => env.SCHEDULER.get(env.SCHEDULER.idFromName(id));
