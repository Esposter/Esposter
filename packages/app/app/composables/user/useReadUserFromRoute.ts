import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export const useReadUserFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const route = useRoute();
  const userId = route.params.id as string;
  const user = await getResultAsync(() => $trpc.user.readUser.query(userId)).unwrapOr(undefined);
  if (!user)
    throw createError({ status: 404, statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.User, userId) });
  return user;
};
