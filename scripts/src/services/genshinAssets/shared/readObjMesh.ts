import { readFile } from "node:fs/promises";

// An OBJ's vertex positions, its triangles as indices into them, the group each triangle is drawn in (a submesh, one
// Material each), its texture coordinates and each triangle's as indices into them. AnimeStudio writes x negated,
// Turning the game's left-handed axes into a right-handed file, so x is negated back here and every vertex is in the
// Game's own axes
export const readObjMesh = async (
  path: string,
): Promise<{
  faceGroups: string[];
  faces: [number, number, number][];
  faceUvs: [number, number, number][];
  uvs: [number, number][];
  vertices: [number, number, number][];
}> => {
  const text = await readFile(path, "utf8");
  const vertices: [number, number, number][] = [];
  const uvs: [number, number][] = [];
  const faces: [number, number, number][] = [];
  const faceUvs: [number, number, number][] = [];
  const faceGroups: string[] = [];
  let group = "";
  for (const line of text.split("\n")) {
    const [kind, ...parts] = line.trim().split(/\s+/u);
    if (kind === "v") vertices.push([-Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    else if (kind === "vt") uvs.push([Number(parts[0]), Number(parts[1])]);
    else if (kind === "g") group = parts.join(" ");
    // A face's corners are `vertex/uv/normal`, one-based
    else if (kind === "f") {
      const corners = parts.map((part) => part.split("/").map((index) => Number(index) - 1));
      const [[a = 0, aUv = 0] = [], [b = 0, bUv = 0] = [], [c = 0, cUv = 0] = []] = corners;
      faces.push([a, b, c]);
      faceUvs.push([aUv, bUv, cUv]);
      faceGroups.push(group);
    }
  }
  return { faceGroups, faces, faceUvs, uvs, vertices };
};
