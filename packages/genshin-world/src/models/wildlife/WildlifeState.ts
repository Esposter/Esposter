// Where an animal stands in its flight: idle at its place, running from the character for its escape time, charging at
// The character in a boar's way, or struck down where it fell, giving its drops once and vanishing from the world
export enum WildlifeState {
  Charging = "Charging",
  Fleeing = "Fleeing",
  Idle = "Idle",
  Struck = "Struck",
}
