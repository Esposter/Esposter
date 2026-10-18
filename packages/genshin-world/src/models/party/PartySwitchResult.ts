// What a press of a party member's key did: the switch, or the game's reason for refusing it (a fall still playing, a
// Character who is down, the cooldown), or nothing at all for the
// Member already on the field or a slot with nobody in it
export enum PartySwitchResult {
  Cooldown = "Cooldown",
  Down = "Down",
  Falling = "Falling",
  Switched = "Switched",
  Unchanged = "Unchanged",
}
