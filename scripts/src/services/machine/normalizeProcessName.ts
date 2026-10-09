// A process name without a path or `.exe`, lowercased, so one name matches on every platform
export const normalizeProcessName = (name: string): string => name.toLowerCase().replace(/\.exe$/, "");
