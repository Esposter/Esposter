import { INDEX_PATH, LOGIN_PATH } from "@/util/constants.common";

export default defineNuxtRouteMiddleware((to) => {
  const { status } = $(useSession());
  if (to.path === LOGIN_PATH && status === "authenticated") return navigateTo(INDEX_PATH, { replace: true });
});
