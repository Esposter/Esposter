import { z } from "zod";

// The device a socket is for: a uuid a page mints once and sends with every socket it opens, so each socket names the
// browser tab that holds it
export const deviceIdSchema = z.object({ deviceId: z.uuid() });
