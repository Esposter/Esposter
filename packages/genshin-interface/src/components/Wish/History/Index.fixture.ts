// The wish History popup over the year's draws, newest first, with one item drawn twice in the same minute
export const HISTORY = [
  { bannerLabel: "Character Event Wish", name: "Sample Character", rarity: 5, time: "2026-10-18T14:02" },
  { bannerLabel: "Standard Wish", name: "Sample Weapon", rarity: 4, time: "2026-10-18T14:02" },
  { bannerLabel: "Standard Wish", name: "Sample Weapon", rarity: 4, time: "2026-10-18T14:02" },
  { bannerLabel: "Standard Wish", name: "Sample Blade", rarity: 3, time: "2026-10-17T09:30" },
];

// The History popup the wish screen's History opens, with the year's draws listed
export const props = { closeLabel: "Back", history: HISTORY, title: "History" };
