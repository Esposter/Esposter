import { BattleLoaderMap } from "@/models/dungeons/loader/image/BattleLoaderMap";
import { MonsterPartyLoaderMap } from "@/models/dungeons/loader/image/MonsterPartyLoaderMap";
import { TitleLoaderMap } from "@/models/dungeons/loader/image/TitleLoaderMap";
import { ImageLoaderMap as UIImageLoaderMap } from "@/models/dungeons/loader/image/UI/ImageLoaderMap";
import { WorldLoaderMap } from "@/models/dungeons/loader/image/WorldLoaderMap";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

export const ImageLoaderMap = mergeObjectsStrict(
  BattleLoaderMap,
  MonsterPartyLoaderMap,
  TitleLoaderMap,
  WorldLoaderMap,
  UIImageLoaderMap,
);
