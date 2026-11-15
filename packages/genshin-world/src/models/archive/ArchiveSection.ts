// The Archive's seven sections, each one the game's own codex table. Their order on the screen is ArchiveSectionOrder's
export const ArchiveSection = {
  Books: "Books",
  Equipment: "Equipment",
  Geography: "Geography",
  LivingBeings: "LivingBeings",
  Materials: "Materials",
  TravelLog: "TravelLog",
  Tutorials: "Tutorials",
} as const;
export type ArchiveSection = (typeof ArchiveSection)[keyof typeof ArchiveSection];
