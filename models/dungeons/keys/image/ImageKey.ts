import { BattleKey } from "@/models/dungeons/keys/image/BattleKey";
import { MonsterPartyKey } from "@/models/dungeons/keys/image/MonsterPartyKey";
import { TitleKey } from "@/models/dungeons/keys/image/TitleKey";
import { ImageKey as UIImageKey } from "@/models/dungeons/keys/image/UI/ImageKey";
import { WorldKey } from "@/models/dungeons/keys/image/WorldKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const ImageKey = mergeObjectsStrict(BattleKey, MonsterPartyKey, TitleKey, WorldKey, UIImageKey);
export type ImageKey = keyof typeof ImageKey;

export const imageKeySchema = z.nativeEnum(ImageKey) satisfies z.ZodType<ImageKey>;
