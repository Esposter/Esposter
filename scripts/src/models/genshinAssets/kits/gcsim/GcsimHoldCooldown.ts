// The cooldown a skill hold's case of a switch gives the skill, in frames as the case sets the local it passes to
// `SetCD`, cited at the line it sets it on. The hold's index is its case's place in the switch
export interface GcsimHoldCooldown {
  file: string;
  frames: number;
  line: number;
}
