import type { Matrix4 } from "three";

import { CULLING_MATRIX_COLUMN_COUNT, CULLING_MATRIX_ELEMENT_COUNT } from "#src/culling/constants";
import { StorageBufferAttribute } from "three/webgpu";

// The matrices of a set of instances in one storage buffer, each one's elements in column order and the instances one
// After another, so the matrix read takes each column from four consecutive vec4s. Built once, since the instances stand still
export const createInstanceMatrixBuffer = (matrices: Matrix4[]): StorageBufferAttribute => {
  const array = new Float32Array(matrices.length * CULLING_MATRIX_ELEMENT_COUNT);
  for (const [index, matrix] of matrices.entries()) array.set(matrix.elements, index * CULLING_MATRIX_ELEMENT_COUNT);
  return new StorageBufferAttribute(array, CULLING_MATRIX_COLUMN_COUNT);
};
