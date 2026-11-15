export const TeleportId = {
  "@1": "1",
  "@2": "2",
} as const;
export type TeleportId = (typeof TeleportId)[keyof typeof TeleportId];
