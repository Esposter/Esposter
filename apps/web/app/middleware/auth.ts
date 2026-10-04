import { RoutePath } from "@esposter/shared";

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await useAuthSession();
  if (session.value) return undefined;
  else return navigateTo(RoutePath.Login);
});
