// The name each component is exported under by the components' barrel, by the path of its `Index.vue` from the barrel
export const getComponentNames = (barrel: string): Map<string, string> =>
  new Map(
    [...barrel.matchAll(/^export \{ default as (?<name>\w+) \} from "\.\/(?<path>[^"]+)";$/gmu)].map(({ groups }) => [
      groups?.path ?? "",
      groups?.name ?? "",
    ]),
  );
