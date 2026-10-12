// A cursor over a shader's raw export, read in order as Unity serializes it: little-endian words, a string as its
// length, its bytes and a pad to four bytes, and a list as its count followed by its items
export class BinaryCursor {
  readonly #data: Buffer;
  #position: number;

  constructor(data: Buffer, position = 0) {
    this.#data = data;
    this.#position = position;
  }

  align(): void {
    const remainder = this.#position % 4;
    if (remainder !== 0) this.#position += 4 - remainder;
  }

  bool(): boolean {
    return this.uint8() !== 0;
  }

  bytes(length: number): Buffer {
    const value = this.#data.subarray(this.#position, this.#position + length);
    this.#position += length;
    return value;
  }

  float32(): number {
    const value = this.#data.readFloatLE(this.#position);
    this.#position += 4;
    return value;
  }

  int8(): number {
    const value = this.#data.readInt8(this.#position);
    this.#position += 1;
    return value;
  }

  int32(): number {
    const value = this.#data.readInt32LE(this.#position);
    this.#position += 4;
    return value;
  }

  list<T>(readItem: () => T): T[] {
    const count = this.int32();
    return Array.from({ length: count }, readItem);
  }

  rewind(length: number): void {
    this.#position -= length;
  }

  skip(length: number): void {
    this.#position += length;
  }

  string(): string {
    const length = this.int32();
    const value = length > 0 ? this.bytes(length).toString("utf8") : "";
    this.align();
    return value;
  }

  uint8(): number {
    const value = this.#data.readUInt8(this.#position);
    this.#position += 1;
    return value;
  }

  uint8List(): Buffer {
    const length = this.int32();
    const value = this.bytes(length);
    this.align();
    return value;
  }

  uint16List(): number[] {
    const values = this.list(() => {
      const value = this.#data.readUInt16LE(this.#position);
      this.#position += 2;
      return value;
    });
    this.align();
    return values;
  }

  uint32(): number {
    const value = this.#data.readUInt32LE(this.#position);
    this.#position += 4;
    return value;
  }

  uint32List(): number[] {
    return this.list(() => this.uint32());
  }
}
