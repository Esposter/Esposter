import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Reads a binary chunk's little-endian fields in order, failing loudly on a read past its end
export class LuaByteReader {
  readonly dialect: LuaDialect;

  get isAtEnd(): boolean {
    return this.#offset === this.#bytes.byteLength;
  }

  readonly #bytes: Uint8Array;
  #offset = 0;

  readonly #view: DataView;

  constructor(bytes: Uint8Array, dialect: LuaDialect) {
    this.#bytes = bytes;
    this.dialect = dialect;
    this.#view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  readByte(): number {
    return this.#view.getUint8(this.#take(1));
  }

  readBytes(length: number): Uint8Array {
    const start = this.#take(length);
    return this.#bytes.subarray(start, start + length);
  }

  readFloat64(): number {
    return this.#view.getFloat64(this.#take(8), true);
  }

  readUint32(): number {
    return this.#view.getUint32(this.#take(4), true);
  }

  readUint64(): bigint {
    return this.#view.getBigUint64(this.#take(8), true);
  }

  #take(length: number): number {
    const start = this.#offset;
    if (start + length > this.#bytes.byteLength)
      throw new InvalidOperationError(
        Operation.Read,
        "lua chunk",
        `reads ${length} bytes at byte ${start}, past its ${this.#bytes.byteLength} bytes`,
      );
    this.#offset += length;
    return start;
  }
}
