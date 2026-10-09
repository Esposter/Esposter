// The path a pack stores a file under, from the path a model names it by: MMD's backslashes separate its parts as
// Slashes do, and an empty part or a "." names no folder, as a URL resolves them. The publisher stores each file under
// This path and the world fetches it, so the two agree whatever the model wrote
export const getCharacterPackFilePath = (path: string): string =>
  path
    .split(/[/\\]/u)
    .filter((part) => part !== "" && part !== ".")
    .join("/");
