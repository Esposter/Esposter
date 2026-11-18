import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { ANEMO_HYPOSTASIS_MOVES } from "#src/services/bosses/anemoHypostasis";
import { EMPEROR_OF_FIRE_AND_IRON_MOVES } from "#src/services/bosses/emperorOfFireAndIron";
import { EXPERIMENTAL_FIELD_GENERATOR_MOVES } from "#src/services/bosses/experimentalFieldGenerator";
import { GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES } from "#src/services/bosses/gluttonousYumkasaurMountainKing";
import { GOLDFLAME_QUCUSAUR_TYRANT_MOVES } from "#src/services/bosses/goldflameQucusaurTyrant";
import { HYDRO_TULPA_MOVES } from "#src/services/bosses/hydroTulpa";
import { ICEWIND_SUITE_MOVES } from "#src/services/bosses/icewindSuite";
import { LEGATUS_GOLEM_MOVES } from "#src/services/bosses/legatusGolem";
import { MILLENNIAL_PEARL_SEAHORSE_MOVES } from "#src/services/bosses/millennialPearlSeahorse";
import { PERPETUAL_MECHANICAL_ARRAY_MOVES } from "#src/services/bosses/perpetualMechanicalArray";
import { SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES } from "#src/services/bosses/secretSourceAutomatonConfigurationDevice";
import { STORMTERROR_MOVES } from "#src/services/bosses/stormterror";
import { WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES } from "#src/services/bosses/waywardHermeticSpiritspeaker";

// The moves each boss makes in turn, by its kind. A kind with no entry is a common enemy that makes its basic attack
export const EnemyKindMovesMap: Partial<Record<EnemyKindId, readonly BossMove[]>> = {
  [EnemyKindId.AnemoHypostasis]: ANEMO_HYPOSTASIS_MOVES,
  [EnemyKindId.PerpetualMechanicalArray]: PERPETUAL_MECHANICAL_ARRAY_MOVES,
  [EnemyKindId.StormterrorDvalin]: STORMTERROR_MOVES,
  [EnemyKindId.ExperimentalFieldGenerator]: EXPERIMENTAL_FIELD_GENERATOR_MOVES,
  [EnemyKindId.EmperorOfFireAndIron]: EMPEROR_OF_FIRE_AND_IRON_MOVES,
  [EnemyKindId.HydroTulpa]: HYDRO_TULPA_MOVES,
  [EnemyKindId.IcewindSuite]: ICEWIND_SUITE_MOVES,
  [EnemyKindId.MillennialPearlSeahorse]: MILLENNIAL_PEARL_SEAHORSE_MOVES,
  [EnemyKindId.LegatusGolem]: LEGATUS_GOLEM_MOVES,
  [EnemyKindId.GluttonousYumkasaurMountainKing]: GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES,
  [EnemyKindId.GoldflameQucusaurTyrant]: GOLDFLAME_QUCUSAUR_TYRANT_MOVES,
  [EnemyKindId.SecretSourceAutomatonConfigurationDevice]: SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES,
  [EnemyKindId.WaywardHermeticSpiritspeaker]: WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES,
};
