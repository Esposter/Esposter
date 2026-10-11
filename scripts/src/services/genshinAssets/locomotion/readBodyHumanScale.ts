import type { ExportedAvatar } from "#src/models/genshinAssets/locomotion/ExportedAvatar";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { BodyAvatarMap } from "#src/services/genshinAssets/locomotion/constants";
import {
  EXTRACTED_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

// A body type's human scale, by the body's name in the clip names, off its avatar exported as JSON outside the
// Repository
export const readBodyHumanScale = async (body: string): Promise<number> => {
  const avatar = BodyAvatarMap[body];
  if (!avatar) throw new InvalidOperationError(Operation.Read, readBodyHumanScale.name, `no avatar of body ${body}`);
  const directory = join(EXTRACTED_DIRECTORY, "avatars", body);
  await rm(directory, { force: true, recursive: true });
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, avatar.block),
      directory,
      "--types",
      AssetType.Avatar,
      "--names",
      `^${avatar.name}$`,
      "--export_type",
      AnimeStudioExportType.Json,
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const { m_Avatar } = parseMachineJson<ExportedAvatar>(
    await readFile(join(directory, AssetType.Avatar, `${avatar.name}.json`), "utf8"),
  );
  return m_Avatar.m_Human.m_Scale;
};
