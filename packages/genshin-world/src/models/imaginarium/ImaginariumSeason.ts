import type { Element } from "#src/models/Element";

// One season of the Imaginarium Theater: its id, the moments it begins and ends in the game's time zone, the difficulties it
// Runs by id, the reward group its Stellas draw from, its three elements, and the avatar ids of its opening characters and
// Special guests
export interface ImaginariumSeason {
  beginsAt: string;
  difficultyIds: number[];
  elements: Element[];
  endsAt: string;
  id: number;
  openingCharacterIds: number[];
  rewardGroup: number;
  specialGuestIds: number[];
}
