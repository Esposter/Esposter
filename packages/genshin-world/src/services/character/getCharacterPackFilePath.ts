// The path a pack keeps a file under, from the path a model names it by: MMD's backslashes separate its parts as
// Slashes do, and an empty part or a "." names no folder, as a URL resolves them. A host serves, and the browser keeps,
// Each file under this path and the world asks for it by it, so they agree whatever the model wrote
export const getCharacterPackFilePath = (path: string): string =>
  path
    .split(/[/\\]/u)
    .filter((part) => part !== "" && part !== ".")
    .join("/");
