// Mondstadt's Reputation at level 3, its reward page open on level 8's reward, the Wings of Azure Wind, as the public clip
// Shows it at 18 seconds: levels 1 to 3 achieved, the rest not, each level's items by their rarity, and the unlock lines
// Of levels 2 and 4 in the game's words
export const props = {
  achievedLabel: "Achieved",
  backLabel: "Back",
  headline: "Wings of Azure Wind",
  level: 8,
  levelLabel: "Lv.",
  levels: [
    {
      isAchieved: true,
      items: [{ count: 1, label: "Recipe: Northern Apple Stew ×1", rarity: 3 }],
      level: 1,
      unlockLabel: "",
    },
    {
      isAchieved: true,
      items: [{ count: 1, label: "Instructions: Anemoculus Resonance Stone ×1", rarity: 3 }],
      level: 2,
      unlockLabel: "Feature Unlocked: Mondstadt Mining Outcrop Search",
    },
    {
      isAchieved: true,
      items: [{ count: 1, label: "Diagram: Wind Catcher ×1", rarity: 4 }],
      level: 3,
      unlockLabel: "",
    },
    {
      isAchieved: false,
      items: [
        { count: 1, label: "Mondstadt: Hero's Fame ×1", rarity: 4 },
        { count: 1, label: "Recipe: Adventurer's Breakfast Sandwich ×1", rarity: 3 },
      ],
      level: 4,
      unlockLabel: "Feature Unlocked: Mondstadt Merchant Discounts",
    },
    {
      isAchieved: false,
      items: [{ count: 1, label: "Diagram: NRE (Menu 30) ×1", rarity: 4 }],
      level: 5,
      unlockLabel: "",
    },
    {
      isAchieved: false,
      items: [
        { count: 1, label: "Diagram: Anemo Treasure Compass ×1", rarity: 4 },
        { count: 1, label: "Instructions: Portable Waypoint ×1", rarity: 4 },
      ],
      level: 6,
      unlockLabel: "",
    },
    {
      isAchieved: false,
      items: [
        { count: 1, label: "Mondstadt: Blessing ×1", rarity: 4 },
        { count: 1, label: "Recipe: Moon Pie ×1", rarity: 4 },
      ],
      level: 7,
      unlockLabel: "",
    },
    { isAchieved: false, items: [{ count: 1, label: "Wings of Azure Wind ×1", rarity: 4 }], level: 8, unlockLabel: "" },
  ],
  notAchievedLabel: "Not achieved",
  requirement: [{ text: "Reach Reputation Level " }, { color: "#FFCC33", text: "8" }, { text: " in Mondstadt" }],
  title: "Reputation Reward (Mondstadt)",
};
