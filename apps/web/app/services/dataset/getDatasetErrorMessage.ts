import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";
import { TRPCClientError } from "@trpc/client";

// A missing source is the one failure the owner fixes in place, so it says how rather than echoing the id
export const getDatasetErrorMessage = (error: Error) =>
  error instanceof TRPCClientError && error.data?.code === "NOT_FOUND"
    ? getMissingResourceMessage("source")
    : error.message;
