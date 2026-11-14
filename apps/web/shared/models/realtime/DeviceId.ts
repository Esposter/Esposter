import { z } from "zod";

// The device a socket is for: a uuid a page mints once and sends with every socket it opens and every request, so each
// names the browser tab that holds it
export const deviceIdSchema = z.object({ deviceId: z.uuid() });

// The header a page sends with every request, naming the browser tab that made it, so an object does not send that tab
// the echo of a write it made
export const DEVICE_ID_HEADER = "x-esposter-device-id";
