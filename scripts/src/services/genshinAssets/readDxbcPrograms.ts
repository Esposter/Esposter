// A DXBC container: its magic, then a 16 byte checksum, a version, and its total size in bytes
const DXBC_MAGIC = Buffer.from("DXBC", "ascii");
const DXBC_CHECKSUM_OFFSET = 4;
const DXBC_CHECKSUM_LENGTH = 16;
const DXBC_SIZE_OFFSET = 24;
const DXBC_HEADER_LENGTH = 32;
// Every distinct compiled Direct3D 11 program in a shader's raw export. The game's shaders keep each variant's
// Bytecode as a plain DXBC container, so the programs are found by their magic and their own stated size, and a
// Variant compiled twice (the same checksum) is kept once
export const readDxbcPrograms = (data: Buffer): Buffer[] => {
  const programs: Buffer[] = [];
  const checksums = new Set<string>();
  let offset = data.indexOf(DXBC_MAGIC);
  while (offset !== -1 && offset + DXBC_HEADER_LENGTH <= data.length) {
    const size = data.readUInt32LE(offset + DXBC_SIZE_OFFSET);
    if (size < DXBC_HEADER_LENGTH || offset + size > data.length) {
      offset = data.indexOf(DXBC_MAGIC, offset + 1);
      continue;
    }
    const checksum = data.toString(
      "hex",
      offset + DXBC_CHECKSUM_OFFSET,
      offset + DXBC_CHECKSUM_OFFSET + DXBC_CHECKSUM_LENGTH,
    );
    if (!checksums.has(checksum)) {
      checksums.add(checksum);
      programs.push(data.subarray(offset, offset + size));
    }
    offset = data.indexOf(DXBC_MAGIC, offset + size);
  }
  return programs;
};
