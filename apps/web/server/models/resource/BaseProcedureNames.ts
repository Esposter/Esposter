// The procedures the base group adds, exported for the router tests to read rather than restate. The group's object is
// Typed to exactly these names, so a procedure added to or dropped from it fails the build, not the test
export const BaseProcedureNames = [
  "createResource",
  "deleteResource",
  "generateReadContentPresignedUrl",
  "generateUploadContentPresignedUrl",
  "readResourceContent",
  "readResources",
  "saveResourceContent",
  "saveResourceContentDelta",
  "saveStagedResourceContent",
  "updateResource",
] as const;
