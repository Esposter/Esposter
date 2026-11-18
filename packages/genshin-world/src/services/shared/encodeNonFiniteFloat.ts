// A `JSON.stringify` replacer writing a non-finite number as its token, which `materialFloatSchema` reads back as the
// Number it stands for. JSON would write it as `null`, and a `null` where a number belongs is refused on every read
export const encodeNonFiniteFloat = (_key: string, value: unknown): unknown =>
  typeof value === "number" && !Number.isFinite(value) ? String(value) : value;
