// The path a pack stores a file under, from the path a model names it by: MMD's backslashes separate its parts as
// Slashes do, an empty part or a "." names no folder, and a ".." leaves the folder before it, as a URL resolves them. A
// ".." with no folder before it is kept, so a path climbing out of the pack still reads as one. The publisher stores
// Each file under this path and the world fetches it, so the two agree whatever the model wrote
export const getCharacterPackFilePath = (path: string): string => {
  const parts: string[] = [];
  for (const part of path.split(/[/\\]/u))
    if (part === "" || part === ".") continue;
    else if (part === ".." && parts.length > 0 && parts.at(-1) !== "..") parts.pop();
    else parts.push(part);
  return parts.join("/");
};
