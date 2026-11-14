import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Topic } from "@esposter/db-schema";
import type { TRPCProcedureBuilder } from "@trpc/server";
import type { Overwrite, Simplify } from "@trpc/server/unstable-core-do-not-import";

import { publishTopics } from "#server/services/realtime/publishTopics";
import { getResultAsync, noop } from "@esposter/shared";

export interface TopicsOptions<TContextOverrides, TInput> {
  ctx: Simplify<Overwrite<Context, TContextOverrides>>;
  input: TInput;
  // A mutation's result, for a topic only the write names, such as a created row's id. A middleware never sees the
  // Resolver's output type, so a topic read from it parses it. A query's topics never read it
  output: unknown;
}

// A procedure that declares its topics (the live queries design): what a query's result reads, or what a mutation
// Changed. The builder is the procedure's own, so the topics read its parsed input and its context as the resolver
// Does. A mutation's topics are published once it resolves, never for one that failed, and best-effort: the write has
// Committed, so a failed publish costs readers one refresh, never the mutation
export const getTopicsProcedure = <
  TContextOverrides extends { getSessionPayload: GetSessionPayload | null },
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
    const result = await next();
    if (!result.ok || type !== "mutation") return result;

    await getResultAsync(() => publishTopics(getTopics({ ctx, input, output: result.data }))).match(noop, (error) => {
      console.error(`Failed to publish the topics of "${path}":`, error);
    });
    return result;
  });
