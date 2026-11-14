import { CUTOVER_SECRET_HEADER, RESCHEDULE_PATH } from "#src/services/cutover/constants";
import { rescheduleTodoReminders } from "#src/services/cutover/rescheduleTodoReminders";
import { checkIsSecretEqual } from "@esposter/shared";
import { drizzle } from "drizzle-orm/d1";

// The temporary internal route of the cutover, deleted at teardown. The only route the functions Worker answers; every other
// request is a 404, and the route refuses any request whose secret is not the configured one
export const handleCutoverRequest = async (request: Request, env: Cloudflare.Env): Promise<Response> => {
  if (new URL(request.url).pathname !== RESCHEDULE_PATH || request.method !== "POST")
    return new Response("Not found", { status: 404 });
  if (!checkIsSecretEqual(request.headers.get(CUTOVER_SECRET_HEADER) ?? "", env.CUTOVER_SECRET))
    return new Response("Unauthorized", { status: 401 });
  const database = drizzle(env.CORE);
  const now = Date.now();
  const scheduledTodoReminders = await rescheduleTodoReminders(database, env.RESOURCE_ASSETS, env.USER, now);
  return Response.json({ scheduledTodoReminders });
};
