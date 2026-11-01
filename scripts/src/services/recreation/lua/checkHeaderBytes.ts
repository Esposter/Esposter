import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const checkHeaderBytes = (actual: Uint8Array, expected: Uint8Array, field: string): void => {
  if (!actual.every((byte, index) => byte === expected[index]))
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `${field} do not match Lua 5.3's`);
};
