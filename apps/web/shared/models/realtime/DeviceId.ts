import { z } from "zod";

export interface DeviceId {
  deviceId: string;
}
// The device a socket is for: a uuid a page mints once and sends with every socket it opens and every request, so each
// Names the browser tab that holds it
export const deviceIdSchema = z.object({ deviceId: z.uuidv7() }) satisfies z.ZodType<DeviceId>;
