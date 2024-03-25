import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { BattleLoaderMap } from "@/models/dungeons/loader/image/BattleLoaderMap";
import { TitleLoaderMap } from "@/models/dungeons/loader/image/TitleLoaderMap";
import { ImageLoaderMap as UIImageLoaderMap } from "@/models/dungeons/loader/image/UI/ImageLoaderMap";
import { WorldLoaderMap } from "@/models/dungeons/loader/image/WorldLoaderMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const ImageLoaderMap = {
  ...BattleLoaderMap,
  ...TitleLoaderMap,
  ...WorldLoaderMap,
  ...UIImageLoaderMap,
} as const satisfies Record<ImageKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
