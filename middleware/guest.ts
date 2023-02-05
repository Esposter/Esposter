import { RoutePath } from "@/models/router";

export default defineNuxtRouteMiddleware((to) => {
  const { status } = $(useSession());
  if (to.path === RoutePath.Login && status === "authenticated") return navigateTo(RoutePath.Index, { replace: true });
});
