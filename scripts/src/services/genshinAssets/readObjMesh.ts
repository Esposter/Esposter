import { readFile } from "node:fs/promises";

// An OBJ's vertex positions and its triangles as indices into them. AnimeStudio writes x negated, turning the game's
// Left-handed axes into a right-handed file, so x is negated back here and every vertex is in the game's own axes
export const readObjMesh = async (
  path: string,
): Promise<{ faces: [number, number, number][]; vertices: [number, number, number][] }> => {
  const text = await readFile(path, "utf8");
  const vertices: [number, number, number][] = [];
  const faces: [number, number, number][] = [];
  for (const line of text.split("\n")) {
    const [kind, ...parts] = line.trim().split(/\s+/u);
    if (kind === "v") vertices.push([-Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    // A face's corners are `vertex/uv/normal`, one-based
    else if (kind === "f") {
      const [a = 0, b = 0, c = 0] = parts.map((part) => Number(part.split("/")[0]) - 1);
      faces.push([a, b, c]);
    }
  }
  return { faces, vertices };
};
