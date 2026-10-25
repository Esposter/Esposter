import { unquote } from "#src/services/fleet/unquote";

const SEQUENCE_REGEX = /^\[(?<items>.*)\]$/u;

// A field is a flow sequence of strings (`[a, "b"]`) or one string, quoted or bare. A sequence field given as a bare
// String fails the schema, so a mistyped field is loud rather than silently empty
export const readFieldValue = (value: string): string | string[] => {
  const items = SEQUENCE_REGEX.exec(value)?.groups?.items;
  return items === undefined
    ? unquote(value.trim())
    : items
        .split(",")
        .map((item) => unquote(item.trim()))
        .filter((item) => item !== "");
};
