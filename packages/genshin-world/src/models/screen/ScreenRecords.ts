import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { DomainChallengeLevelMap } from "#src/models/domains/DomainChallengeLevelMap";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";

// The records a screen open over the world reads, each read the first time its screen opens and held after, so the
// World's first frame reads none of them
export interface ScreenRecords {
  // The character trials' tables, which the banners offer each trial from and a trial is entered by
  characterTrials: CharacterTrialTables;
  // The cooks' talents by character id, which the cooking screen shows the active character's of
  cookingTalents: Record<string, CookingTalent>;
  // The bench's recipes in the game's order, which the crafting screen offers the learned ones of
  craftingRecipes: CraftingRecipe[];
  // The Mystic Offering's strongboxes, one for each set the offering may choose, which the bench offers from its Adventure Rank
  craftingStrongboxes: CraftingStrongboxData[];
  // The dishes' uses, each by the item its dish is eaten from, which the bag uses
  dishes: Record<string, DishUse>;
  // The domains' challenge levels by entry id and then by recommended rank, which a domain's level is entered from
  domainChallengeLevels: DomainChallengeLevelMap;
  // The most forge points a game day holds, which the forge refuses an order past
  forgeDailyPointCap: number;
  // The blacksmith's recipes, which the forge offers and the bag learns from
  forgeRecipes: ForgeRecipe[];
  // The Serenitea Pot's furnishings Tubby makes, each with the diagrams that open it, which a diagram's Use learns it from
  homeBlueprints: HomeBlueprint[];
  // The characters and weapons Paimon's Bargains offers in turn, which its screen reads each month's pair and set from
  paimonsBargainsRotation: PaimonsBargainsRotation;
  // The processings the cooks run, which the processing screen offers
  processingRecipes: ProcessingRecipe[];
  // Each city vendor's shop's goods, by the shop's id, which a vendor's talk opens the shop of
  shopIdShopGoodMap: ReadonlyMap<number, ShopGood[]>;
  // The wish schedule's event banners, each offered by the wish screen only inside its window
  wishSchedule: WishScheduleEvent[];
}
