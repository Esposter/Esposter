import type { ObjMesh } from "#src/models/genshinAssets/shared/ObjMesh";

import { readFile } from "node:fs/promises";

// AnimeStudio writes x negated, turning the game's left-handed axes right-handed, so x is negated back here.
// Every vertex is then in the game's own axes
export const readObjMesh = async (path: string): Promise<ObjMesh> => {
  const text = await readFile(path, "utf8");
  const vertices: [number, number, number][] = [];
  const uvs: [number, number][] = [];
  const faces: [number, number, number][] = [];
  const faceUvs: [number, number, number][] = [];
  const faceGroups: string[] = [];
  const normals: [number, number, number][] = [];
  const faceNormals: [number, number, number][] = [];
  let group = "";
  for (const line of text.split("\n")) {
    const [kind, ...parts] = line.trim().split(/\s+/u);
    if (kind === "v") vertices.push([-Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    else if (kind === "vt") uvs.push([Number(parts[0]), Number(parts[1])]);
    else if (kind === "vn") normals.push([-Number(parts[0]), Number(parts[1]), Number(parts[2])]);
    else if (kind === "g") group = parts.join(" ");
    // A face's corners are `vertex/uv/normal`, one-based
    else if (kind === "f") {
      const corners = parts.map((part) => part.split("/").map((index) => Number(index) - 1));
      const [
        [a = 0, aUv = 0, aNormal = 0] = [],
        [b = 0, bUv = 0, bNormal = 0] = [],
        [c = 0, cUv = 0, cNormal = 0] = [],
      ] = corners;
      faces.push([a, b, c]);
      faceUvs.push([aUv, bUv, cUv]);
      faceNormals.push([aNormal, bNormal, cNormal]);
      faceGroups.push(group);
    }
  }
  return { faceGroups, faceNormals, faces, faceUvs, normals, uvs, vertices };
};
