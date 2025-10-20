import { authClient } from "@/services/auth/authClient";
import { RoutePath } from "@esposter/shared";

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch);
  if (session.value) return navigateTo(RoutePath.Index);
});
