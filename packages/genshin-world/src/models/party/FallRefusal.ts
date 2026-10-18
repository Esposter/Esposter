// A kit's refusal of the fall a damage would bring a party member to: while the damage would take the member to none
// And the refusal holds, the member is left at the share of its Max HP the refusal keeps. The refusal's check is only
// Made then, as it may start a cooldown
export interface FallRefusal {
  healthShare: number;
  refuses: () => boolean;
}
