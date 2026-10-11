import { createFileResponse } from "#server/services/genshin/createFileResponse";
import { SCENE_EXPORT_ASSETS_FOLDER } from "#server/services/genshin/sceneExport/constants";
import { listSceneExportComponents } from "#server/services/genshin/sceneExport/listSceneExportComponents";
import { SCENE_EXPORT_INDEX_PATH, WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

// A file of the developer's own exports by its path below the exports' base URL, laid out as the world reads them: the
// Index of the components holding a witness layout, a component's layout, or a mesh or texture its layout names, by
// Its export folder below the component's assets. Only a folder the index lists is read, and only its layout or a file
// Inside its assets is served, so no path reaches outside the exports' directory. Nothing is cached: an export written
// Again is read again on the next request
export const serveGenshinSceneExport = async (encodedPath: string, directory: string): Promise<Response> => {
  const [component = "", ...pathParts] = encodedPath.split("/").map((part) => decodeURIComponent(part));
  if (component === SCENE_EXPORT_INDEX_PATH && pathParts.length === 0)
    return Response.json(await listSceneExportComponents(directory));
  if (!(await listSceneExportComponents(directory)).includes(component)) return new Response(null, { status: 404 });
  const path = pathParts.join("/");
  const layoutPath = resolve(directory, component, WITNESS_LAYOUT_FILE_NAME);
  const assetsDirectory = resolve(directory, component, SCENE_EXPORT_ASSETS_FOLDER);
  const filePath = path === WITNESS_LAYOUT_FILE_NAME ? layoutPath : resolve(assetsDirectory, path);
  if (
    (filePath !== layoutPath && !filePath.startsWith(`${assetsDirectory}${sep}`)) ||
    !statSync(filePath, { throwIfNoEntry: false })?.isFile()
  )
    return new Response(null, { status: 404 });
  return createFileResponse(await readFile(filePath), filePath);
};
