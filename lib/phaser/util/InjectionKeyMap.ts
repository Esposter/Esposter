export const InjectionKeyMap = {
  Game: Symbol("Game"),
  SceneKey: Symbol("SceneKey"),
  ParentContainer: Symbol("ParentContainer"),
} as const satisfies Record<string, symbol>;
