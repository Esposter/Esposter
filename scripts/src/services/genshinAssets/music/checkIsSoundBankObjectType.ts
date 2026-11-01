import { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";

const SOUND_BANK_OBJECT_TYPE_SET = new Set<number>(Object.values(SoundBankObjectType) as number[]);

export const checkIsSoundBankObjectType = (type: number): type is SoundBankObjectType =>
  SOUND_BANK_OBJECT_TYPE_SET.has(type);
