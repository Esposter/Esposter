export const RoomAchievementName = {
  Inviter: "Inviter",
  PartyHost: "PartyHost",
  RoomCreator: "RoomCreator",
  RoomDestroyer: "RoomDestroyer",
  RoomHopper: "RoomHopper",
  RoomJoiner: "RoomJoiner",
  RoomLeaver: "RoomLeaver",
  RoomRenovator: "RoomRenovator",
  Socialite: "Socialite",
} as const;
export type RoomAchievementName = (typeof RoomAchievementName)[keyof typeof RoomAchievementName];
