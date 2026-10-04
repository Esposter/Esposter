import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";

export const useReadUser = (userId: string) => {
  const { $trpc } = useNuxtApp();
  // Only a genuine "user not found" becomes a 404 — transport/server failures propagate rather than being
  // Masked as an absent user
  return getResultAsync(() => $trpc.user.readUser.query(userId)).match(
    (newUser) => newUser,
    (error) => {
      if (error instanceof TRPCClientError && error.data?.code === "NOT_FOUND")
        throw createError({ status: 404, statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.User, userId) });
      throw error;
    },
  );
};
