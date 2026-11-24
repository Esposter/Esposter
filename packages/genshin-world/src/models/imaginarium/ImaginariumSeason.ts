import type { Element } from "#src/models/Element";
import type { TrialAvatar } from "#src/models/trial/TrialAvatar";

// One season of the Imaginarium Theater: its id, the moments it begins and ends in the game's time zone, the
// Difficulties it runs by id, the reward group its Stellas draw from, its three elements, the avatar ids of its opening
// Characters and special guests, and the trial avatars its opening characters play as
export interface ImaginariumSeason {
  beginsAt: string;
  difficultyIds: number[];
  elements: Element[];
  endsAt: string;
  id: number;
  openingCharacterIds: number[];
  openingTrials: TrialAvatar[];
  rewardGroup: number;
  specialGuestIds: number[];
}
