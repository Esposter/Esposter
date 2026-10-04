import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { jsonDateParse } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Matrix4, Quaternion, Ray, Vector3 } from "three";

// Far enough back that the path starts behind every part
const PATH_START = 100_000;
// Where a straight path through a component's exports, as the witness lays them out, passes through them: a line along
// Three's +z at a point across it, each part it pierces with the depths it enters and leaves at, nearest first. A
// Camera that glides along the path passes through exactly these, so a stand-in of ours that blocks the path anywhere
// Else is fatter than the part it stands for
export const readPathClearance = async (
  component: DerivedAssetComponent,
  [x, y]: readonly [number, number],
): Promise<{ depths: number[]; mesh: string; position: [number, number, number] }[]> => {
  const directory = getComponentDirectory(component);
  const layout = jsonDateParse<SceneLayout>(await readFile(join(directory.root, "witness.json"), "utf8"));
  const ray = new Ray(new Vector3(x, y, -PATH_START), new Vector3(0, 0, 1));
  const hit = new Vector3();
  const pierced: { depths: number[]; mesh: string; position: [number, number, number] }[] = [];
  for (const { mesh, position, rotation, scale } of layout.placements) {
    const path = join(directory.assets, "Mesh", `${mesh}.obj`);
    if (!existsSync(path)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const { faces, vertices } = await readObjMesh(path);
    const matrix = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    const world = vertices.map((vertex) => new Vector3(...toRightHanded(vertex)).applyMatrix4(matrix));
    const depths = faces.flatMap(([first, second, third]) => {
      const [a, b, c] = [world[first], world[second], world[third]];
      return a && b && c && ray.intersectTriangle(a, b, c, false, hit) ? [hit.z] : [];
    });
    if (depths.length > 0)
      pierced.push({
        depths: [...new Set(depths.map((depth) => Math.round(depth * 100) / 100))].toSorted(
          (first, second) => first - second,
        ),
        mesh,
        position,
      });
  }
  return pierced.toSorted(({ depths: [first = 0] }, { depths: [second = 0] }) => first - second);
};
