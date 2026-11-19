import { BARREL_EXPORT_REGEX } from "#src/services/genshinParity/componentReference/constants";
import { posix } from "node:path";

// A components barrel's named exports, each mapped to the component file it re-exports, as repository paths
export const readComponentBarrel = (barrelPath: string, text: string): Map<string, string> =>
  new Map(
    Array.from(
      text.matchAll(BARREL_EXPORT_REGEX),
      ({ groups }) => [groups?.name ?? "", posix.join(posix.dirname(barrelPath), groups?.file ?? "")] as const,
    ),
  );
