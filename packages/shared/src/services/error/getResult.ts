import type { Result } from "neverthrow";

import { toAppError } from "#src/services/error/toAppError";
import { fromThrowable } from "neverthrow";

export const getResult = <T>(callback: () => T): Result<T, Error> => fromThrowable(callback, toAppError)();
