import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";

// Each boss kind's moves, loaded by the camp that spawns it: a boss's module is a chunk of its own, so the world's first
// Screen loads none it does not spawn. A kind with no entry is a common enemy that makes its basic attack
export const EnemyKindMovesLoaderMap: Partial<Record<EnemyKindId, () => Promise<readonly BossMove[]>>> = {
  [EnemyKindId.AnemoHypostasis]: () =>
    import("#src/services/bosses/anemoHypostasis").then(({ ANEMO_HYPOSTASIS_MOVES }) => ANEMO_HYPOSTASIS_MOVES),
  [EnemyKindId.PerpetualMechanicalArray]: () =>
    import("#src/services/bosses/perpetualMechanicalArray").then(
      ({ PERPETUAL_MECHANICAL_ARRAY_MOVES }) => PERPETUAL_MECHANICAL_ARRAY_MOVES,
    ),
  [EnemyKindId.StormterrorDvalin]: () =>
    import("#src/services/bosses/stormterror").then(({ STORMTERROR_MOVES }) => STORMTERROR_MOVES),
  [EnemyKindId.ExperimentalFieldGenerator]: () =>
    import("#src/services/bosses/experimentalFieldGenerator").then(
      ({ EXPERIMENTAL_FIELD_GENERATOR_MOVES }) => EXPERIMENTAL_FIELD_GENERATOR_MOVES,
    ),
  [EnemyKindId.EmperorOfFireAndIron]: () =>
    import("#src/services/bosses/emperorOfFireAndIron").then(
      ({ EMPEROR_OF_FIRE_AND_IRON_MOVES }) => EMPEROR_OF_FIRE_AND_IRON_MOVES,
    ),
  [EnemyKindId.HydroTulpa]: () =>
    import("#src/services/bosses/hydroTulpa").then(({ HYDRO_TULPA_MOVES }) => HYDRO_TULPA_MOVES),
  [EnemyKindId.IcewindSuite]: () =>
    import("#src/services/bosses/icewindSuite").then(({ ICEWIND_SUITE_MOVES }) => ICEWIND_SUITE_MOVES),
  [EnemyKindId.MillennialPearlSeahorse]: () =>
    import("#src/services/bosses/millennialPearlSeahorse").then(
      ({ MILLENNIAL_PEARL_SEAHORSE_MOVES }) => MILLENNIAL_PEARL_SEAHORSE_MOVES,
    ),
  [EnemyKindId.LegatusGolem]: () =>
    import("#src/services/bosses/legatusGolem").then(({ LEGATUS_GOLEM_MOVES }) => LEGATUS_GOLEM_MOVES),
  [EnemyKindId.GluttonousYumkasaurMountainKing]: () =>
    import("#src/services/bosses/gluttonousYumkasaurMountainKing").then(
      ({ GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES }) => GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES,
    ),
  [EnemyKindId.GoldflameQucusaurTyrant]: () =>
    import("#src/services/bosses/goldflameQucusaurTyrant").then(
      ({ GOLDFLAME_QUCUSAUR_TYRANT_MOVES }) => GOLDFLAME_QUCUSAUR_TYRANT_MOVES,
    ),
  [EnemyKindId.SecretSourceAutomatonConfigurationDevice]: () =>
    import("#src/services/bosses/secretSourceAutomatonConfigurationDevice").then(
      ({ SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES }) => SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES,
    ),
  [EnemyKindId.WaywardHermeticSpiritspeaker]: () =>
    import("#src/services/bosses/waywardHermeticSpiritspeaker").then(
      ({ WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES }) => WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES,
    ),
  [EnemyKindId.SetekhWenut]: () =>
    import("#src/services/bosses/setekhWenut").then(({ SETEKH_WENUT_MOVES }) => SETEKH_WENUT_MOVES),
  [EnemyKindId.AlgorithmOfSemiIntransientMatrixOfOverseerNetwork]: () =>
    import("#src/services/bosses/algorithmOfSemiIntransientMatrix").then(
      ({ ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES }) => ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES,
    ),
  [EnemyKindId.JadeplumeTerrorshroom]: () =>
    import("#src/services/bosses/jadeplumeTerrorshroom").then(
      ({ JADEPLUME_TERRORSHROOM_MOVES }) => JADEPLUME_TERRORSHROOM_MOVES,
    ),
  [EnemyKindId.AeonblightDrake]: () =>
    import("#src/services/bosses/aeonblightDrake").then(({ AEONBLIGHT_DRAKE_MOVES }) => AEONBLIGHT_DRAKE_MOVES),
  [EnemyKindId.IniquitousBaptist]: () =>
    import("#src/services/bosses/iniquitousBaptist").then(({ INIQUITOUS_BAPTIST_MOVES }) => INIQUITOUS_BAPTIST_MOVES),
  [EnemyKindId.GoldenWolflord]: () =>
    import("#src/services/bosses/goldenWolflord").then(({ GOLDEN_WOLFLORD_MOVES }) => GOLDEN_WOLFLORD_MOVES),
  [EnemyKindId.ThunderManifestation]: () =>
    import("#src/services/bosses/thunderManifestation").then(
      ({ THUNDER_MANIFESTATION_MOVES }) => THUNDER_MANIFESTATION_MOVES,
    ),
  [EnemyKindId.MaguuKenki]: () =>
    import("#src/services/bosses/maguuKenki").then(({ MAGUU_KENKI_MOVES }) => MAGUU_KENKI_MOVES),
  [EnemyKindId.PrimoGeovishap]: () =>
    import("#src/services/bosses/primoGeovishap").then(({ PRIMO_GEOVISHAP_MOVES }) => PRIMO_GEOVISHAP_MOVES),
  [EnemyKindId.SolitarySuanni]: () =>
    import("#src/services/bosses/solitarySuanni").then(({ SOLITARY_SUANNI_MOVES }) => SOLITARY_SUANNI_MOVES),
};
