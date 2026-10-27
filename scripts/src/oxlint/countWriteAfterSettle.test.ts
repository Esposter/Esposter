import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("countWriteAfterSettle", () => {
  const LIKE_COUNT = "likeCount";
  const MUTATE = "mutate";
  const RULE = "count-write-after-settle/no-count-write-before-settle";
  const FIXTURES = [
    { name: "countStepBeforeAwaitOfMutation", source: `a.${LIKE_COUNT}++; await x.a.b.${MUTATE}(c);`, violations: 1 },
    { name: "countStepAfterAwaitOfMutation", source: `await x.a.b.${MUTATE}(c); a.${LIKE_COUNT}++;`, violations: 0 },
    {
      name: "countCompoundBeforeAwaitOfMutation",
      source: `a.${LIKE_COUNT} += 1; await x.a.b.${MUTATE}(c);`,
      violations: 1,
    },
    // The viewer's own mark is held exactly by the client, so a write to it before the server answers is correct
    { name: "viewerMarkBeforeAwaitOfMutation", source: `a.viewerLike = c; await x.a.b.${MUTATE}(c);`, violations: 0 },
    { name: "countBeforeAwaitWithoutMutation", source: `a.${LIKE_COUNT}++; await g();`, violations: 0 },
    // With no await at all, the count moves before any answer from the server, so it is still a write before settle
    { name: "countBeforeMutationWithoutAwait", source: `a.${LIKE_COUNT}++; x.a.b.${MUTATE}(c);`, violations: 1 },
    // The mutation's optimistic callback runs when the write is sent, before the server answers
    {
      name: "countInApplyOptimistic",
      source: `await g(() => x.a.b.${MUTATE}(c), { applyOptimistic: () => { a.${LIKE_COUNT} += 1; return h; } });`,
      violations: 1,
    },
    // The success callback runs after the server answers, so a count set there is the read-back value
    {
      name: "countInOnSuccess",
      source: `await g(() => x.a.b.${MUTATE}(c), { onSuccess: () => { a.${LIKE_COUNT} = 1; } });`,
      violations: 0,
    },
    {
      name: "roleCountStepBeforeAwaitOfMutation",
      source: `a.countsByTopRole[0].count++; await x.a.b.${MUTATE}(c);`,
      violations: 1,
    },
    // A callback passed to a mutation is still the function's own call to one, so a write before its await is caught
    {
      name: "countBeforeAwaitOfNestedMutation",
      source: `a.${LIKE_COUNT}++; await g(() => x.a.b.${MUTATE}(c));`,
      violations: 1,
    },
  ];
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "countWriteAfterSettle",
    rules: [RULE],
    wrapSource: (source) => `export const f = async () => { ${source} };`,
  });
});
