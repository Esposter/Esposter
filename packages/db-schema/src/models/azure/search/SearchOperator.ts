export enum SearchOperator {
  // A collection is non-empty. It tests the collection itself rather than a value in it, so it is the one
  // Operator that carries no value
  arrayAny = "arrayAny",
  arrayContains = "arrayContains",
}
