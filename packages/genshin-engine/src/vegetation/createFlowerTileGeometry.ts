import { FLOWER_COLOR_ATTRIBUTE_NAME, FLOWER_MATRIX_ATTRIBUTE_NAMES } from "#src/vegetation/constants";
import { createFlowerGeometry } from "#src/vegetation/createFlowerGeometry";
import {
  Box3,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Sphere,
  Vector3,
} from "three";

const MATRIX_SIZE = 16;
const COLUMN_SIZE = 4;
const corner = new Vector3();
const column = new Vector3();
// One tile's flowers as the flower drawn once an instance, each instance's matrix and colour per-instance attributes
// Rather than an instanced mesh's own: three builds an instanced mesh's material for that mesh alone and sizes its
// Matrices' uniform array by its count, so every tile paid a node build and a program of its own. Read through the
// Attributes, every tile's flowers are one material and one program. The bounds hold every instance, each its card's
// Largest scale out from where it stands
export const createFlowerTileGeometry = (matrices: Float32Array, colors: Float32Array): InstancedBufferGeometry => {
  const flowerGeometry = createFlowerGeometry();
  const geometry = new InstancedBufferGeometry();
  geometry.setIndex(flowerGeometry.index);
  for (const [name, attribute] of Object.entries(flowerGeometry.attributes)) geometry.setAttribute(name, attribute);
  const matrixBuffer = new InstancedInterleavedBuffer(matrices, MATRIX_SIZE);
  for (const [index, name] of FLOWER_MATRIX_ATTRIBUTE_NAMES.entries())
    geometry.setAttribute(name, new InterleavedBufferAttribute(matrixBuffer, COLUMN_SIZE, index * COLUMN_SIZE));
  geometry.setAttribute(FLOWER_COLOR_ATTRIBUTE_NAME, new InstancedBufferAttribute(colors, 3));
  geometry.instanceCount = matrices.length / MATRIX_SIZE;
  const bounds = new Box3();
  let reach = 0;
  for (let offset = 0; offset < matrices.length; offset += MATRIX_SIZE) {
    bounds.expandByPoint(corner.fromArray(matrices, offset + 3 * COLUMN_SIZE));
    for (let axis = 0; axis < 3; axis++)
      reach = Math.max(reach, column.fromArray(matrices, offset + axis * COLUMN_SIZE).length());
  }
  geometry.boundingBox = bounds.expandByScalar(reach);
  geometry.boundingSphere = bounds.getBoundingSphere(new Sphere());
  return geometry;
};
