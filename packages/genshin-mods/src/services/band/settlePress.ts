import type { EngineInterface } from "claude-code";

// The engine's press slot takes no promise, so a press settles its action here.
// A rejection is shown as a toast, never as a lost error.
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function settlePress($: EngineInterface, action: () => Promise<unknown>): Promise<void> {
  const [outcome] = await Promise.allSettled([action()]);
  if (outcome.status === "rejected") $.ui.toast(`The action failed: ${String(outcome.reason)}.`);
}
