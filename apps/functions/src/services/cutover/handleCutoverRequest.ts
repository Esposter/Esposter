import {
  CUTOVER_SECRET_HEADER,
  RESCHEDULE_PATH,
  ROOM_IMPORT_PATH,
  ROOM_SUMMARY_PATH,
} from "#src/services/cutover/constants";
import { rescheduleTodoReminders } from "#src/services/cutover/rescheduleTodoReminders";
import { roomImportSchema } from "@esposter/db-schema";
import { checkIsSecretEqual, getResultAsync } from "@esposter/shared";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

// A room's copy names the room it is for beside the rows the room's object takes
const roomImportRequestSchema = roomImportSchema.extend({ roomId: z.uuidv7() });
const roomSummaryRequestSchema = z.object({ roomId: z.uuidv7() });

// The temporary internal routes of the cutover are all deleted at teardown.
// They are the reschedule of the copied jobs, and the import and summary of each room's copied history in its object.
// The only routes the functions Worker answers.
// Every other request is a 404, and every route refuses a request whose secret is not the configured one
export const handleCutoverRequest = async (request: Request, env: Cloudflare.Env): Promise<Response> => {
  const { pathname } = new URL(request.url);
  if (request.method !== "POST" || ![RESCHEDULE_PATH, ROOM_IMPORT_PATH, ROOM_SUMMARY_PATH].includes(pathname))
    return new Response("Not found", { status: 404 });
  if (!checkIsSecretEqual(request.headers.get(CUTOVER_SECRET_HEADER) ?? "", env.CUTOVER_SECRET))
    return new Response("Unauthorized", { status: 401 });

  if (pathname === RESCHEDULE_PATH) {
    const database = drizzle(env.CORE);
    const now = Date.now();
    const scheduledTodoReminders = await rescheduleTodoReminders(database, env.RESOURCE_ASSETS, env.USER, now);
    return Response.json({ scheduledTodoReminders });
  }
  // A body that is not JSON, or not the shape its route takes, is a 400, so the cutover sees what it sent wrong
  if (pathname === ROOM_IMPORT_PATH) {
    const roomImportRequest = await getResultAsync(async () => roomImportRequestSchema.parse(await request.json()));
    return roomImportRequest.match(
      async ({ roomId, ...roomImport }) =>
        Response.json(await env.ROOM.get(env.ROOM.idFromName(roomId)).importRoom(roomImport)),
      () => new Response("Bad request", { status: 400 }),
    );
  }

  const roomSummaryRequest = await getResultAsync(async () => roomSummaryRequestSchema.parse(await request.json()));
  return roomSummaryRequest.match(
    async ({ roomId }) => Response.json(await env.ROOM.get(env.ROOM.idFromName(roomId)).summarizeRoom()),
    () => new Response("Bad request", { status: 400 }),
  );
};
