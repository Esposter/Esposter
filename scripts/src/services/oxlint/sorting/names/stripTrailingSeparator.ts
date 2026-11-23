// A signature's trailing `,` or `;` is no part of its name
export const stripTrailingSeparator = (text: string): string => text.replace(/[,;]$/u, "");
