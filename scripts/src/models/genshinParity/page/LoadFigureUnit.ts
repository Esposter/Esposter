// The unit a figure of a screen's load is printed in, and checked in: a count, a size in kilobytes, or a time in
// Milliseconds
export const LoadFigureUnit = { Count: "count", Kilobytes: "KB", Milliseconds: "ms" } as const;
export type LoadFigureUnit = (typeof LoadFigureUnit)[keyof typeof LoadFigureUnit];
