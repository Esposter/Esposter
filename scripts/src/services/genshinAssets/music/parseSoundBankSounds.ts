import type { AudioPackageEntry } from "#src/models/genshinAssets/music/AudioPackageEntry";

// A chunk's tag and its size lead it
const CHUNK_HEADER_LENGTH = 8;
// An index entry: the sound's id, its offset into the data chunk and its size
const INDEX_ENTRY_LENGTH = 12;
// The sounds a sound bank holds in itself, each by its id, where its bytes start in the bank and how many there are:
// The bank's index chunk (`DIDX`) lists each against the data chunk (`DATA`) that follows it
export const parseSoundBankSounds = (bank: Buffer): AudioPackageEntry[] => {
  const entries: { dataOffset: number; id: number; size: number }[] = [];
  let dataStart = 0;
  for (let position = 0; position + CHUNK_HEADER_LENGTH <= bank.length;) {
    const tag = bank.toString("latin1", position, position + 4);
    const size = bank.readUInt32LE(position + 4);
    const body = position + CHUNK_HEADER_LENGTH;
    if (tag === "DIDX")
      for (let entry = body; entry + INDEX_ENTRY_LENGTH <= body + size; entry += INDEX_ENTRY_LENGTH)
        entries.push({
          dataOffset: bank.readUInt32LE(entry + 4),
          id: bank.readUInt32LE(entry),
          size: bank.readUInt32LE(entry + 8),
        });
    else if (tag === "DATA") dataStart = body;
    position = body + size;
  }
  return entries.map(({ dataOffset, id, size }) => ({ id, offset: dataStart + dataOffset, size }));
};
