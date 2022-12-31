import { LOGIN_PATH } from "@/util/constants.common";

export default defineNuxtRouteMiddleware((to) => {
  const { status } = $(useSession());
  if (status === "unauthenticated") return navigateTo(LOGIN_PATH, { replace: true });
});
