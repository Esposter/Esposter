import { BankReader } from "#src/models/genshinAssets/music/BankReader";

const GLOBAL_SETTINGS_CHUNK = "STMG";
// Each game parameter's value until the game sets it, by its id, from the global settings chunk only the initial bank
// Holds, read as bank version 134 lays it out: the voice limits, the state groups and their transitions and the switch
// Groups and their curves before the parameters, each an id, its value, then its ramp and the built-in it binds to.
// Undefined for a bank without the chunk
export const parseSoundBankParameterDefaults = (bank: Buffer): Map<number, number> | undefined => {
  for (let offset = 0; offset + 8 <= bank.length; offset += 8 + bank.readUInt32LE(offset + 4)) {
    if (bank.toString("latin1", offset, offset + 4) !== GLOBAL_SETTINGS_CHUNK) continue;
    const reader = new BankReader(bank, offset + 8);
    reader.skip(8);
    for (let index = reader.readUInt32(); index > 0; index--) {
      reader.skip(8);
      reader.skip(reader.readUInt32() * 12);
    }
    for (let index = reader.readUInt32(); index > 0; index--) {
      reader.skip(9);
      reader.skip(reader.readUInt32() * 12);
    }
    return new Map(
      Array.from({ length: reader.readUInt32() }, () => {
        const id = reader.readUInt32();
        const value = reader.readFloat();
        reader.skip(13);
        return [id, value];
      }),
    );
  }
  return undefined;
};
