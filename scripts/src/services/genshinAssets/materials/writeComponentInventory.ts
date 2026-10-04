import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const CHANNEL_NAMES = ["R", "G", "B", "A"];
const readNames = (directory: string): Promise<string[]> =>
  existsSync(directory) ? readdir(directory) : Promise.resolve([]);
// Everything a component's export holds, as a Markdown report beside it: each material's shader, texture slots and
// Values, each texture's size and what each channel spans, each mesh's vertices and the materials its renderers draw it
// With, and each shader the `shaders` step read. It is the scene derivation's first step: nothing is built before it is
// Inventoried (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export const writeComponentInventory = async (component: DerivedAssetComponent): Promise<string> => {
  const directory = getComponentDirectory(component);
  const [materials, { gameObjectDrawingMap }] = await Promise.all([
    readComponentMaterials(component),
    readSceneLayout(directory.layout),
  ]);
  const referencedIds = new Set([
    ...materials.flatMap(({ shaderPathId, textures }) => [
      shaderPathId,
      ...Object.values(textures).map(({ pathId }) => pathId),
    ]),
    ...[...gameObjectDrawingMap.values()].flatMap(({ materials: drawnMaterials }) => drawnMaterials),
  ]);
  const indexed = await readIndexedAssets(({ pathId }) => referencedIds.has(pathId));
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
  const textureDirectory = join(directory.assets, "Texture2D");
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
      meshMaterialsMap.set(mesh, (meshMaterialsMap.get(mesh) ?? new Set()).add(material));
  lines.push("", "## Meshes", "", "| Mesh | Vertices | Drawn with |", "| :-- | --: | :-- |");
  const meshDirectory = join(directory.assets, "Mesh");
  for (const name of await readNames(meshDirectory)) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const obj = await readFile(join(meshDirectory, name), "utf8");
    const vertexCount = obj.split("\n").filter((line) => line.startsWith("v ")).length;
    const mesh = basename(name, ".obj");
    lines.push(`| ${mesh} | ${vertexCount} | ${[...(meshMaterialsMap.get(mesh) ?? [])].join(", ")} |`);
  }
  lines.push("", "## Shaders", "");
  for (const block of (await readNames(directory.shaders)).filter((name) => name !== "raw"))
    for (const shader of await readNames(join(directory.shaders, block))) {
      const shaderDirectory = join(directory.shaders, block, shader);
      // oxlint-disable-next-line no-await-in-loop -- one shader's folder is read at a time
      const [files, properties] = await Promise.all([
        readdir(shaderDirectory),
        readFile(join(shaderDirectory, "properties.txt"), "utf8"),
      ]);
      const programCount = files.filter((file) => file.endsWith(".asm")).length;
      lines.push(`- ${block}/${shader}: ${programCount} programs; ${properties.split("\n").join(" ")}`);
    }
  const path = join(directory.root, "inventory.md");
  await writeFile(path, `${lines.join("\n")}\n`);
  return path;
};
