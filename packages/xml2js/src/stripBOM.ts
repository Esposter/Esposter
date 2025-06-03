export const stripBOM = (str: string): string => (str.startsWith("\uFEFF") ? str.substring(1) : str);
