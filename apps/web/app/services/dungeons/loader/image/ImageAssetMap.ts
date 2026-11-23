import type { ImageFileKey } from "#shared/generated/phaser/FileKey";

import { BattleAssetMap } from "#src/services/dungeons/loader/image/BattleAssetMap";
import { InventoryAssetMap } from "#src/services/dungeons/loader/image/InventoryAssetMap";
import { MonsterPartyAssetMap } from "#src/services/dungeons/loader/image/MonsterPartyAssetMap";
import { TitleAssetMap } from "#src/services/dungeons/loader/image/TitleAssetMap";
import { ImageAssetMap as UIImageAssetMap } from "#src/services/dungeons/loader/image/UI/ImageAssetMap";
import { WorldAssetMap } from "#src/services/dungeons/loader/image/WorldAssetMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const ImageAssetMap = mergeObjectsStrict(
  BattleAssetMap,
  InventoryAssetMap,
  MonsterPartyAssetMap,
  TitleAssetMap,
  WorldAssetMap,
  UIImageAssetMap,
) satisfies Record<ImageFileKey, string>;
