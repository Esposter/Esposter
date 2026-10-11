import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";

import {
  ALBEDO_CHARACTER_ID,
  AMBER_CHARACTER_ID,
  AYAKA_CHARACTER_ID,
  BARBARA_CHARACTER_ID,
  BEIDOU_CHARACTER_ID,
  BENNETT_CHARACTER_ID,
  CHONGYUN_CHARACTER_ID,
  DILUC_CHARACTER_ID,
  DIONA_CHARACTER_ID,
  EULA_CHARACTER_ID,
  FISCHL_CHARACTER_ID,
  GANYU_CHARACTER_ID,
  HU_TAO_CHARACTER_ID,
  JEAN_CHARACTER_ID,
  KAEYA_CHARACTER_ID,
  KAZUHA_CHARACTER_ID,
  KEQING_CHARACTER_ID,
  KLEE_CHARACTER_ID,
  KOKOMI_CHARACTER_ID,
  LISA_CHARACTER_ID,
  MONA_CHARACTER_ID,
  NINGGUANG_CHARACTER_ID,
  NOELLE_CHARACTER_ID,
  QIQI_CHARACTER_ID,
  RAIDEN_CHARACTER_ID,
  RAZOR_CHARACTER_ID,
  ROSARIA_CHARACTER_ID,
  SAYU_CHARACTER_ID,
  SUCROSE_CHARACTER_ID,
  TARTAGLIA_CHARACTER_ID,
  THOMA_CHARACTER_ID,
  VENTI_CHARACTER_ID,
  XIANGLING_CHARACTER_ID,
  XIAO_CHARACTER_ID,
  XINGQIU_CHARACTER_ID,
  YOIMIYA_CHARACTER_ID,
  YANFEI_CHARACTER_ID,
  ZHONGLI_CHARACTER_ID,
} from "#src/services/character/constants";
import { createAlbedoKit } from "#src/services/kit/characters/albedoKit";
import { createAmberKit } from "#src/services/kit/characters/amberKit";
import { createAyakaKit } from "#src/services/kit/characters/ayakaKit";
import { createBarbaraKit } from "#src/services/kit/characters/barbaraKit";
import { createBeidouKit } from "#src/services/kit/characters/beidouKit";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { createChongyunKit } from "#src/services/kit/characters/chongyunKit";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { createDionaKit } from "#src/services/kit/characters/dionaKit";
import { createEulaKit } from "#src/services/kit/characters/eulaKit";
import { createFischlKit } from "#src/services/kit/characters/fischlKit";
import { createGanyuKit } from "#src/services/kit/characters/ganyuKit";
import { createHuTaoKit } from "#src/services/kit/characters/huTaoKit";
import { createJeanKit } from "#src/services/kit/characters/jeanKit";
import { createKaeyaKit } from "#src/services/kit/characters/kaeyaKit";
import { createKazuhaKit } from "#src/services/kit/characters/kazuhaKit";
import { createKeqingKit } from "#src/services/kit/characters/keqingKit";
import { createKleeKit } from "#src/services/kit/characters/kleeKit";
import { createKokomiKit } from "#src/services/kit/characters/kokomiKit";
import { createLisaKit } from "#src/services/kit/characters/lisaKit";
import { createMonaKit } from "#src/services/kit/characters/monaKit";
import { createNingguangKit } from "#src/services/kit/characters/ningguangKit";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { createQiqiKit } from "#src/services/kit/characters/qiqiKit";
import { createRaidenKit } from "#src/services/kit/characters/raidenKit";
import { createRazorKit } from "#src/services/kit/characters/razorKit";
import { createRosariaKit } from "#src/services/kit/characters/rosariaKit";
import { createSayuKit } from "#src/services/kit/characters/sayuKit";
import { createSucroseKit } from "#src/services/kit/characters/sucroseKit";
import { createTartagliaKit } from "#src/services/kit/characters/tartagliaKit";
import { createThomaKit } from "#src/services/kit/characters/thomaKit";
import { createVentiKit } from "#src/services/kit/characters/ventiKit";
import { createXianglingKit } from "#src/services/kit/characters/xianglingKit";
import { createXiaoKit } from "#src/services/kit/characters/xiaoKit";
import { createXingqiuKit } from "#src/services/kit/characters/xingqiuKit";
import { createYoimiyaKit } from "#src/services/kit/characters/yoimiyaKit";
import { createYanfeiKit } from "#src/services/kit/characters/yanfeiKit";
import { createZhongliKit } from "#src/services/kit/characters/zhongliKit";

// Each character's kit by its avatar id, for those whose module is built, made from the loaded talent multipliers. A
// Character with none falls back to the Traveler's kit, as the roster does
export const CharacterIdCreateKitMap: Partial<Record<number, (talentMultiplierMap: TalentMultiplierMap) => Kit>> = {
  [ALBEDO_CHARACTER_ID]: createAlbedoKit,
  [AMBER_CHARACTER_ID]: createAmberKit,
  [AYAKA_CHARACTER_ID]: createAyakaKit,
  [BARBARA_CHARACTER_ID]: createBarbaraKit,
  [BEIDOU_CHARACTER_ID]: createBeidouKit,
  [BENNETT_CHARACTER_ID]: createBennettKit,
  [CHONGYUN_CHARACTER_ID]: createChongyunKit,
  [DILUC_CHARACTER_ID]: createDilucKit,
  [DIONA_CHARACTER_ID]: createDionaKit,
  [EULA_CHARACTER_ID]: createEulaKit,
  [FISCHL_CHARACTER_ID]: createFischlKit,
  [GANYU_CHARACTER_ID]: createGanyuKit,
  [HU_TAO_CHARACTER_ID]: createHuTaoKit,
  [JEAN_CHARACTER_ID]: createJeanKit,
  [KAEYA_CHARACTER_ID]: createKaeyaKit,
  [KAZUHA_CHARACTER_ID]: createKazuhaKit,
  [KEQING_CHARACTER_ID]: createKeqingKit,
  [KLEE_CHARACTER_ID]: createKleeKit,
  [KOKOMI_CHARACTER_ID]: createKokomiKit,
  [LISA_CHARACTER_ID]: createLisaKit,
  [MONA_CHARACTER_ID]: createMonaKit,
  [NINGGUANG_CHARACTER_ID]: createNingguangKit,
  [NOELLE_CHARACTER_ID]: createNoelleKit,
  [QIQI_CHARACTER_ID]: createQiqiKit,
  [RAIDEN_CHARACTER_ID]: createRaidenKit,
  [RAZOR_CHARACTER_ID]: createRazorKit,
  [ROSARIA_CHARACTER_ID]: createRosariaKit,
  [SAYU_CHARACTER_ID]: createSayuKit,
  [SUCROSE_CHARACTER_ID]: createSucroseKit,
  [TARTAGLIA_CHARACTER_ID]: createTartagliaKit,
  [THOMA_CHARACTER_ID]: createThomaKit,
  [VENTI_CHARACTER_ID]: createVentiKit,
  [XIANGLING_CHARACTER_ID]: createXianglingKit,
  [XIAO_CHARACTER_ID]: createXiaoKit,
  [XINGQIU_CHARACTER_ID]: createXingqiuKit,
  [YANFEI_CHARACTER_ID]: createYanfeiKit,
  [YOIMIYA_CHARACTER_ID]: createYoimiyaKit,
  [ZHONGLI_CHARACTER_ID]: createZhongliKit,
};
