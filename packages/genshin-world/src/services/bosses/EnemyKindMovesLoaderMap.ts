/* oxlint-disable selector-ban/no-restricted-syntax -- a lazy-loader contract: each boss kind's moves load as its
   camp spawns, keeping every boss module out of the world's first screen */
import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";

// Each boss kind's moves, loaded by the camp that spawns it: a boss's module is a chunk of its own, so the world's
// First Screen loads none it does not spawn. A kind with no entry is a common enemy that makes its basic attack
export const EnemyKindMovesLoaderMap: Partial<Record<EnemyKindId, () => Promise<readonly BossMove[]>>> = {
  [EnemyKindId.AeonblightDrake]: async () =>
    (await import("#src/services/bosses/aeonblightDrake")).AEONBLIGHT_DRAKE_MOVES,
  [EnemyKindId.AlgorithmOfSemiIntransientMatrixOfOverseerNetwork]: async () =>
    (await import("#src/services/bosses/algorithmOfSemiIntransientMatrix")).ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES,
  [EnemyKindId.AnemoHypostasis]: async () =>
    (await import("#src/services/bosses/anemoHypostasis")).ANEMO_HYPOSTASIS_MOVES,
  [EnemyKindId.EmperorOfFireAndIron]: async () =>
    (await import("#src/services/bosses/emperorOfFireAndIron")).EMPEROR_OF_FIRE_AND_IRON_MOVES,
  [EnemyKindId.ExperimentalFieldGenerator]: async () =>
    (await import("#src/services/bosses/experimentalFieldGenerator")).EXPERIMENTAL_FIELD_GENERATOR_MOVES,
  [EnemyKindId.GluttonousYumkasaurMountainKing]: async () =>
    (await import("#src/services/bosses/gluttonousYumkasaurMountainKing")).GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES,
  [EnemyKindId.GoldenWolflord]: async () => (await import("#src/services/bosses/goldenWolflord")).GOLDEN_WOLFLORD_MOVES,
  [EnemyKindId.GoldflameQucusaurTyrant]: async () =>
    (await import("#src/services/bosses/goldflameQucusaurTyrant")).GOLDFLAME_QUCUSAUR_TYRANT_MOVES,
  [EnemyKindId.HydroTulpa]: async () => (await import("#src/services/bosses/hydroTulpa")).HYDRO_TULPA_MOVES,
  [EnemyKindId.IcewindSuite]: async () => (await import("#src/services/bosses/icewindSuite")).ICEWIND_SUITE_MOVES,
  [EnemyKindId.IniquitousBaptist]: async () =>
    (await import("#src/services/bosses/iniquitousBaptist")).INIQUITOUS_BAPTIST_MOVES,
  [EnemyKindId.JadeplumeTerrorshroom]: async () =>
    (await import("#src/services/bosses/jadeplumeTerrorshroom")).JADEPLUME_TERRORSHROOM_MOVES,
  [EnemyKindId.LegatusGolem]: async () => (await import("#src/services/bosses/legatusGolem")).LEGATUS_GOLEM_MOVES,
  [EnemyKindId.MaguuKenki]: async () => (await import("#src/services/bosses/maguuKenki")).MAGUU_KENKI_MOVES,
  [EnemyKindId.MillennialPearlSeahorse]: async () =>
    (await import("#src/services/bosses/millennialPearlSeahorse")).MILLENNIAL_PEARL_SEAHORSE_MOVES,
  [EnemyKindId.PerpetualMechanicalArray]: async () =>
    (await import("#src/services/bosses/perpetualMechanicalArray")).PERPETUAL_MECHANICAL_ARRAY_MOVES,
  [EnemyKindId.PrimoGeovishap]: async () => (await import("#src/services/bosses/primoGeovishap")).PRIMO_GEOVISHAP_MOVES,
  [EnemyKindId.SecretSourceAutomatonConfigurationDevice]: async () =>
    (await import("#src/services/bosses/secretSourceAutomatonConfigurationDevice"))
      .SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES,
  [EnemyKindId.SetekhWenut]: async () => (await import("#src/services/bosses/setekhWenut")).SETEKH_WENUT_MOVES,
  [EnemyKindId.SolitarySuanni]: async () => (await import("#src/services/bosses/solitarySuanni")).SOLITARY_SUANNI_MOVES,
  [EnemyKindId.StormterrorDvalin]: async () => (await import("#src/services/bosses/stormterror")).STORMTERROR_MOVES,
  [EnemyKindId.ThunderManifestation]: async () =>
    (await import("#src/services/bosses/thunderManifestation")).THUNDER_MANIFESTATION_MOVES,
  [EnemyKindId.WaywardHermeticSpiritspeaker]: async () =>
    (await import("#src/services/bosses/waywardHermeticSpiritspeaker")).WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES,
};
