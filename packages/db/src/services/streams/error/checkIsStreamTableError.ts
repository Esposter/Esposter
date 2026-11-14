import type { StreamTableErrorCode } from "#src/models/streams/StreamTableError";

import { StreamTableError } from "#src/models/streams/StreamTableError";

export const checkIsStreamTableError = (error: unknown, code: StreamTableErrorCode): boolean =>
  error instanceof StreamTableError && error.code === code;
