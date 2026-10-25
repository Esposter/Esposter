import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("countWriteAfterSettle", () => {
  const RULE = "count-write-after-settle/no-count-write-before-settle";
  const FIXTURES = [
    {
      name: "countStepBeforeAwaitOfMutation",
      source: `post.likeCount++; await $trpc.like.createLike.mutate(input);`,
      violations: 1,
    },
    {
      name: "countStepAfterAwaitOfMutation",
      source: `await $trpc.like.createLike.mutate(input); post.likeCount++;`,
      violations: 0,
    },
    {
      name: "countCompoundBeforeAwaitOfMutation",
      source: `post.likeCount += 1; await $trpc.like.createLike.mutate(input);`,
      violations: 1,
    },
    // The viewer's own mark is held exactly by the client, so a write to it before the server answers is correct
    {
      name: "viewerMarkBeforeAwaitOfMutation",
      source: `post.viewerLike = like; await $trpc.like.createLike.mutate(input);`,
      violations: 0,
    },
    { name: "countBeforeAwaitWithoutMutation", source: `post.likeCount++; await g();`, violations: 0 },
    // With no await at all, the count moves before any answer from the server, so it is still a write before settle
    {
      name: "countBeforeMutationWithoutAwait",
      source: `post.likeCount++; $trpc.like.createLike.mutate(input);`,
      violations: 1,
    },
    // The mutation's optimistic callback runs when the write is sent, before the server answers
    {
      name: "countInApplyOptimistic",
      source: `await executeMutation(() => $trpc.like.createLike.mutate(input), { applyOptimistic: () => { post.likeCount += 1; return noop; } });`,
      violations: 1,
    },
    // The success callback runs after the server answers, so a count set there is the read-back value
    {
      name: "countInOnSuccess",
      source: `await executeMutation(() => $trpc.like.createLike.mutate(input), { onSuccess: () => { post.likeCount = 1; } });`,
      violations: 0,
    },
    {
      name: "roleCountStepBeforeAwaitOfMutation",
      source: `roles.countsByTopRole[0].count++; await $trpc.like.createLike.mutate(input);`,
      violations: 1,
    },
    // A callback passed to a mutation is still the function's own call to one, so a write before its await is caught
    {
      name: "countBeforeAwaitOfNestedMutation",
      source: `post.likeCount++; await executeMutation(() => $trpc.like.createLike.mutate(input));`,
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
