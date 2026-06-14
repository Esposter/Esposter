<!-- @BIG CREDIT TO Braedon Wooding for providing the base animation code for this AMAZING card carousel -->
<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

import { dayjs } from "#shared/services/dayjs";
import CardBase from "@/components/Visual/Card/Base.vue";
import { takeOne } from "@esposter/shared";

interface CardStyleVariables {
  marginRight?: string;
  oldMarginRight?: string;
  oldScaleY?: string;
  scaleY?: string;
}
interface VisualCardCarouselProps {
  cards: Card[];
  cardScaleYRatioLoss?: number;
  cardTemplate?: Component;
  duration?: number;
  maxShownCards?: number;
}

const {
  cards,
  // Ratio of how much shorter the next card is
  cardScaleYRatioLoss = 0.05,
  cardTemplate = CardBase,
  // Duration before cards move
  duration = dayjs.duration(10, "seconds").asMilliseconds(),
  maxShownCards = 5,
} = defineProps<VisualCardCarouselProps>();
/**
 * Generate CSS card styling for smooth, non-jumping animations.
 * Layout is a 1x2 grid: the left item holds the moving card, the right item holds the stack.
 * - The left card animates right -> left, then back to the right for the next card.
 * - Each right card has its own animation describing how it moves to the next position.
 * The right stack size is variable (up to maxShownCards) and breakpoints change card sizing,
 * so we offload the work to SASS generation + Vue style variables and keep the styling generic.
 * When card count exceeds the maximum, the shuffle is kept subtle:
 * - Hide the old last card behind the second-last one.
 * - Slide the left card to the far right.
 * - Shuffle every other right card left, exposing a new card atop the second right-most.
 */
// Fake card ids are just the card indexes, so we can "rotate" by incrementing the whole list by 1.
// They double as a z-index.
const cardIds = ref<number[]>(cards.map((_card, index) => index));
// The active card is the card that's moving from right -> left -> right.
const activeCardId = ref<number>();
const inactiveCardId = ref<number>();

const classes = computed<string[]>(() => {
  const newClasses = [];
  for (const cardId of cardIds.value) newClasses.push(getClass(cardId));
  return newClasses;
});
// Four card classes:
// - Active: moving right -> left -> right.
// - Overflow: hidden behind the second-last card, no animation.
// - Inactive: was active, now the right-most card, animating to overflow (in some cases).
// - Normal: a right-stack card making its way to become active.
const getClass = (cardId: number): string => {
  const offset = cardIds.value.indexOf(cardId);
  if (cardId === activeCardId.value) return "active-card";
  // In the initial state, set the last card as inactive.
  if ((inactiveCardId.value === undefined && cardId === maxShownCards) || cardId === inactiveCardId.value)
    return "inactive-card";
  else if (offset > maxShownCards - 2) return "overflow-card";
  return `normal-card-${offset}`;
};
// Main timer driving card movement.
const moveCardsTimer = ref<number>();
// Mark the top-right card active, move it to the end of the array, then unmark it after a timeout.
const moveCards = () => {
  if (cards.length === 0) return;
  else if (cards.length === 1) {
    moveOneCard();
    return;
  }

  inactiveCardId.value = activeCardId.value;
  activeCardId.value = takeOne(cardIds.value);
  // "Rotate" the cards.
  cardIds.value = cardIds.value.map((id) => (id + 1) % cards.length);
};

const moveOneCard = () => {
  inactiveCardId.value = activeCardId.value;
  if (activeCardId.value === undefined) activeCardId.value = cardIds.value[0];
  else activeCardId.value = undefined;
};
// Re-animate on every screen change to avoid cards getting stuck in weird positions.
const { thresholds, width } = useVDisplay();

const gap = computed<string>(() => {
  let gap = 2;
  if (width.value >= thresholds.value.xxl) gap = 6;
  else if (width.value >= thresholds.value.xl) gap = 3;
  return `${gap}rem`;
});
// Each card from right -> left gains margin, multiplied by this breakpoint-dependent scale.
const scale = computed<number>(() => {
  let scale = 1;
  if (width.value >= thresholds.value.xxl) scale = 2.5;
  else if (width.value >= thresholds.value.xl) scale = 1.25;
  return scale;
});

const normalCardStyles = computed<CardStyleVariables[]>(() => {
  // Count the cards we care about, ignoring the moving card.
  const numberOfCards = Math.min(maxShownCards, cards.length - 1);
  const items: CardStyleVariables[] = [];
  // Walk from the right-most card leftwards so each card can reuse its right neighbour's
  // MarginRight/scaleY as its own oldMarginRight/oldScaleY (animation flows right -> left).
  // Reversed at the end to restore LTR chronological order.
  for (let i = 0; i < numberOfCards; i++)
    items.push({
      marginRight: `${i * scale.value}rem`,
      oldMarginRight: i === 0 ? inactiveCardStyle.value.marginRight : takeOne(items, items.length - 1).marginRight,
      oldScaleY: i === 0 ? inactiveCardStyle.value.scaleY : takeOne(items, items.length - 1).scaleY,
      scaleY: `${1 - Math.max(0, cardScaleYRatioLoss * (numberOfCards - 1 - i))}`,
    });

  items.reverse();
  // Pad the rest so we don't operate on undefined.
  for (let i = numberOfCards; i < maxShownCards; i++) items.push({});
  return items;
});

const activeCardStyle = computed<CardStyleVariables>(() => ({
  oldMarginRight: normalCardStyles.value.length > 0 ? takeOne(normalCardStyles.value).marginRight : "0",
}));

const inactiveCardStyle = computed<CardStyleVariables>(() => {
  // Size is irrelevant with a single card.
  if (cards.length === 1) return { scaleY: "1" };
  return { scaleY: `${1 - cardScaleYRatioLoss * (Math.min(maxShownCards, cards.length - 1) - 1)}` };
});

onMounted(() => {
  // Comment this line out when debugging animations so the cards stop moving on you.
  if (duration > 0) moveCardsTimer.value = window.setInterval(moveCards, duration);
  moveCards();
});

onUnmounted(() => {
  clearInterval(moveCardsTimer.value);
});
// Refresh the entire display back to the first step whenever cards update.
watch(
  () => cards,
  (newCards) => {
    cardIds.value = newCards.map((_card, index) => index);
    inactiveCardId.value = undefined;
    activeCardId.value = 0;
  },
);
</script>

<template>
  <div flex-1 grid grid-cols-2>
    <div
      v-for="(card, index) of cards"
      :key="index"
      :style="{ zIndex: cardIds.length - cardIds.indexOf(index) }"
      :class="classes[cardIds.indexOf(index)]"
      row="start-1"
      col="start-2"
    >
      <VisualRotatingDiv>
        <component :is="cardTemplate" :card />
      </VisualRotatingDiv>
    </div>
  </div>
</template>

<style scoped lang="scss">
// The JS code handles breakpoints/variables for each card.
.active-card {
  // Active cards always show at the very top.
  z-index: 100 !important;
  // Fake grid-gap.
  padding-right: v-bind(gap);
  animation: active-card 2s ease both;
}

@keyframes active-card {
  0% {
    // Active cards have no scale/translate.
    transform: translateX(0%) scaleY(1);
    // Subtract v-bind(gap) since it has that much padding.
    margin-right: calc(v-bind("activeCardStyle.oldMarginRight") - v-bind(gap));
  }
  // End on the left, waiting to be sent back to the right.
  100% {
    transform: translateX(-100%) scaleY(1);
    margin-right: 0;
  }
}

.inactive-card {
  z-index: 0;
  animation: inactive-card 3s ease both;
}

@keyframes inactive-card {
  0% {
    // No scale/translate.
    transform: translateX(-100%) scale(1);
    margin-right: 0;
    padding-right: v-bind(gap);
  }
  // Delay moving left until 20%.
  20% {
    transform: translateX(-100%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
    padding-right: v-bind(gap);
  }
  // Avoid the weird squishing look.
  90% {
    transform: translateX(0%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }
  // End on the left, waiting to be sent back to the right.
  100% {
    transform: translateX(0%) scaleY(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }
}

.overflow-card {
  // Could be optimised by not rendering these, but that's more than a display:none
  // since we'd need to handle the top card becoming normal.
  display: none;
}
// Vue's SFC v-bind pickup runs precss (before sass), so we can't use sass variables there,
// but its variable rewriting runs after postcss, letting us build v-binds like this.
@function sassVariableRename($char, $other) {
  @return "v-bind" + "('normalCardStyles[#{$char}].#{$other}')";
}

@for $i from 0 through 3 {
  .normal-card-#{$i} {
    animation: normal-card-#{$i} 2.5s ease both;
    margin-right: #{sassVariableRename($i, "marginRight")};
    transform: scaleY(#{sassVariableRename($i, "scaleY")});
  }

  @keyframes normal-card-#{$i} {
    0% {
      margin-right: #{sassVariableRename($i, "oldMarginRight")};
      transform: scaleY(#{sassVariableRename($i, "oldScaleY")});
    }

    20% {
      margin-right: #{sassVariableRename($i, "oldMarginRight")};
      transform: scaleY(#{sassVariableRename($i, "oldScaleY")});
    }

    40% {
      transform: scaleY(#{sassVariableRename($i, "scaleY")});
    }

    100% {
      margin-right: #{sassVariableRename($i, "marginRight")};
      transform: scaleY(#{sassVariableRename($i, "scaleY")});
    }
  }
}
// Vue picks up bindings before SASS runs, so we must list every variable here.
// Ugly, but it avoids listing out each class manually.
.force-vue-to-pickup-bindings {
  left: v-bind("takeOne(normalCardStyles).marginRight");
  left: v-bind("takeOne(normalCardStyles).oldMarginRight");
  left: v-bind("takeOne(normalCardStyles).scaleY");
  left: v-bind("takeOne(normalCardStyles).oldScaleY");
  left: v-bind("takeOne(normalCardStyles).marginRight");
  left: v-bind("takeOne(normalCardStyles).oldMarginRight");
  left: v-bind("takeOne(normalCardStyles, 1).scaleY");
  left: v-bind("takeOne(normalCardStyles, 1).oldScaleY");
  left: v-bind("takeOne(normalCardStyles, 2).marginRight");
  left: v-bind("takeOne(normalCardStyles, 2).oldMarginRight");
  left: v-bind("takeOne(normalCardStyles, 2).scaleY");
  left: v-bind("takeOne(normalCardStyles, 2).oldScaleY");
  left: v-bind("takeOne(normalCardStyles, 3).marginRight");
  left: v-bind("takeOne(normalCardStyles, 3).oldMarginRight");
  left: v-bind("takeOne(normalCardStyles, 3).scaleY");
  left: v-bind("takeOne(normalCardStyles, 3).oldScaleY");
}
</style>
