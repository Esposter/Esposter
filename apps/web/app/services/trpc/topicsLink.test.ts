import type { Operation } from "@trpc/client";

import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { collectTopics } from "@/services/realtime/collectTopics";
import { topicsLink } from "@/services/trpc/topicsLink";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { observable, observableToPromise } from "@trpc/server/observable";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(topicsLink, () => {
  test("hands a query's topics, named by its response, to the read that made the call", async () => {
    expect.hasAssertions();

    const path = "post.readPost";
    const topic = getTopic(TopicKind.Post, v7());
    const headers = new Headers({ [TOPICS_HEADER]: formatTopicsHeaderValue(path, [topic]) });
    const op = { context: {}, id: 1, input: undefined, path, signal: null, type: "query" } satisfies Operation;
    const link = topicsLink({});
    const { topics } = await collectTopics(() =>
      observableToPromise(
        link({
          next: () =>
            observable((observer) => {
              observer.next({ context: { response: new Response(null, { headers }) }, result: { data: true } });
              observer.complete();
            }),
          op,
        }),
      ),
    );

    expect(topics).toStrictEqual([topic]);
  });
});
