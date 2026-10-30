// The name each component is exported under by the components' barrel, by the path of its `Index.vue` from the barrel
export const getComponentNames = (barrel: string): Map<string, string> =>
  new Map(
    Array.from(
      barrel.matchAll(/^export \{ default as (?<name>\w+) \} from "\.\/(?<path>[^"]+)";$/gmu),
      ({ groups }) => [groups?.path ?? "", groups?.name ?? ""],
    ),
  );
