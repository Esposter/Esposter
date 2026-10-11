import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { Attribute } from "#src/models/character/Attribute";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";

const checkIsElectroCharged = ({ reactionType }: Reaction): boolean =>
  reactionType === TransformativeReactionType.ElectroCharged;

// The ticks one combatant owns on an enemy, with the reactions they triggered there, dealt from it. A Burning tick's own
// Damage is priced here, as the hit that lights Burning deals none of it, and the tick reaches on with the rest
const strikeOwnedTicks = (
  enemy: Enemy,
  kind: EnemyKind,
  reactions: Reaction[],
  combatant: Combatant | undefined,
  context: KitStrikeContext,
): void => {
  if (!combatant || reactions.length === 0) return;
  const { characterIdCombatantMap, party } = context;
  const { characterId, level } = combatant;
  const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
  const { reachingReactions, transformativeDamage } = priceEnemyReactions(kind, enemy, reactions, combatant, undefined);
  let burningDamage = 0;
  for (const { element, reactionType, spreadGauge } of reactions) {
    if (reactionType !== TransformativeReactionType.Burning) continue;
    burningDamage +=
      applyReactionInternalCooldown(
        enemy.internalCooldownMap,
        characterId,
        reactionType,
        element,
        enemy.elementalState.seconds,
      ) * getTransformativeDamage(reactionType, level, elementalMastery, getEnemyResistance(kind, enemy, element));
    reachingReactions.push({ element, reactionType, spreadGauge });
  }
  for (const energyDrop of damageEnemy(enemy, { damage: transformativeDamage + burningDamage, poiseDamage: 0 }))
    gainPartyEnergy(party, energyDrop, combatant.element, characterIdCombatantMap);
  landKitReactionReaches(
    reachingReactions.map((reaction): [Enemy, TransformativeReaction] => [enemy, reaction]),
    combatant,
    context,
  );
};

// The reactions the standing enemies' elements brought on their own since the last step, struck and emptied. The
// Electro-Charged ticks are dealt from the combatant whose element last charged the enemy, and the Burning ticks, with
// What their Pyro triggered there, from the one whose element last lit or fed its Burning, each dropping the enemy's
// Energy to the team and reaching on as its reach does. A tick no combatant owns deals nothing
export const strikeElementalTicks = (context: KitStrikeContext): void => {
  const { enemyMap, enemyTables } = context;
  for (const enemy of enemyMap.values()) {
    const { burningCombatant, electroChargedCombatant, elementalReactions: reactions } = enemy;
    if (reactions.length === 0) continue;
    enemy.elementalReactions = [];
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) continue;
    const kind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
    // Only a Burning tick's Pyro triggers reactions of its own, so every reaction but Electro-Charged's is Burning's
    strikeOwnedTicks(
      enemy,
      kind,
      reactions.filter((reaction) => checkIsElectroCharged(reaction)),
      electroChargedCombatant,
      context,
    );
    strikeOwnedTicks(
      enemy,
      kind,
      reactions.filter((reaction) => !checkIsElectroCharged(reaction)),
      burningCombatant,
      context,
    );
  }
};
