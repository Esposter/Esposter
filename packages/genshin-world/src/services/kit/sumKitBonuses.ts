// The sum of each key the given bonuses give, each starting at the zero the caller gives it. A key one of them adds is
// Summed whether or not the zero lists it, so a bonus a passive adds reaches every read of the sum
export const sumKitBonuses = <Bonus extends Partial<Record<string, number>>>(
  zero: Bonus,
  bonuses: readonly (Partial<Bonus> | undefined)[],
): Bonus => {
  const sum: Partial<Record<string, number>> = { ...zero };
  for (const bonus of bonuses)
    for (const [key, value] of Object.entries(bonus ?? {})) sum[key] = (sum[key] ?? 0) + (value ?? 0);
  return sum as Bonus;
};
