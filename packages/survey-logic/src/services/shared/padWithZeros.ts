// A number as text, padded with zeros on the left to a width, as the fixed-width fields of a date text are written
export const padWithZeros = (value: number, length: number): string => String(value).padStart(length, "0");
