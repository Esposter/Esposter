// One Benediction a chamber's list offers: its id in the game's tower buff table, the weight the list draws it by, and the
// Text hash of its description, which the game's name text holds
export interface AbyssBenedictionChoice {
  descriptionTextHash: number;
  towerBuffId: number;
  weight: number;
}
