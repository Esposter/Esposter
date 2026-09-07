import { BattleLoaderMap } from "@/services/dungeons/loader/image/BattleLoaderMap";
import { InventoryLoaderMap } from "@/services/dungeons/loader/image/InventoryLoaderMap";
import { MonsterPartyLoaderMap } from "@/services/dungeons/loader/image/MonsterPartyLoaderMap";
import { TitleLoaderMap } from "@/services/dungeons/loader/image/TitleLoaderMap";
import { ImageLoaderMap as UIImageLoaderMap } from "@/services/dungeons/loader/image/UI/ImageLoaderMap";
import { WorldLoaderMap } from "@/services/dungeons/loader/image/WorldLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const ImageLoaderMap = mergeObjectsStrict(
  BattleLoaderMap,
  InventoryLoaderMap,
  MonsterPartyLoaderMap,
  TitleLoaderMap,
  WorldLoaderMap,
  UIImageLoaderMap,
);

export const ImageLoaders = Object.values(ImageLoaderMap);
