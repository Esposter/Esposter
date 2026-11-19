// The components a referenced screen draws: the screen's own component, and every component it reaches through its
// Imports. A screen that has its own fixture and parity entry is judged by its own reference, so the walk stops at it
// Rather than taking what it draws into the screen that mounts it. A component a spec names beside its reference is
// Held as well
export const findHeldComponents = (
  imports: ReadonlyMap<string, readonly string[]>,
  seeds: ReadonlySet<string>,
  screens: ReadonlySet<string>,
  cited: ReadonlySet<string>,
): Set<string> => {
  const reached = new Set<string>();
  const queue = [...seeds];
  for (const path of queue) {
    if (reached.has(path)) continue;
    reached.add(path);
    for (const target of imports.get(path) ?? []) if (!screens.has(target) || seeds.has(target)) queue.push(target);
  }
  return new Set([...reached, ...cited]);
};
