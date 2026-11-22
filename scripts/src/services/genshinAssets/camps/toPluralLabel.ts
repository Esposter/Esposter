export const toPluralLabel = (label: string): string => (label.endsWith("s") ? label : `${label}s`);
