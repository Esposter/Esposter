import type { Unsubscribable } from "@trpc/server/observable";

// A subscribable composable opens several subscriptions and hands back one teardown for all of them, which
// Otherwise means naming each handle twice — once where it is opened and once where it is closed. The two lists
// Are what drift: a subscription added to the first and forgotten in the second leaks for the lifetime of the
// Page, and nothing type-checks the pairing. Passing the handles straight through removes the names entirely.
export const getUnsubscribe =
  (...unsubscribables: Unsubscribable[]) =>
  () => {
    for (const unsubscribable of unsubscribables) unsubscribable.unsubscribe();
  };
