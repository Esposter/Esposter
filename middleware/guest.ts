export default defineNuxtRouteMiddleware((to) => {
  const { status } = $(useSession());
  if (to.path === LOGIN_PATH && status === "authenticated") return navigateTo(INDEX_PATH, { replace: true });
});
