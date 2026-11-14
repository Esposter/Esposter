import { z } from "zod";

// The device a socket is for: a uuid a page mints once and sends with every socket it opens, so each socket names the
// browser tab that holds it
export const deviceIdSchema = z.object({ deviceId: z.uuid() });

// The header a page sends with every write, naming the browser tab that made it, so the object does not send that tab
// the echo of its own write
export const DEVICE_ID_HEADER = "x-esposter-device-id";
