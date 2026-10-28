import type { Element } from "#src/models/Element";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createKitBody } from "#src/services/kit/createKitBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Windmuster Iris, as gcsim v2.47.2 (MIT) heizou/burst.go gives it: the burst checks the auras of the first 4 enemies it
// Strikes before its Anemo lands, and on each holding Pyro, Hydro, Electro or Cryo, the first of them in that order, an
// Iris explodes in that element round the enemy as the check found it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/burst.go
const IRIS_TAG_STATUS_ID = "heizou-windmuster-iris-tags";
const IRIS_MAX_TAGS = 4;
// Penetrative Reasoning, as gcsim v2.47.2 (MIT) heizou/asc.go gives it: from Ascension 4, each Heartstopper Strike hit gives
// Every other member of the deployed team 80 Elemental Mastery for 10 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/asc.go
const ASCENSION_4 = 4;
const PENETRATIVE_REASONING_ELEMENTAL_MASTERY = 80;
const PENETRATIVE_REASONING_SECONDS = 10;
// Measured: gcsim v2.47.2 (MIT) heizou/cons.go, Constellation 4 regenerates 9 Energy for the first enemy a Windmuster Kick's
// Aura check tags, and 1.5 for each of the three after it, as gcsim's burst counts the tags its check makes (burst.go line 39)
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_FIRST_TAG_ENERGY = 9;
const CONSTELLATION_4_LATER_TAG_ENERGY = 1.5;

export const HEIZOU_CHARACTER_ID = 10_000_059;

// Penetrative Reasoning gives the rest of the team Elemental Mastery as a Heartstopper Strike hit lands, from Ascension 4
const addPenetrativeReasoning = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.ascension < ASCENSION_4) return;
  for (const characterId of getDeployedCharacterIds(party))
    if (characterId !== combatant.characterId)
      buffKitMember(kitEffectState, characterId, {
        amount: PENETRATIVE_REASONING_ELEMENTAL_MASTERY,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: PENETRATIVE_REASONING_SECONDS,
        source: "heizou-a4",
      });
};

// Heizou's behaviour: Fudou Style Vacuum Slugger counts the enemies its aura check tags afresh each cast, and each it
// Tags, up to 4 a cast, that holds an aura Windmuster Iris takes has an Iris cast where it stands, in the first of the
// Four elements it holds. Penetrative Reasoning from Ascension 4 and Constellation 4's Energy are built. His Ascension 1 is
// Not, and neither are Constellations 1 and 6, which need the Declension stacks his press does not read
// Constellation 2 needs Windmuster Kick's Arresting Windtunnel, whose pull and duration the kit does not build
export const createHeizouKitBehaviour = ({ kit, readHit }: KitRecordReader): KitBehaviour => {
  const [irisCheckHit] = kit.elementalBurst.hits;
  // Each Iris takes its element from the aura its enemy holds
  const iris = readHit("iris");
  const createIrisHit = (element: Element): KitHit => ({ ...iris, element });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        addKitStatus(kitEffectState, combatant.characterId, {
          id: IRIS_TAG_STATUS_ID,
          secondsRemaining: kit.elementalBurst.seconds,
          stacks: 0,
        });
      },
    },
    // Each enemy the aura check strikes, up to 4 a cast, is tagged, and one holding an aura the Iris takes has an Iris
    // Cast where it stands, in the first of the four elements it holds
    onKitEvent: (event, { kitEffectState, party }) => {
      if (event.kind !== KitEventKind.DamageTaken || event.hit !== irisCheckHit) return;
      const { enemy, striker } = event;
      const tags = findKitStatus(kitEffectState.effects, striker.characterId, IRIS_TAG_STATUS_ID);
      if (!tags || (tags.stacks ?? 0) >= IRIS_MAX_TAGS) return;
      tags.stacks = (tags.stacks ?? 0) + 1;
      if (striker.constellationCount >= CONSTELLATION_4)
        gainPartyMemberEnergy(
          party,
          striker,
          tags.stacks === 1 ? CONSTELLATION_4_FIRST_TAG_ENERGY : CONSTELLATION_4_LATER_TAG_ENERGY,
        );
      const element = findAbsorbedElement([enemy]);
      if (element === undefined) return;
      castKitSummon(kitEffectState, createKitBody(enemy.position), striker, [createIrisHit(element)], {
        attackTag: AttackTag.ElementalBurst,
      });
    },
    skill: { hits: [{ onStrike: addPenetrativeReasoning }] },
    skillHolds: [{ hits: [{ onStrike: addPenetrativeReasoning }] }],
  };
};
