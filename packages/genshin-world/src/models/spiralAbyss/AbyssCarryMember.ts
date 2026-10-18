// A party member's health and energy as a chamber's clear leaves them, which the next chamber starts from: its HP as a share
// Of its Max HP, and its energy toward its Burst
export interface AbyssCarryMember {
  characterId: number;
  energy: number;
  healthShare: number;
}
