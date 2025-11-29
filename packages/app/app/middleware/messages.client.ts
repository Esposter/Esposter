import { RoutePath } from "@esposter/shared";
// https://github.com/Baroshem/nuxt-security/issues/527
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === from.path) return;

  const messagesBasePath = RoutePath.Messages("").replace(/\/$/, "");
  const isFromMessages = from.path.startsWith(messagesBasePath);
  const isToMessages = to.path.startsWith(messagesBasePath);
  // We only need to act if the user is *crossing* the boundary
  // If they are navigating from one messages page to another, or from one
  // normal page to another, we don't need to do anything
  if (isFromMessages === isToMessages) return;
  // Force a full browser navigation to the destination URL,
  // triggering a request to the Nuxt server
  window.location.replace(to.fullPath);
});
