// Where a text's lines sit against the point they are drawn at: from its start, centred on it, or to its end. The values are SVG's own text-anchor
export const TextAnchor = { End: "end", Middle: "middle", Start: "start" } as const;
export type TextAnchor = (typeof TextAnchor)[keyof typeof TextAnchor];
