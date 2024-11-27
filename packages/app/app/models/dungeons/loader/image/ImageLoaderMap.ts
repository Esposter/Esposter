import { BattleLoaderMap } from "@/models/dungeons/loader/image/BattleLoaderMap";
import { InventoryLoaderMap } from "@/models/dungeons/loader/image/InventoryLoaderMap";
import { MonsterPartyLoaderMap } from "@/models/dungeons/loader/image/MonsterPartyLoaderMap";
import { TitleLoaderMap } from "@/models/dungeons/loader/image/TitleLoaderMap";
import { ImageLoaderMap as UIImageLoaderMap } from "@/models/dungeons/loader/image/UI/ImageLoaderMap";
import { WorldLoaderMap } from "@/models/dungeons/loader/image/WorldLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const ImageLoaderMap = mergeObjectsStrict(
  BattleLoaderMap,
  InventoryLoaderMap,
  MonsterPartyLoaderMap,
  TitleLoaderMap,
  WorldLoaderMap,
  UIImageLoaderMap,
);
