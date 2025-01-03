import { RoutePath } from "#shared/models/router/RoutePath";
import { authClient } from "@/services/auth/authClient";

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch);
  if (!session.value) return navigateTo(RoutePath.Login);
});
