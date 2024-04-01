export const InjectionKeyMap = {
  Scene: Symbol("Scene"),
  ParentContainer: Symbol("ParentContainer"),
} as const satisfies Record<string, symbol>;
