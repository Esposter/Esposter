// A block's path as a file name, its folder's separator replaced, for the index and the export named after it
export const toUiBlockFileName = (block: string): string => block.replaceAll("/", "_");
