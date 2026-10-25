import { toUint32 } from "#src/services/writeMidi/toUint32";

export const writeChunk = (type: number[], data: number[]) => [...type, ...toUint32(data.length), ...data];
