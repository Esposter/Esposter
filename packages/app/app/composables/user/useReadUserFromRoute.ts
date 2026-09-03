import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";

export const useReadUserFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const userId = currentRoute.value.params.id as string;
  // Only a genuine "user not found" becomes a 404 — transport/server failures propagate rather than being
  // Masked as an absent user
  const user = await getResultAsync(() => $trpc.user.readUser.query(userId)).match(
    (newUser) => newUser,
    (error) => {
      if (error instanceof TRPCClientError && error.data?.code === "NOT_FOUND")
        throw createError({ status: 404, statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.User, userId) });
      throw error;
    },
  );
  // The readUser query projects only the public profile columns (no id), so hand the route's userId
  // Back to the callers that key achievements/posts by it
  return { user, userId };
};
