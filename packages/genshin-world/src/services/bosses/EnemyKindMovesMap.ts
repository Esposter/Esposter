import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { AEONBLIGHT_DRAKE_MOVES } from "#src/services/bosses/aeonblightDrake";
import { ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES } from "#src/services/bosses/algorithmOfSemiIntransientMatrix";
import { ANEMO_HYPOSTASIS_MOVES } from "#src/services/bosses/anemoHypostasis";
import { EMPEROR_OF_FIRE_AND_IRON_MOVES } from "#src/services/bosses/emperorOfFireAndIron";
import { EXPERIMENTAL_FIELD_GENERATOR_MOVES } from "#src/services/bosses/experimentalFieldGenerator";
import { GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES } from "#src/services/bosses/gluttonousYumkasaurMountainKing";
import { GOLDEN_WOLFLORD_MOVES } from "#src/services/bosses/goldenWolflord";
import { GOLDFLAME_QUCUSAUR_TYRANT_MOVES } from "#src/services/bosses/goldflameQucusaurTyrant";
import { HYDRO_TULPA_MOVES } from "#src/services/bosses/hydroTulpa";
import { ICEWIND_SUITE_MOVES } from "#src/services/bosses/icewindSuite";
import { INIQUITOUS_BAPTIST_MOVES } from "#src/services/bosses/iniquitousBaptist";
import { JADEPLUME_TERRORSHROOM_MOVES } from "#src/services/bosses/jadeplumeTerrorshroom";
import { LEGATUS_GOLEM_MOVES } from "#src/services/bosses/legatusGolem";
import { MAGUU_KENKI_MOVES } from "#src/services/bosses/maguuKenki";
import { MILLENNIAL_PEARL_SEAHORSE_MOVES } from "#src/services/bosses/millennialPearlSeahorse";
import { PERPETUAL_MECHANICAL_ARRAY_MOVES } from "#src/services/bosses/perpetualMechanicalArray";
import { PRIMO_GEOVISHAP_MOVES } from "#src/services/bosses/primoGeovishap";
import { SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES } from "#src/services/bosses/secretSourceAutomatonConfigurationDevice";
import { SETEKH_WENUT_MOVES } from "#src/services/bosses/setekhWenut";
import { SOLITARY_SUANNI_MOVES } from "#src/services/bosses/solitarySuanni";
import { STORMTERROR_MOVES } from "#src/services/bosses/stormterror";
import { THUNDER_MANIFESTATION_MOVES } from "#src/services/bosses/thunderManifestation";
import { WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES } from "#src/services/bosses/waywardHermeticSpiritspeaker";

// The moves each boss makes in turn, by its kind. A kind with no entry is a common enemy that makes its basic attack
export const EnemyKindMovesMap: Partial<Record<EnemyKindId, readonly BossMove[]>> = {
  [EnemyKindId.AeonblightDrake]: AEONBLIGHT_DRAKE_MOVES,
  [EnemyKindId.AlgorithmOfSemiIntransientMatrixOfOverseerNetwork]: ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES,
  [EnemyKindId.AnemoHypostasis]: ANEMO_HYPOSTASIS_MOVES,
  [EnemyKindId.EmperorOfFireAndIron]: EMPEROR_OF_FIRE_AND_IRON_MOVES,
  [EnemyKindId.ExperimentalFieldGenerator]: EXPERIMENTAL_FIELD_GENERATOR_MOVES,
  [EnemyKindId.GluttonousYumkasaurMountainKing]: GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES,
  [EnemyKindId.GoldenWolflord]: GOLDEN_WOLFLORD_MOVES,
  [EnemyKindId.GoldflameQucusaurTyrant]: GOLDFLAME_QUCUSAUR_TYRANT_MOVES,
  [EnemyKindId.HydroTulpa]: HYDRO_TULPA_MOVES,
  [EnemyKindId.IcewindSuite]: ICEWIND_SUITE_MOVES,
  [EnemyKindId.IniquitousBaptist]: INIQUITOUS_BAPTIST_MOVES,
  [EnemyKindId.JadeplumeTerrorshroom]: JADEPLUME_TERRORSHROOM_MOVES,
  [EnemyKindId.LegatusGolem]: LEGATUS_GOLEM_MOVES,
  [EnemyKindId.MaguuKenki]: MAGUU_KENKI_MOVES,
  [EnemyKindId.MillennialPearlSeahorse]: MILLENNIAL_PEARL_SEAHORSE_MOVES,
  [EnemyKindId.PerpetualMechanicalArray]: PERPETUAL_MECHANICAL_ARRAY_MOVES,
  [EnemyKindId.PrimoGeovishap]: PRIMO_GEOVISHAP_MOVES,
  [EnemyKindId.SecretSourceAutomatonConfigurationDevice]: SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES,
  [EnemyKindId.SetekhWenut]: SETEKH_WENUT_MOVES,
  [EnemyKindId.SolitarySuanni]: SOLITARY_SUANNI_MOVES,
  [EnemyKindId.StormterrorDvalin]: STORMTERROR_MOVES,
  [EnemyKindId.ThunderManifestation]: THUNDER_MANIFESTATION_MOVES,
  [EnemyKindId.WaywardHermeticSpiritspeaker]: WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES,
};
