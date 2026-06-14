import { RoutePath } from "@esposter/shared";
// https://github.com/Baroshem/nuxt-security/issues/527
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === from.path) return;

  const messagesBasePath = RoutePath.Messages("").replace(/\/$/u, "");
  const isFromMessages = from.path.startsWith(messagesBasePath);
  const isToMessages = to.path.startsWith(messagesBasePath);
  // Only act when crossing the messages boundary; navigating within messages or within normal pages is a no-op.
  if (isFromMessages === isToMessages) return;
  // Force a full browser navigation so the Nuxt server gets a fresh request.
  window.location.replace(to.fullPath);
});
