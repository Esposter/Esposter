// The one key an object is held by across the game's files: a path ID names an object only within its file
export const toObjectKey = (file: string, pathId: string): string => `${file}/${pathId}`;
