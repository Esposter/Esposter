import { TRPCClientError } from "@trpc/client";

// Whether a call was refused as a conflict: the server answers a save sent under an etag the blob no longer carries, or a
// Lease another session took, with CONFLICT rather than with a failure
export const checkIsTRPCConflict = (error: unknown) =>
  error instanceof TRPCClientError && error.data?.code === "CONFLICT";
