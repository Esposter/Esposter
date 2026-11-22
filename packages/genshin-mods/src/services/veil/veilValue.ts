import { veilText } from "./veilText";

// A tool's output is whatever the tool recorded, so every string inside it is veiled and its shape is kept, which is
// What the engine draws the result from
export const veilValue = (value: unknown): unknown => {
  if (typeof value === "string") return veilText(value);
  else if (Array.isArray(value)) return value.map((item) => veilValue(item));
  else if (value !== null && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, veilValue(item)]));
  else return value;
};
