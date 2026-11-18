import { getReferencingKeysByParentName } from "#src/services/realtime/getReferencingKeysByParentName";

// Read once per isolate: the foreign-key graph is the schema's, and it does not change while the isolate runs
export const tableNameReferencingKeysMap = getReferencingKeysByParentName();
