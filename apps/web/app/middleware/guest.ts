import { RoutePath } from "@esposter/shared";

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await useAuthSession();
  if (session.value) return navigateTo(RoutePath.Index);
  else return undefined;
});
