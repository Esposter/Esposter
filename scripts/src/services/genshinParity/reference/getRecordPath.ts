// A record's path as the manifest holds it: its path under the parity folder with forward slashes whatever the host, so a
// Manifest packed on Windows restores on a Mac and the same bytes write the same row on every machine. A backslash is
// Read as a separator too, since a Windows path carries one
export const getRecordPath = (relativePath: string): string => relativePath.split(/[\\/]/u).join("/");
