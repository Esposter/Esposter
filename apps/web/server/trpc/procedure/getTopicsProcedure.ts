import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";
import type { Topic } from "@esposter/db-schema";
import type { TRPCProcedureBuilder } from "@trpc/server";
import type { Overwrite, Simplify } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";

interface TopicsOptions<TContextOverrides, TInput> {
  ctx: Simplify<Overwrite<Context, TContextOverrides>>;
  input: TInput;
  // The resolver's result, for a topic only the result names: a created row's id, or the people a list shows. A
  // Middleware never sees the resolver's output type, so a topic read from it parses it
  output: unknown;
}

// A procedure that declares its topics (the live queries design): what a query's result reads, or what a mutation
// Changed. The builder is the procedure's own, so the topics read its parsed input and its context as the resolver
// Does. A mutation's topics are published once it ends, whether it resolved or failed, since a write may land before a
// Failure. The publish is best-effort: the write has committed, so a failed publish costs readers one refresh, never the mutation
export const getTopicsProcedure = <
  TContextOverrides extends { user: null | User },
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
  TCaller extends boolean,
  TErrorShape,
>(
  builder: TRPCProcedureBuilder<
    Context,
    Meta,
    TContextOverrides,
    TInputIn,
    TInputOut,
    TOutputIn,
    TOutputOut,
    TCaller,
    TErrorShape
  >,
  getTopics: (options: TopicsOptions<TContextOverrides, TInputOut>) => Topic[],
) =>
  builder.meta({ topics: true }).use(async ({ ctx, input, next, path, type }) => {
    // Taken before the read runs, so a publish that lands after it reaches the watch even when the answer misses it
    const readAt = Date.now();
    const result = await next();
    // A query's topics travel back with its answer, so the client watches what the read it rendered came from. A failed
    // Query has no answer to send them with
    if (type === "query") {
      if (result.ok) {
        const topics = getTopics({ ctx, input, output: result.data });
        if (topics.length > 0)
          ctx.responseHeaders.append(TOPICS_HEADER, formatTopicsHeaderValue(path, { readAt, topics }));
      }
      return result;
    }
    if (type !== "mutation") return result;

    // A failed mutation has no output, so a topic only its output names is left out of its publish, as a best-effort one
    await publishTopicsBestEffort(
      () => getTopics({ ctx, input, output: result.ok ? result.data : undefined }),
      `Failed to publish the topics of "${path}":`,
    );
    return result;
  });
