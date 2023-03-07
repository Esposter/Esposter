import { RoutePath } from "@/models/router/RoutePath";

export default defineNuxtRouteMiddleware((to) => {
  const { status } = useSession();
  if (to.path === RoutePath.Login && status.value === "authenticated")
    return navigateTo(RoutePath.Index, { replace: true });
});
