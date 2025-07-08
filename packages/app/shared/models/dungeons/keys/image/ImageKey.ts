import { BattleKey } from "#shared/models/dungeons/keys/image/BattleKey";
import { InventoryKey } from "#shared/models/dungeons/keys/image/InventoryKey";
import { MonsterPartyKey } from "#shared/models/dungeons/keys/image/MonsterPartyKey";
import { TitleKey } from "#shared/models/dungeons/keys/image/TitleKey";
import { ImageKey as UIImageKey } from "#shared/models/dungeons/keys/image/UI/ImageKey";
import { WorldKey } from "#shared/models/dungeons/keys/image/world/WorldKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod/v4";

export const ImageKey = mergeObjectsStrict(BattleKey, InventoryKey, MonsterPartyKey, TitleKey, WorldKey, UIImageKey);
export type ImageKey = BattleKey | InventoryKey | MonsterPartyKey | TitleKey | UIImageKey | WorldKey;

export const imageKeySchema = z.enum(ImageKey) satisfies z.ZodType<ImageKey>;
