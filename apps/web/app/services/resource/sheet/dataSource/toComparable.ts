import type { AItemEntity } from "#shared/models/entity/AItemEntity";

// Everything but the identity an import mints, gathered into a plain object so an instance built by the import
// Compares with the parsed content a loaded sheet holds
export const toComparable = ({ createdAt: _createdAt, id: _id, updatedAt: _updatedAt, ...comparable }: AItemEntity) =>
  comparable;
