import type { Element } from "#src/models/Element";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
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
// Four elements it holds. Penetrative Reasoning from Ascension 4 is built, and his Ascension 1 and constellations are not,
// As the Declension stacks they add are not read by his press
// Constellation 1 needs a Declension stack for Heartstopper Strike and the Normal Attack SPD, neither built
// Constellation 2 needs Windmuster Kick's Arresting Windtunnel, whose pull and duration the kit does not build
// Constellation 4 needs the explosions each Windmuster Kick counts, which the kit does not count, not built
// Constellation 6 needs Heartstopper Strike's Declension stacks and Conviction, which are not built
export const createHeizouKitBehaviour = ({ kit, readHit }: KitRecordReader): KitBehaviour => {
  const [irisCheckHit] = kit.elementalBurst.hits;
  // Each Iris takes its element from the aura its enemy holds
  const iris = readHit("iris");
  const createIrisHit = (element: Element): KitHit => ({ ...iris, element });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        addKitStatus(kitEffectState, combatant.characterId, {
          id: IRIS_TAG_STATUS_ID,
          secondsRemaining: kit.elementalBurst.seconds,
          stacks: 0,
        }),
    },
    // Each enemy the aura check strikes, up to 4 a cast, is tagged, and one holding an aura the Iris takes has an Iris
    // Cast where it stands, in the first of the four elements it holds
    onKitEvent: (event, { kitEffectState }) => {
      if (event.kind !== KitEventKind.DamageTaken || event.hit !== irisCheckHit) return;
      const { enemy, striker } = event;
      const tags = findKitStatus(kitEffectState.effects, striker.characterId, IRIS_TAG_STATUS_ID);
      if (!tags || (tags.stacks ?? 0) >= IRIS_MAX_TAGS) return;
      tags.stacks = (tags.stacks ?? 0) + 1;
      const element = findAbsorbedElement([enemy]);
      if (element === undefined) return;
      castKitSummon(kitEffectState, { facing: 0, height: 0, position: enemy.position }, striker, [
        createIrisHit(element),
      ]);
    },
    skill: { hits: [{ onStrike: addPenetrativeReasoning }] },
    skillHolds: [{ hits: [{ onStrike: addPenetrativeReasoning }] }],
  };
};
