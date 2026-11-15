export const LayerName = {
  Collision: "Collision",
  Foreground: "Foreground",
  "MainScene/Background": "MainScene/Background",
  "MainScene/Decorations": "MainScene/Decorations",
  "MainScene/Entrance": "MainScene/Entrance",
} as const;
export type LayerName = (typeof LayerName)[keyof typeof LayerName];
