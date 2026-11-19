import { scopedBy } from "#server/services/db/scopedBy";

// The row with this id that the caller owns, the where-predicate every ownership guard uses
export const ownedBy = scopedBy("userId");
