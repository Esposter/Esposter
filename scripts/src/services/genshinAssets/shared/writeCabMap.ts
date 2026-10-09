import type { CabMap } from "#src/models/genshinAssets/shared/CabMap";

// A length in seven-bit groups, the high bit set on every byte but the last, as .NET's BinaryWriter writes it
const encodeLength = (length: number): number[] => {
  const bytes: number[] = [];
  let rest = length;
  while (rest >= 0x80) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  bytes.push(rest);
  return bytes;
};
const encodeString = (text: string): Buffer => {
  const bytes = Buffer.from(text, "utf8");
  return Buffer.concat([Buffer.from(encodeLength(bytes.length)), bytes]);
};
const encodeInt32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};
const encodeInt64 = (value: number): Buffer => {
  const bytes = Buffer.alloc(8);
  bytes.writeBigInt64LE(BigInt(value));
  return bytes;
};
// The bytes of a CAB map in the form AnimeStudio writes and `readCabMap` reads back
export const writeCabMap = ({ baseFolder, records }: CabMap): Buffer =>
  Buffer.concat([
    encodeString(baseFolder),
    encodeInt32(records.length),
    ...records.flatMap(({ block, dependencies, name, offset }) => [
      encodeString(name),
      encodeString(block),
      encodeInt64(offset),
      encodeInt32(dependencies.length),
      ...dependencies.map((dependency) => encodeString(dependency)),
    ]),
  ]);
