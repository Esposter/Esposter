import type { LoginPavingData } from "#src/models/login/LoginPavingData";
import type { LoginScrollRow } from "#src/models/login/LoginScrollRow";
import type { LoginWalkway } from "#src/models/login/LoginWalkway";
import type { LoginWalkwayFacade } from "#src/models/login/LoginWalkwayFacade";
import type { StoneMaterialOptions } from "genshin-engine";

import { LoginPartFamily } from "#src/models/login/LoginPartFamily";
import { loginStoneLight } from "#src/services/login/scene/loginStoneLight";
import { LOGIN_WALKWAY_RISE_DEPTH } from "#src/services/login/walkway/constants";
import { createLoginPaving } from "#src/services/login/walkway/createLoginPaving";
import { createLoginWalkwayPieces } from "#src/services/login/walkway/createLoginWalkwayPieces";
import { getLoginWalkwaySink } from "#src/services/login/walkway/getLoginWalkwaySink";
import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
import { createStoneMaterial } from "genshin-engine";
import { BatchedMesh, Matrix4 } from "three";
import { color } from "three/tsl";

// The walkway's row drawn as one batch, every piece of every copy an instance of its own, so each rises into place on its
// Own in one draw, and the toon outline, which places a batch's instances before it extrudes them, follows it. The batch
// Itself scrolls with the row, so only a rising piece's own place changes, which `update` sets each frame
export const createLoginWalkway = (
  walkway: LoginWalkway,
  row: LoginScrollRow,
  paving: LoginPavingData,
  stone: StoneMaterialOptions,
): LoginWalkwayFacade => {
  const material = createStoneMaterial(stone, loginStoneLight);
  // The walkway's tops painted in its textures' tones and carved with its paving, its rims tilted to the light
  const walkwayPaving = createLoginPaving(paving);
  material.colorNode = walkwayPaving.shade.mul(color(stone.albedo));
  material.normalNode = walkwayPaving.normalNode;
  const pieces = createLoginWalkwayPieces(walkway);
  const batch = new BatchedMesh(
    row.count * pieces.length,
    pieces.reduce((total, { geometry }) => total + geometry.getAttribute("position").count, 0),
    0,
    material,
  );
  batch.castShadow = true;
  batch.receiveShadow = true;
  // The batch's own bounding sphere is read once and never follows its instances as they move, so the batch is never
  // Culled as one; each piece is still culled on its own
  batch.frustumCulled = false;
  batch.userData[SCENE_FAMILY_KEY] = LoginPartFamily.Walkway;
  const instances = pieces.flatMap(({ depth, geometry, seed }) => {
    const geometryId = batch.addGeometry(geometry);
    return Array.from({ length: row.count }, (_value, copy) => ({
      copy,
      depth,
      instanceId: batch.addInstance(geometryId),
      seed,
    }));
  });
  const matrix = new Matrix4();
  return {
    batch,
    dispose: () => {
      for (const { geometry } of pieces) geometry.dispose();
      batch.dispose();
      material.dispose();
    },
    pieces,
    update: (walkwayScrolled, { cameraZ, doorAheadOfCamera }) => {
      batch.position.z = -walkwayScrolled;
      for (const { copy, depth, instanceId, seed } of instances) {
        const z = copy * row.length;
        const ahead = batch.position.z + z + depth - cameraZ;
        const sink = getLoginWalkwaySink(ahead, seed);
        // A piece stands only once it has begun to rise, so neither it nor its shadow shows before its turn, and once the
        // Door is due, none past it
        batch.setVisibleAt(
          instanceId,
          sink < LOGIN_WALKWAY_RISE_DEPTH && (doorAheadOfCamera === undefined || ahead < doorAheadOfCamera),
        );
        batch.setMatrixAt(instanceId, matrix.makeTranslation(0, -sink, z));
      }
    },
  };
};
