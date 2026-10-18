// The labels each hit of a folder-less character's skill and burst reads its multiplier from, in hit order. A label
// Spanning several hits gives one to each of its parameters, so its hits follow the labels before it
export const characterIdSlotHitLabelsMap: ReadonlyMap<number, { burst: readonly string[]; skill: readonly string[] }> =
  new Map<number, { burst: readonly string[]; skill: readonly string[] }>([
    // Nefer
    [10_000_122, { burst: ["1-Hit DMG", "2-Hit DMG"], skill: ["Skill DMG"] }],
    // Zibai
    [10_000_126, { burst: ["Skill 1-Hit DMG", "Skill 2-Hit DMG"], skill: [] }],
    // Illuga
    [10_000_127, { burst: ["Skill DMG"], skill: ["Press DMG"] }],
    // Vesna
    [10_000_143, { burst: ["Spirit Blade DMG"], skill: ["Skill DMG"] }],
  ]);
