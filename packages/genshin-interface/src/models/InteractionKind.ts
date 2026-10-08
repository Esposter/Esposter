// What acting on a thing in reach does, which decides its prompt's icon: an item taken into the bag, a chest opened, a
// Character's dialogue begun, a book, notice or sign read, or a waypoint unlocked for the map to teleport to
export enum InteractionKind {
  Activate = "Activate",
  Open = "Open",
  PickUp = "PickUp",
  Read = "Read",
  Talk = "Talk",
}
