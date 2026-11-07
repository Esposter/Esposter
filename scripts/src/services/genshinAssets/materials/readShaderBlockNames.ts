import { readdir } from "node:fs/promises";

// The shader blocks of a component's shaders folder: every folder in it but `raw`, which holds the shaders exported
// Nameless. A file beside them, such as the provenance stamp the shaders step writes, is not a block
export const readShaderBlockNames = async (shadersDirectory: string): Promise<string[]> =>
  (await readdir(shadersDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== "raw")
    .map(({ name }) => name);
