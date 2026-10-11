import { SCENE_EXPORT_INDEX_PATH } from "#src/services/scene/constants";
import { fetchJson } from "#src/services/shared/fetchJson";
import { createUniqueArraySchema, getResultAsync } from "@esposter/shared";
import { z } from "zod";

// The components a host serves the exports of, by the index beside their folders, read once so a component it holds
// None of is never asked for
export const readSceneExportComponents = (sceneExportBaseUrl: string): ReturnType<typeof getResultAsync<string[]>> =>
  getResultAsync(async () =>
    createUniqueArraySchema(z.string().min(1)).parse(
      await fetchJson(`${sceneExportBaseUrl}/${SCENE_EXPORT_INDEX_PATH}`),
    ),
  );
