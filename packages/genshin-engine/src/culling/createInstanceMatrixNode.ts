import type { Node, StorageBufferAttribute } from "three/webgpu";

import { CULLING_MATRIX_COLUMN_COUNT } from "#src/culling/constants";
import { mat4, storage, uint } from "three/tsl";

// The matrix of the instance at an index, read from the storage `createInstanceMatrixBuffer` packs it in: its columns are
// The four consecutive vec4s from the instance's first. The index is a float node, so a survivor's index reads it as an
// Instance's own does
export const createInstanceMatrixNode = (attribute: StorageBufferAttribute, instance: Node<"float">): Node<"mat4"> => {
  const columns = storage(attribute, "vec4", attribute.count).toReadOnly();
  const firstColumn = uint(instance).mul(uint(CULLING_MATRIX_COLUMN_COUNT));
  const column = (offset: number) => columns.element(firstColumn.add(uint(offset)));
  return mat4(column(0), column(1), column(2), column(3));
};
