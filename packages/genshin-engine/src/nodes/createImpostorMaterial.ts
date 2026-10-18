import type { ImpostorMaterialOptions } from "#src/models/nodes/ImpostorMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";

import { createDitherFadeNode } from "#src/nodes/createDitherFadeNode";
import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { DoubleSide } from "three";
import {
  cameraPosition,
  modelWorldMatrixInverse,
  positionGeometry,
  texture,
  transformNormal,
  transformNormalToView,
  uv,
  vec3,
  vec4,
} from "three/tsl";

const IMPOSTOR_ALPHA_TEST = 0.5;
// A baked impostor drawn on one card turned about its upright axis to face the eye, so a tree stays standing however
// The eye looks at it, and toon-lit by the baked normal turned with the card, so its crown shades as the mesh's does
// Through the hour. Its colour is the baked colour, wet as every surface is wet, cut where the bake saw nothing, and it
// Draws only its share of the pixels as it fades in over its mesh. In a shadow pass the card turns to the light, so it
// Casts the shape the sun sees. A card placed as one instance of a mesh drawn for many faces the eye in the instance's
// Own frame, and the instance then places it
export const createImpostorMaterial = ({
  fade,
  impostor,
  instanceMatrix,
  lightUniforms,
  rampTexture,
}: ImpostorMaterialOptions): ToonNodeMaterial => {
  const impostorMaterial = createToonMaterial({ isOutlined: false, lightUniforms, rampTexture });
  const eyeInModel = modelWorldMatrixInverse.mul(vec4(cameraPosition, 1));
  const eye = instanceMatrix ? instanceMatrix.inverse().mul(eyeInModel).xyz : eyeInModel.xyz;
  const forward = vec3(eye.x, 0, eye.z).normalize();
  const right = vec3(forward.z, 0, forward.x.negate());
  const cardPoint = right.mul(positionGeometry.x).add(vec3(0, positionGeometry.y, 0));
  impostorMaterial.positionNode = instanceMatrix ? instanceMatrix.mul(vec4(cardPoint, 1)).xyz : cardPoint;
  const albedo = texture(impostor.albedoTarget.texture, uv());
  const bakedNormal = texture(impostor.normalTarget.texture, uv()).xyz.mul(2).sub(1);
  const cardNormal = right
    .mul(bakedNormal.x)
    .add(vec3(0, bakedNormal.y, 0))
    .add(forward.mul(bakedNormal.z));
  impostorMaterial.normalNode = transformNormalToView(
    instanceMatrix ? transformNormal(cardNormal, instanceMatrix) : cardNormal,
  ).normalize();
  impostorMaterial.colorNode = albedo.rgb.mul(createWetDarkeningNode(lightUniforms));
  impostorMaterial.maskNode = albedo.a.greaterThan(IMPOSTOR_ALPHA_TEST).and(createDitherFadeNode(fade));
  impostorMaterial.side = DoubleSide;
  return impostorMaterial;
};
