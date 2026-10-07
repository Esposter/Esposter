// A cursor over a sound bank object's bytes, read in order as the bank's version lays its fields out, little-endian
export class BankReader {
  readonly #data: Buffer;
  #offset: number;

  constructor(data: Buffer, offset = 0) {
    this.#data = data;
    this.#offset = offset;
  }

  readFloat(): number {
    const value = this.#data.readFloatLE(this.#offset);
    this.#offset += 4;
    return value;
  }

  readUInt8(): number {
    const value = this.#data.readUInt8(this.#offset);
    this.#offset += 1;
    return value;
  }

  readUInt16(): number {
    const value = this.#data.readUInt16LE(this.#offset);
    this.#offset += 2;
    return value;
  }

  readUInt32(): number {
    const value = this.#data.readUInt32LE(this.#offset);
    this.#offset += 4;
    return value;
  }

  // A count stored in seven bits a byte, most significant first, each byte but the last with its top bit set
  readVariableUInt(): number {
    let value = 0;
    let byte: number;
    do {
      byte = this.readUInt8();
      value = value * 128 + (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  }

  skip(length: number): void {
    this.#offset += length;
  }
}
