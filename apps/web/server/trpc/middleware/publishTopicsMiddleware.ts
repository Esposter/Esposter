import { readSession } from "#server/services/auth/readSession";
import { publishTopics } from "#server/services/realtime/publishTopics";
import { middleware } from "#server/trpc";
import { getResultAsync, noop } from "@esposter/shared";

// A mutation's topics are published once it resolves, so a reader never refetches ahead of the write, and never for one
// That failed. Best-effort: the write has committed, so a failed publish costs readers one refresh, never the mutation.
// It runs ahead of the rate limit on a public procedure, so the session is read here when no middleware has read it
export const publishTopicsMiddleware = middleware(async ({ ctx, getRawInput, meta, next, path, type }) => {
  const result = await next();
  if (!result.ok || type !== "mutation" || !meta?.topics) return result;

  const { topics } = meta;
  await getResultAsync(async () => {
    const getSessionPayload = ctx.getSessionPayload ?? (await readSession(ctx.headers));
    await publishTopics(
      topics({ input: await getRawInput(), output: result.data, userId: getSessionPayload?.user.id }),
    );
  }).match(noop, (error) => {
    console.error(`Failed to publish the topics of "${path}":`, error);
  });
  return result;
});
