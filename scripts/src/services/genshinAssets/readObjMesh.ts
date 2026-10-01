import { readFile } from "node:fs/promises";

// An OBJ's vertex positions, its triangles as indices into them, and the group each triangle is drawn in (a submesh,
// one material each). AnimeStudio writes x negated, turning the game's left-handed axes into a right-handed file, so x
// Is negated back here and every vertex is in the game's own axes
export const readObjMesh = async (
  path: string,
): Promise<{ faceGroups: string[]; faces: [number, number, number][]; vertices: [number, number, number][] }> => {
  const text = await readFile(path, "utf8");
  const vertices: [number, number, number][] = [];
  const faces: [number, number, number][] = [];
  const faceGroups: string[] = [];
  let group = "";
  for (const line of text.split("\n")) {
    const [kind, ...parts] = line.trim().split(/\s+/u);
    if (kind === "v") vertices.push([-Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    else if (kind === "g") group = parts.join(" ");
    // A face's corners are `vertex/uv/normal`, one-based
    else if (kind === "f") {
      const [a = 0, b = 0, c = 0] = parts.map((part) => Number(part.split("/")[0]) - 1);
      faces.push([a, b, c]);
      faceGroups.push(group);
    }
  }
  return { faceGroups, faces, vertices };
};
