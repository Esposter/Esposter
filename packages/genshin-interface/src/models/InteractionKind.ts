// What acting on a thing in reach does, which decides its prompt's icon: an item taken into the bag, a chest opened, a
// Ley line blossom claimed where its outcrop stands,
// Ground dug up over a buried chest, a Character's dialogue begun, a book, notice or sign read, a waypoint unlocked for
// The map to teleport to, or an object used to open a screen of its own, such as the crafting bench
export enum InteractionKind {
  Activate = "Activate",
  Claim = "Claim",
  Dig = "Dig",
  Open = "Open",
  PickUp = "PickUp",
  Read = "Read",
  Talk = "Talk",
  Use = "Use",
}
