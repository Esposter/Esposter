import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";

// The packs' files held in the page's memory, for a browser that keeps neither a private file system nor IndexedDB, so a
// Pack loaded there is drawn until the page closes
export const createMemoryCharacterPackStorage = (): CharacterPackStorage => {
  const pathBlobMap = new Map<string, Blob>();
  return {
    read: (path) => Promise.resolve(pathBlobMap.get(path.join("/"))),
    remove: (path) => {
      const removedPath = path.join("/");
      for (const storedPath of pathBlobMap.keys())
        if (storedPath === removedPath || storedPath.startsWith(`${removedPath}/`)) pathBlobMap.delete(storedPath);
      return Promise.resolve();
    },
    write: (path, blob) => {
      pathBlobMap.set(path.join("/"), blob);
      return Promise.resolve();
    },
  };
};
