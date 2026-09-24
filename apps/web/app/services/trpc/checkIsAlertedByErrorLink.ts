import { ALERTED_ERROR_CODES } from "@/services/trpc/constants";
import { TRPCClientError } from "@trpc/client";

export const checkIsAlertedByErrorLink = (error: unknown) =>
  error instanceof TRPCClientError && ALERTED_ERROR_CODES.has(String(error.data?.code));
