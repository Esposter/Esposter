import type { UsageTotal } from "#src/models/usage/UsageTotal";

// Adds one turn into the total under its key, keeping the first turn's identity (its bucket, family, path and prompt)
export const addUsageTurn = <TUsage extends UsageTotal>(
  usages: Map<string, TUsage>,
  key: string,
  turn: TUsage,
): void => {
  const usage = usages.get(key);
  if (usage === undefined) {
    usages.set(key, turn);
    return;
  }
  usages.set(key, {
    ...usage,
    cacheRead: usage.cacheRead + turn.cacheRead,
    cacheWrite: usage.cacheWrite + turn.cacheWrite,
    context: usage.context + turn.context,
    output: usage.output + turn.output,
    turns: usage.turns + turn.turns,
  });
};
