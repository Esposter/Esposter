import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";

import {
  AMBER_CHARACTER_ID,
  AYAKA_CHARACTER_ID,
  BARBARA_CHARACTER_ID,
  BEIDOU_CHARACTER_ID,
  BENNETT_CHARACTER_ID,
  CHONGYUN_CHARACTER_ID,
  DILUC_CHARACTER_ID,
  FISCHL_CHARACTER_ID,
  JEAN_CHARACTER_ID,
  KAEYA_CHARACTER_ID,
  KLEE_CHARACTER_ID,
  LISA_CHARACTER_ID,
  MONA_CHARACTER_ID,
  NINGGUANG_CHARACTER_ID,
  NOELLE_CHARACTER_ID,
  QIQI_CHARACTER_ID,
  RAZOR_CHARACTER_ID,
  VENTI_CHARACTER_ID,
  XIANGLING_CHARACTER_ID,
  XIAO_CHARACTER_ID,
  XINGQIU_CHARACTER_ID,
  ZHONGLI_CHARACTER_ID,
} from "#src/services/character/constants";
import { createAmberKit } from "#src/services/kit/characters/amberKit";
import { createAyakaKit } from "#src/services/kit/characters/ayakaKit";
import { createBarbaraKit } from "#src/services/kit/characters/barbaraKit";
import { createBeidouKit } from "#src/services/kit/characters/beidouKit";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { createChongyunKit } from "#src/services/kit/characters/chongyunKit";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { createFischlKit } from "#src/services/kit/characters/fischlKit";
import { createJeanKit } from "#src/services/kit/characters/jeanKit";
import { createKaeyaKit } from "#src/services/kit/characters/kaeyaKit";
import { createKleeKit } from "#src/services/kit/characters/kleeKit";
import { createLisaKit } from "#src/services/kit/characters/lisaKit";
import { createMonaKit } from "#src/services/kit/characters/monaKit";
import { createNingguangKit } from "#src/services/kit/characters/ningguangKit";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { createQiqiKit } from "#src/services/kit/characters/qiqiKit";
import { createRazorKit } from "#src/services/kit/characters/razorKit";
import { createVentiKit } from "#src/services/kit/characters/ventiKit";
import { createXianglingKit } from "#src/services/kit/characters/xianglingKit";
import { createXiaoKit } from "#src/services/kit/characters/xiaoKit";
import { createXingqiuKit } from "#src/services/kit/characters/xingqiuKit";
import { createZhongliKit } from "#src/services/kit/characters/zhongliKit";

// Each character's kit by its avatar id, for those whose module is built, made from the loaded talent multipliers. A
// Character with none falls back to the Traveler's kit, as the roster does
export const CharacterIdCreateKitMap: Partial<Record<number, (talentMultiplierMap: TalentMultiplierMap) => Kit>> = {
  [AMBER_CHARACTER_ID]: createAmberKit,
  [AYAKA_CHARACTER_ID]: createAyakaKit,
  [BARBARA_CHARACTER_ID]: createBarbaraKit,
  [BEIDOU_CHARACTER_ID]: createBeidouKit,
  [BENNETT_CHARACTER_ID]: createBennettKit,
  [CHONGYUN_CHARACTER_ID]: createChongyunKit,
  [DILUC_CHARACTER_ID]: createDilucKit,
  [FISCHL_CHARACTER_ID]: createFischlKit,
  [JEAN_CHARACTER_ID]: createJeanKit,
  [KAEYA_CHARACTER_ID]: createKaeyaKit,
  [KLEE_CHARACTER_ID]: createKleeKit,
  [LISA_CHARACTER_ID]: createLisaKit,
  [MONA_CHARACTER_ID]: createMonaKit,
  [NINGGUANG_CHARACTER_ID]: createNingguangKit,
  [NOELLE_CHARACTER_ID]: createNoelleKit,
  [QIQI_CHARACTER_ID]: createQiqiKit,
  [RAZOR_CHARACTER_ID]: createRazorKit,
  [VENTI_CHARACTER_ID]: createVentiKit,
  [XIANGLING_CHARACTER_ID]: createXianglingKit,
  [XIAO_CHARACTER_ID]: createXiaoKit,
  [XINGQIU_CHARACTER_ID]: createXingqiuKit,
  [ZHONGLI_CHARACTER_ID]: createZhongliKit,
};
