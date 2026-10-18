import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { readTerrainSplats } from "#src/services/genshinAssets/world/readTerrainSplats";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { getOrCreate } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const CHANNEL_NAMES = ["R", "G", "B", "A"];
const readNames = (directory: string): Promise<string[]> =>
  existsSync(directory) ? readdir(directory) : Promise.resolve([]);
// A component with no world of its own has no terrain tiles to read layers off
const readWorldTerrainSplats = async (component: DerivedAssetComponent): ReturnType<typeof readTerrainSplats> =>
  (await readWorldOptions(component)) ? readTerrainSplats(component) : [];
// Everything a component's export holds, as a Markdown report beside it: each material's shader, texture slots and
// Values, each texture's size and what each channel spans, each mesh's vertices and the materials its renderers draw it
// With, each terrain tile's splat layers with the share of its cells each paints, and each shader the `shaders` step
// Read. It is the scene derivation's first step: nothing is built before it is
// Inventoried (openspec/specs/genshin/scene-derivation/design.md)
export const writeComponentInventory = async (component: DerivedAssetComponent): Promise<string> => {
  const directory = getComponentDirectory(component);
  const [materials, { gameObjectDrawingMap }, terrainSplats] = await Promise.all([
    readComponentMaterials(component),
    readSceneLayout(directory.layout),
    readWorldTerrainSplats(component),
  ]);
  const referencedIds = new Set([
    ...materials.flatMap(({ shaderPathId, textures }) => [
      shaderPathId,
      ...Object.values(textures).map(({ pathId }) => pathId),
    ]),
    ...[...gameObjectDrawingMap.values()].flatMap(({ materials: drawnMaterials }) => drawnMaterials),
    ...terrainSplats.flatMap(({ splat }) => splat.layers.map(({ diffusePathId }) => diffusePathId)),
  ]);
  const indexed = await readIndexedAssets(({ pathId }) => referencedIds.has(pathId), GENSHIN_ANIMESTUDIO_OPTIONS);
  const pathIdAssetMap = new Map(indexed.map((asset) => [asset.pathId, asset]));
  const lines = [`# ${component} inventory`, "", "## Materials", ""];
  for (const { colors, floats, name, shaderPathId, textures } of materials.toSorted((firstMaterial, secondMaterial) =>
    firstMaterial.name.localeCompare(secondMaterial.name),
  )) {
    const shader = pathIdAssetMap.get(shaderPathId);
    lines.push(`### ${name}`, "", `- Shader: \`${shaderPathId}\` in \`${shader?.block ?? "an unindexed block"}\``);
    for (const [slot, { offset, pathId, scale }] of Object.entries(textures))
      lines.push(
        `- ${slot}: ${pathIdAssetMap.get(pathId)?.name ?? `\`${pathId}\``}, scale ${scale.join(" ")}, offset ${offset.join(" ")}`,
      );
    const setFloats = Object.entries(floats).filter(([, value]) => value !== 0);
    lines.push(
      `- Floats: ${setFloats.map(([key, value]) => `${key} ${value}`).join(", ")}`,
      `- Colours: ${Object.entries(colors)
        .map(([key, value]) => `${key} (${value.map((channel) => channel.toFixed(3)).join(" ")})`)
        .join(", ")}`,
      "",
    );
  }
  lines.push("## Textures", "", "| Texture | Size | Channels, min mean max |", "| :-- | :-- | :-- |");
  const textureDirectory = join(directory.assets, AssetType.Texture2D);
  for (const name of await readNames(textureDirectory)) {
    const path = join(textureDirectory, name);
    // oxlint-disable-next-line no-await-in-loop -- one texture is decoded at a time
    const [{ height, width }, { channels }] = await Promise.all([sharp(path).metadata(), sharp(path).stats()]);
    const spans = channels.map(
      ({ max, mean, min }, index) =>
        `${CHANNEL_NAMES[index]} ${min} ${Math.round(mean)} ${max}${min === max ? " (constant)" : ""}`,
    );
    lines.push(`| ${basename(name, ".png")} | ${width}×${height} | ${spans.join(", ")} |`);
  }
  const meshMaterialsMap = new Map<string, Set<string>>();
  for (const { materials: drawnMaterials, mesh } of gameObjectDrawingMap.values())
    for (const material of drawnMaterials.map((pathId) => pathIdAssetMap.get(pathId)?.name ?? pathId))
      getOrCreate(meshMaterialsMap, mesh, () => new Set()).add(material);
  lines.push("", "## Meshes", "", "| Mesh | Vertices | Drawn with |", "| :-- | --: | :-- |");
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  for (const name of await readNames(meshDirectory)) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const objText = await readFile(join(meshDirectory, name), "utf8");
    const vertexCount = objText.split("\n").filter((line) => line.startsWith("v ")).length;
    const mesh = basename(name, ".obj");
    lines.push(`| ${mesh} | ${vertexCount} | ${[...(meshMaterialsMap.get(mesh) ?? [])].join(", ")} |`);
  }
  lines.push(
    "",
    "## Terrain layers",
    "",
    "| Tile | Layer | Diffuse | Kind | Repeat | Cells |",
    "| :-- | --: | :-- | --: | --: | --: |",
  );
  for (const { name, splat } of terrainSplats.toSorted((firstTile, secondTile) =>
    firstTile.name.localeCompare(secondTile.name),
  ))
    for (const [index, { diffusePathId, kind, tileSize }] of splat.layers.entries()) {
      const share = splat.cells.filter((cell) => cell === index).length / splat.cells.length;
      const diffuse = pathIdAssetMap.get(diffusePathId)?.name ?? `\`${diffusePathId}\``;
      lines.push(`| ${name} | ${index} | ${diffuse} | ${kind} | ${tileSize} m | ${(100 * share).toFixed(1)}% |`);
    }
  lines.push("", "## Shaders", "");
  for (const block of (await readNames(directory.shaders)).filter((name) => name !== "raw"))
    for (const shader of await readNames(join(directory.shaders, block))) {
      const shaderDirectory = join(directory.shaders, block, shader);
      // oxlint-disable-next-line no-await-in-loop -- one shader's folder is read at a time
      const [files, properties, programs] = await Promise.all([
        readdir(shaderDirectory),
        readFile(join(shaderDirectory, "properties.txt"), "utf8"),
        readFile(join(shaderDirectory, "programs.tsv"), "utf8"),
      ]);
      const programCount = files.filter((file) => file.endsWith(".asm")).length;
      lines.push(`- ${block}/${shader}: ${programCount} programs; ${properties.split("\n").join(" ")}`);
      for (const line of programs.split("\n").filter(Boolean)) {
        const [index, pass, stage, keywords] = line.split("\t");
        lines.push(`  - ${index}: ${pass ? `${pass}, ${stage}: ${keywords || "no keywords"}` : "unnamed"}`);
      }
    }
  const path = join(directory.root, "inventory.md");
  await writeFile(path, `${lines.join("\n")}\n`);
  return path;
};
