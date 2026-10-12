import { createFileResponse } from "#server/services/genshin/createFileResponse";
import { SCENE_EXPORT_ASSETS_FOLDER } from "#server/services/genshin/sceneExport/constants";
import { listSceneExportComponents } from "#server/services/genshin/sceneExport/listSceneExportComponents";
import { getResult } from "@esposter/shared";
import { SCENE_EXPORT_INDEX_PATH, SCENE_EXPORT_ROOT_FILE_NAMES } from "genshin-world/sceneExport";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

// A file of the developer's own exports by its path below the exports' base URL, laid out as the world reads them: the
// Index of the components holding a witness layout or an avatar, a component's root files (its layout, its avatar's
// Manifest and binary), or a mesh or texture its layout or avatar names, by its export folder below the component's
// Assets. Only a folder the index lists is read, and only a root file or a file inside its assets is served, so no path
// Reaches outside the exports' directory. Nothing is cached: an export written again is read again on the next request
export const serveGenshinSceneExport = async (encodedPath: string, directory: string): Promise<Response> => {
  // A malformed escape, as in "%E0", is no path the exports hold, so it is answered as one they lack
  const decodedParts = getResult(() => encodedPath.split("/").map((part) => decodeURIComponent(part))).match(
    (parts) => parts,
    () => undefined,
  );
  if (decodedParts === undefined) return new Response(null, { status: 404 });
  const [component = "", ...pathParts] = decodedParts;
  if (component === SCENE_EXPORT_INDEX_PATH && pathParts.length === 0)
    return Response.json(await listSceneExportComponents(directory));
  if (!(await listSceneExportComponents(directory)).includes(component)) return new Response(null, { status: 404 });
  const path = pathParts.join("/");
  const isRootFile = (SCENE_EXPORT_ROOT_FILE_NAMES as readonly string[]).includes(path);
  const componentDirectory = resolve(directory, component);
  const assetsDirectory = resolve(componentDirectory, SCENE_EXPORT_ASSETS_FOLDER);
  const filePath = isRootFile ? resolve(componentDirectory, path) : resolve(assetsDirectory, path);
  if (
    (!isRootFile && !filePath.startsWith(`${assetsDirectory}${sep}`)) ||
    !statSync(filePath, { throwIfNoEntry: false })?.isFile()
  )
    return new Response(null, { status: 404 });
  return createFileResponse(await readFile(filePath), filePath);
};
