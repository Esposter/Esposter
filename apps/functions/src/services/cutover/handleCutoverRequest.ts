import { CUTOVER_SECRET_HEADER, RESCHEDULE_PATH } from "#src/services/cutover/constants";
import { checkIsSecretEqual } from "#src/services/cutover/checkIsSecretEqual";
import { rescheduleCutoverJobs } from "#src/services/cutover/rescheduleCutoverJobs";
import { drizzle } from "drizzle-orm/d1";

// The temporary internal route of the cutover, deleted at teardown. The only route the functions Worker answers; every other
// request is a 404, and the route refuses any request whose secret is not the configured one
export const handleCutoverRequest = async (request: Request, env: Cloudflare.Env): Promise<Response> => {
  if (new URL(request.url).pathname !== RESCHEDULE_PATH || request.method !== "POST")
    return new Response("Not found", { status: 404 });
  if (!checkIsSecretEqual(request.headers.get(CUTOVER_SECRET_HEADER) ?? "", env.CUTOVER_SECRET))
    return new Response("Unauthorized", { status: 401 });
  const scheduled = await rescheduleCutoverJobs(drizzle(env.CORE), env.SCHEDULER, Date.now());
  return Response.json({ scheduled });
};
