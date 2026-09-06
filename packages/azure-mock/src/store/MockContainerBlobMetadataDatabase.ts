// Map<`${container}/${blob}`, metadata> — the user-defined name/value pairs a blob carries, kept beside the
// Content map rather than inside it so seeding content straight into MockContainerDatabase keeps working.
// Metadata is replaced wholesale by a write, never merged, which is the service's own semantics: an upload
// That names no metadata clears whatever the previous write set.
export const MockContainerBlobMetadataDatabase: Map<string, Record<string, string>> = new Map<
  string,
  Record<string, string>
>();
