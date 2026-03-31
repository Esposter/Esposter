export const formatNullable = (value: null | number | string) => (value === null ? "—" : String(value));
