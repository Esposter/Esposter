// Discord's own grouping of the same bits. The screen never orders by this enum — the bit order is the wire
// Format and already runs category by category, so `RoomPermissionCategoryItems` reads the boundaries off it
export enum RoomPermissionCategory {
  Advanced = "Advanced",
  General = "General",
  Moderation = "Moderation",
  TextChannel = "Text Channel",
}
