export const stripBOM = (string: string): string => (string.startsWith("\uFEFF") ? string.slice(1) : string);
