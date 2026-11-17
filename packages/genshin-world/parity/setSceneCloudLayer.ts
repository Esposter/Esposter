import type { SceneContext } from "#src/models/scene/SceneContext";
import type { CloudLayerUniforms } from "genshin-engine";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { NoColorSpace, RepeatWrapping, TextureLoader } from "three";
import { TextureNode, UniformNode } from "three/webgpu";

// The scene's cloud layer drawn at the sky's coverage given, which its clouds share, with the settings given, each a
// Uniform's value by its name (a number, or a vector's or a colour's components), and with the textures given in place
// Of its own, each by its slot and the URL it is served at: a tool solves the layer's settings on a reference, and the
// Witness draws it over the game's own textures to read what the layer can recover before ours stand in for them
export const setSceneCloudLayer = async (
  context: SceneContext | undefined,
  {
    coverage,
    settings = {},
    textures = {},
  }: {
    coverage?: number;
    settings?: Partial<Record<keyof CloudLayerUniforms, number | number[]>>;
    textures?: Partial<Record<keyof CloudLayerUniforms, string>>;
  },
): Promise<void> => {
  const cloudLayer = context?.cloudLayer;
  if (!cloudLayer || !context.sky)
    throw new InvalidOperationError(Operation.Read, "scene", "no sky and cloud layer handed on");
  if (coverage !== undefined) context.sky.cloudCoverage.value = coverage;
  for (const [name, value] of Object.entries(settings)) {
    const node = cloudLayer[name];
    if (!(node instanceof UniformNode) || value === undefined)
      throw new InvalidOperationError(Operation.Update, name, "not a setting of the cloud layer");
    if (typeof value === "number") node.value = value;
    else if (typeof node.value === "object" && "fromArray" in node.value) node.value.fromArray(value);
  }
  const loader = new TextureLoader();
  await Promise.all(
    Object.entries(textures).map(async ([slot, url]) => {
      const node = cloudLayer[slot];
      if (!(node instanceof TextureNode) || url === undefined)
        throw new InvalidOperationError(Operation.Update, slot, "not a texture of the cloud layer");
      const loaded = await loader.loadAsync(url);
      loaded.colorSpace = NoColorSpace;
      loaded.wrapS = RepeatWrapping;
      loaded.wrapT = RepeatWrapping;
      node.value = loaded;
    }),
  );
};
