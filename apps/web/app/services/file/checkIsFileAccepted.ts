import { normalizeString } from "@esposter/shared";

// An `accept` attribute read the way the browser's own picker reads it: a comma-separated list of extensions,
// Wildcard types and exact types, where an empty one accepts everything. A drop bypasses the picker, so the page
// Applies it itself
export const checkIsFileAccepted = ({ name, type }: Pick<File, "name" | "type">, accept = "") => {
  const acceptTokens = accept
    .split(",")
    .map((token) => normalizeString(token).toLowerCase())
    .filter(Boolean);
  return (
    acceptTokens.length === 0 ||
    acceptTokens.some((token) => {
      if (token.startsWith(".")) return name.toLowerCase().endsWith(token);
      else if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      else return type === token;
    })
  );
};
