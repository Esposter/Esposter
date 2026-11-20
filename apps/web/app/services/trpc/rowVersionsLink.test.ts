import type { Operation } from "@trpc/client";

import { ROW_VERSIONS_HEADER } from "#shared/services/realtime/constants";
import { formatRowVersionHeaderValue } from "#shared/services/realtime/formatRowVersionHeaderValue";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { rowVersionsLink } from "#src/services/trpc/rowVersionsLink";
import { usersInAuth } from "@esposter/db-schema";
import { observable, observableToPromise } from "@trpc/server/observable";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(rowVersionsLink, () => {
  const path = "post.createPost";
  const table = getTableName(usersInAuth);

  test("hands a mutation's changed rows, named by its response, to the mutation that made the call", async () => {
    expect.hasAssertions();

    const rowVersion = { key: { id: v7() }, table, version: 0 };
    const headers = new Headers({ [ROW_VERSIONS_HEADER]: formatRowVersionHeaderValue(path, rowVersion) });
    const op = { context: {}, id: 1, input: undefined, path, signal: null, type: "mutation" } satisfies Operation;
    const link = rowVersionsLink({});
    const { rowVersions } = await collectRowVersions(() =>
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

    expect(rowVersions).toStrictEqual([rowVersion]);
  });

  test("leaves a query's answer out of the collector", async () => {
    expect.hasAssertions();

    const rowVersion = { key: { id: v7() }, table, version: 0 };
    const headers = new Headers({ [ROW_VERSIONS_HEADER]: formatRowVersionHeaderValue(path, rowVersion) });
    const op = { context: {}, id: 1, input: undefined, path, signal: null, type: "query" } satisfies Operation;
    const link = rowVersionsLink({});
    const { rowVersions } = await collectRowVersions(() =>
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

    expect(rowVersions).toStrictEqual([]);
  });

  test("passes a mutation through unchanged when no collector is set", async () => {
    expect.hasAssertions();

    const value = { context: {}, result: { data: true } };
    const op = { context: {}, id: 1, input: undefined, path, signal: null, type: "mutation" } satisfies Operation;
    const link = rowVersionsLink({});
    const result = await observableToPromise(
      link({
        next: () =>
          observable((observer) => {
            observer.next(value);
            observer.complete();
          }),
        op,
      }),
    );

    expect(result).toStrictEqual(value);
  });
});
