// The ban groups a quest step carries in Special Story Mode, each the game's own name for the restriction a step holds
// While it is active. The game's spelling of the last one drops a T, so its value is kept as the dump holds it
export enum QuestBanType {
  BanGroupCommon = "BAN_GROUP_COMMON",
  BanGroupTransportMap = "BAN_GROUP_TRANSPORT_MAP",
  BanGroupTransportOnly = "BAN_GROUP_TRANSPORT_ONLY",
  BanGroupTransportGotoScene = "BAN_GROUP_TRANSPOR_GOTO_SCENE",
}
