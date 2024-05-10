import { BattleKey } from "@/models/dungeons/keys/image/BattleKey";
import { InventoryKey } from "@/models/dungeons/keys/image/InventoryKey";
import { MonsterPartyKey } from "@/models/dungeons/keys/image/MonsterPartyKey";
import { TitleKey } from "@/models/dungeons/keys/image/TitleKey";
import { ImageKey as UIImageKey } from "@/models/dungeons/keys/image/UI/ImageKey";
import { WorldKey } from "@/models/dungeons/keys/image/world/WorldKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const ImageKey = mergeObjectsStrict(BattleKey, InventoryKey, MonsterPartyKey, TitleKey, WorldKey, UIImageKey);
export type ImageKey = BattleKey | InventoryKey | MonsterPartyKey | TitleKey | WorldKey | UIImageKey;

export const imageKeySchema = z.nativeEnum(ImageKey) satisfies z.ZodType<ImageKey>;
