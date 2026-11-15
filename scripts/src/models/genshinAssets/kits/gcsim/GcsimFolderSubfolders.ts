export const GcsimFolderSubfolders = { Traveler: "traveler" } as const;
export type GcsimFolderSubfolders = (typeof GcsimFolderSubfolders)[keyof typeof GcsimFolderSubfolders];
