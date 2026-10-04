import type { DumpedInterfaceRect } from "#src/models/genshinAssets/interface/DumpedInterfaceRect";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DumpedTransform } from "#src/models/genshinAssets/shared/DumpedTransform";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { readRectTransformLayout } from "#src/services/genshinAssets/interface/readRectTransformLayout";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface GameObject {
  m_Components: { m_PathID: string; Name: string }[];
  m_Transform: { m_GameObject: { m_PathID: string } };
}
type RectTransformDump = Pick<DumpedTransform, "m_Children" | "m_Father" | "m_GameObject" | "m_LocalScale">;
// A screen's interface as the game lays it out, from the RectTransforms of the block holding it: the block is found
// Through an indexed asset beside the interface (GameObjects are not in the asset index), its RectTransforms dumped as
// JSON for their tree and raw for their layout, which share their files' numbering, and its GameObjects for the
// Transform each is and the components it has. The tree under the interface's root is written beside the exports
export const extractComponentInterface = async (component: DerivedAssetComponent): Promise<InterfaceNode> => {
  const { interface: interfaceOptions } = DerivedAssetComponentMap[component];
  if (!interfaceOptions) throw new InvalidOperationError(Operation.Read, component, "names no interface");
  const [block] = await readAssetBlocks(interfaceOptions.anchorPattern);
  if (!block) throw new InvalidOperationError(Operation.Read, interfaceOptions.anchorPattern, "in no block");
  const directory = join(getComponentDirectory(component).root, "interface");
  await rm(directory, { force: true, recursive: true });
  const blockPath = join(GAME_BLOCKS_DIRECTORY, block);
  runAnimeStudio([
    blockPath,
    join(directory, "json"),
    "--types",
    "RectTransform",
    "GameObject",
    "--export_type",
    "JSON",
  ]);
  runAnimeStudio([blockPath, join(directory, "raw"), "--types", "RectTransform", "--export_type", "Raw"]);
  const rectDirectory = join(directory, "json", "RectTransform");
  const gameObjectDirectory = join(directory, "json", "GameObject");
  const [rectNames, gameObjectNames] = await Promise.all([readdir(rectDirectory), readdir(gameObjectDirectory)]);
  const rects = await Promise.all(
    rectNames.map(async (name): Promise<DumpedInterfaceRect> => {
      const [json, raw] = await Promise.all([
        readFile(join(rectDirectory, name), "utf8"),
        readFile(join(directory, "raw", "RectTransform", name.replace(/\.json$/u, ".dat"))),
      ]);
      const { m_Children, m_Father, m_GameObject, m_LocalScale } = parseMachineJson<RectTransformDump>(
        json,
        reviveSourcePathId,
      );
      return {
        childIds: m_Children.map(({ m_PathID }) => m_PathID),
        fatherId: m_Father.m_PathID,
        gameObjectId: m_GameObject.m_PathID,
        layout: readRectTransformLayout(raw),
        name: m_GameObject.Name,
        scale: [m_LocalScale.X, m_LocalScale.Y],
      };
    }),
  );
  const gameObjects = await Promise.all(
    gameObjectNames.map(async (name) =>
      parseMachineJson<GameObject>(await readFile(join(gameObjectDirectory, name), "utf8"), reviveSourcePathId),
    ),
  );
  const gameObjectTransformIdMap = new Map(
    gameObjects.flatMap(({ m_Components, m_Transform }) => {
      const [transform] = m_Components;
      return transform ? [[m_Transform.m_GameObject.m_PathID, transform.m_PathID] as const] : [];
    }),
  );
  const gameObjectComponentsMap = new Map(
    gameObjects.map(({ m_Components, m_Transform }) => [
      m_Transform.m_GameObject.m_PathID,
      // A component the dump leaves unnamed (a CanvasRenderer) says nothing a layout needs
      m_Components.slice(1).flatMap(({ Name }) => (Name ? [Name] : [])),
    ]),
  );
  const tree = composeInterfaceTree(rects, gameObjectTransformIdMap, gameObjectComponentsMap, interfaceOptions.root);
  if (!tree) throw new InvalidOperationError(Operation.Read, interfaceOptions.root, `not in ${block}`);
  await writeFile(join(directory, "interface.json"), JSON.stringify(tree, null, 2));
  return tree;
};
