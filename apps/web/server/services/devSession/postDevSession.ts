import { auth } from "#server/auth";
import { openDevSession } from "#server/services/devSession/openDevSession";
import { createError, defineEventHandler, setCookie, setResponseStatus } from "nuxt/server";

// A refused request answers not found, which is the answer a server without the route gives, so a refusal reveals no
// More about the server than a missing route does. The cookie's value is passed raw: `setCookie` URI-encodes it, the way
// Better-auth's own signed cookies are encoded, and a pre-encoded value would be encoded twice
export default defineEventHandler(async (event) => {
  const devSessionCookie = await openDevSession(await auth.$context);
  if (!devSessionCookie) throw createError({ statusCode: 404 });
  setCookie(event, devSessionCookie.name, devSessionCookie.value, devSessionCookie.attributes);
  setResponseStatus(event, 204);
});
