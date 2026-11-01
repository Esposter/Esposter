import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const checkHeaderField = (actual: bigint | number, expected: bigint | number, field: string): void => {
  if (actual !== expected)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `${field} is ${actual}, not ${expected}`);
};
