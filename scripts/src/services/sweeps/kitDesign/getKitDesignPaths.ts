export const KIT_DESIGNS_DIRECTORY = "openspec/specs/genshin/kits";

// A kit's design is its own folder under the kits spec or, where the kit is named differently, the one word of its
// Name a folder bears: `arataki-itto` is `itto`. The kit's own folder wins outright, so a word is read only when no
// Folder bears the whole name.
export const getKitDesignPaths = (kit: string, checkExists: (path: string) => boolean): string[] => {
  const ownDesignPath = `${KIT_DESIGNS_DIRECTORY}/${kit}/design.md`;
  if (checkExists(ownDesignPath)) return [ownDesignPath];

  return kit
    .split("-")
    .map((word) => `${KIT_DESIGNS_DIRECTORY}/${word}/design.md`)
    .filter((path) => checkExists(path));
};
