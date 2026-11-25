import { auth } from "#server/auth";
import { openHydrationCheckSession } from "#server/services/hydrationCheck/openHydrationCheckSession";
import { consumeRequestAddressRateLimit } from "#server/services/rateLimiter/consumeRequestAddressRateLimit";
import { createError, defineEventHandler, setCookie, setResponseStatus } from "nuxt/server";

// The deploy's hydration check signs in here to load every page as a reader does (`openHydrationCheckSession`). A
// Refused request answers not found, the answer a server without the route gives
export default defineEventHandler(async (event) => {
  if (!(await consumeRequestAddressRateLimit(event))) throw createError({ status: 429 });

  const sessionCookie = await openHydrationCheckSession(
    await auth.$context,
    event.req.headers.get("authorization") ?? "",
  );
  if (!sessionCookie) throw createError({ status: 404 });
  setCookie(event, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  setResponseStatus(event, 204);
});
