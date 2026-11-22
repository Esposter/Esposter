// The procedures the publish group adds, exported for the router tests to read rather than restate. View counting rides
// The publishable capability, so it is gated by the same seam
export const PublishProcedureNames = [
  "publishResource",
  "readPublishedResourceContent",
  "readPublishedVersionContent",
  "readResourcePublication",
  "readResourceViewCount",
  "unpublishResource",
] as const;
