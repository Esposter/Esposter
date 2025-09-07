export const stripBOM = (str: string): string => (str.startsWith("\uFEFF") ? str.slice(1) : str);
