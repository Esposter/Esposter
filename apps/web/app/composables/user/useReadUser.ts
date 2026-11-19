import { createEntityNotFoundError } from "#src/services/shared/error/createEntityNotFoundError";
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
        throw createEntityNotFoundError(DatabaseEntityType.User, userId);
      throw error;
    },
  );
};
