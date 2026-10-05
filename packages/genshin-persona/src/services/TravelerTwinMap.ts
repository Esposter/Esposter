import type { TravelerTwin } from "#src/models/TravelerTwin";

import { TravelerGender } from "#src/generated/genshinText/models/TravelerGender";

// The twins have no page of their own: every line is a dialogue with Paimon on the Traveler's story pages, filed
// Under a file per twin, with a gendered word choice in the text
export const TravelerTwinMap: Record<string, TravelerTwin> = {
  Aether: { gender: TravelerGender.Male, namePlaceholder: "{character1}" },
  Lumine: { gender: TravelerGender.Female, namePlaceholder: "{character2}" },
};
