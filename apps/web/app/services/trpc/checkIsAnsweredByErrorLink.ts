import { ANSWERED_ERROR_CODES } from "@/services/trpc/constants";
import { TRPCClientError } from "@trpc/client";

export const checkIsAnsweredByErrorLink = (error: unknown) =>
  error instanceof TRPCClientError && ANSWERED_ERROR_CODES.has(String(error.data?.code));
