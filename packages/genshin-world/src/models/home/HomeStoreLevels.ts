import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

// The comfort a realm has, and the tables its Realm Currency and Realm Bounty stores read it against: the Adeptal
// Energy ranks its comfort reaches and the Trust Ranks it holds
export interface HomeStoreLevels {
  comfort: number;
  comfortLevels: HomeComfortLevel[];
  trustLevels: HomeTrustLevel[];
}
