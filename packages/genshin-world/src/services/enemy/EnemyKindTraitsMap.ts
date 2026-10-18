import type { EnemyKindTraits } from "#src/models/enemy/EnemyKindTraits";

import { Element } from "#src/models/Element";
import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { STORMTERROR_SHIELD_HP_FRACTION } from "#src/services/bosses/stormterror";

// What the wiki gives of each kind the world places, its energy drops in falling order with the drop on its defeat last
export const EnemyKindTraitsMap: Record<EnemyKindId, EnemyKindTraits> = {
  [EnemyKindId.AbyssHeraldFrostFall]: { element: Element.Cryo, energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.AeonblightDrake]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.AlgorithmOfSemiIntransientMatrixOfOverseerNetwork]: {
    energyDrops: [],
    poiseType: PoiseType.OtherDemiboss,
  },
  [EnemyKindId.AnemoHilichurlRogue]: { element: Element.Anemo, energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.AnemoHypostasis]: {
    element: Element.Anemo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 25 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 0 },
    ],
    poiseType: PoiseType.Boss,
    // Hurricane Seed, the material the wiki names as the Anemo Hypostasis's own drop
    uniqueDropId: 113001,
  },
  [EnemyKindId.AnemoSamachurl]: {
    element: Element.Anemo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.AnemoSlime]: {
    element: Element.Anemo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Slime,
  },
  [EnemyKindId.AnemoSpecter]: {
    element: Element.Anemo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.HumanoidGrunt,
  },
  [EnemyKindId.AnnihilationSpecialistMek]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.AssaultSpecialistMek]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.BitingColdWayobManifestation]: {
    element: Element.Cryo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 2, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.HumanoidDemiboss,
  },
  [EnemyKindId.ConstructionSpecialistMek]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.CryoAbyssMage]: {
    element: Element.Cryo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.HumanoidGrunt,
  },
  [EnemyKindId.CryoWhopperflower]: {
    element: Element.Cryo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.DendroSamachurl]: {
    element: Element.Dendro,
    energyDrops: [],
    enemyDropFamily: EnemyDropFamily.Hilichurls,
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.ElectroSamachurl]: {
    element: Element.Electro,
    energyDrops: [],
    enemyDropFamily: EnemyDropFamily.Hilichurls,
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.EmperorOfFireAndIron]: { element: Element.Pyro, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.EremiteDaythunder]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.EremiteDesertClearwater]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.EremiteSunfrost]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.ErodingAvatarOfLava]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.OtherGrunt,
  },
  [EnemyKindId.ExperimentalFieldGenerator]: { element: Element.Geo, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.EyeOfTheStorm]: { element: Element.Anemo, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.FatuiPyroAgent]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.FatuiSkirmisherGeochanterBracer]: {
    element: Element.Geo,
    energyDrops: [
      { count: 2, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 2, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
      { count: 2, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.OtherGrunt,
  },
  [EnemyKindId.FloatingAnemoFungus]: {
    energyDrops: [{ count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 }],
    poiseType: PoiseType.Slime,
  },
  [EnemyKindId.FrostarmLawachurl]: {
    energyDrops: [
      { count: 3, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 3, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 3, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
      { count: 3, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.OtherDemiboss,
  },
  [EnemyKindId.GeologicalSurveyMek]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.GeovishapHatchling]: {
    element: Element.Geo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
    ],
    poiseType: PoiseType.OtherGrunt,
  },
  [EnemyKindId.GluttonousYumkasaurMountainKing]: {
    element: Element.Dendro,
    energyDrops: [],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.GoldenWolflord]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.GoldflameQucusaurTyrant]: { element: Element.Pyro, energyDrops: [], poiseType: PoiseType.Boss },
  // Provisional: the wiki's Hilichurl Fighter page gives its damage type and every attack in its Attacks section as
  // Physical DMG, so the kind has no attack element
  [EnemyKindId.GroundedHydroshroom]: { element: Element.Hydro, energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.HilichurlFighter]: {
    enemyDropFamily: EnemyDropFamily.Hilichurls,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.HilichurlShooter]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.HydroTulpa]: { element: Element.Hydro, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.IceShieldwallMitachurl]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.HumanoidDemiboss,
  },
  [EnemyKindId.IcewindSuite]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.IniquitousBaptist]: { energyDrops: [], poiseType: PoiseType.OtherDemiboss },
  [EnemyKindId.JadeplumeTerrorshroom]: { element: Element.Dendro, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.KairagiDancingThunder]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.KairagiFieryMight]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.LargeOvergrownBreacherPrimus]: {
    element: Element.Dendro,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.LargeShatterstoneBreacherPrimus]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.LegatusGolem]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.MaguuKenki]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.MillennialPearlSeahorse]: {
    element: Element.Electro,
    energyDrops: [],
    poiseType: PoiseType.OtherDemiboss,
  },
  [EnemyKindId.MirrorMaiden]: { energyDrops: [], poiseType: PoiseType.OtherGrunt },
  [EnemyKindId.NimbleHarvesterMek]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.NobushiHitsukeban]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.HumanoidGrunt,
  },
  [EnemyKindId.PerpetualMechanicalArray]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.PraetorianGolem]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.PrimalConstructProspector]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.OtherDemiboss,
  },
  [EnemyKindId.PrimoGeovishap]: {
    element: Element.Geo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
    ],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.PrimordialBathysmalVishap]: {
    element: Element.Hydro,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
      { count: 2, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.OtherGrunt,
  },
  [EnemyKindId.PyroAbyssMage]: { element: Element.Pyro, energyDrops: [], poiseType: PoiseType.HumanoidGrunt },
  [EnemyKindId.RockfondRifthound]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.RuinDefender]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.RuinDestroyer]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.RuinDrakeEarthguard]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.RuinGrader]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.RuinGuard]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.RuinHunter]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.SecretSourceAutomatonConfigurationDevice]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.SecretSourceAutomatonHunterSeeker]: {
    element: Element.Pyro,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.SetekhWenut]: { element: Element.Anemo, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.ShatterstoneBreacherPrimus]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.SolitarySuanni]: { energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.StonehideLawachurl]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.StormterrorDvalin]: {
    element: Element.Anemo,
    energyDrops: [],
    poiseType: PoiseType.Boss,
    shieldHealthFraction: STORMTERROR_SHIELD_HP_FRACTION,
  },
  [EnemyKindId.TaintedWaterSplittingPhantasm]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.TaintedWaterSpoutingPhantasm]: { energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.ThunderManifestation]: { element: Element.Electro, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.ThundercravenRifthound]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.ThunderhelmLawachurl]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.TreasureHoarderScout]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 66 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 33 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
  [EnemyKindId.WaywardHermeticSpiritspeaker]: { element: Element.Cryo, energyDrops: [], poiseType: PoiseType.Boss },
  [EnemyKindId.WingedCryoshroom]: { element: Element.Cryo, energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.WingedDendroshroom]: { element: Element.Dendro, energyDrops: [], poiseType: PoiseType.Minion },
  [EnemyKindId.WoodenShieldwallMitachurl]: { energyDrops: [], poiseType: PoiseType.HumanoidDemiboss },
  [EnemyKindId.XuanwenBeast]: {
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 25 },
    ],
    poiseType: PoiseType.OtherGrunt,
  },
};
