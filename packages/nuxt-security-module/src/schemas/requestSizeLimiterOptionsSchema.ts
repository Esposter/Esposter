import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";

import * as z from "zod";

export const requestSizeLimiterOptionsSchema = z.strictObject({
  maxRequestSizeInBytes: z.int("must be a whole number of bytes").positive("must be more than zero bytes"),
  maxUploadFileRequestInBytes: z.int("must be a whole number of bytes").positive("must be more than zero bytes"),
}) satisfies z.ZodType<RequestSizeLimiterOptions>;
