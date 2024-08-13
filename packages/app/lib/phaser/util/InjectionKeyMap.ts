export const InjectionKeyMap = {
  ParentContainer: Symbol("ParentContainer"),
  SceneKey: Symbol("SceneKey"),
} as const satisfies Record<string, symbol>;
