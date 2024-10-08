<!-- @BIG CREDIT TO Braedon Wooding for providing the base animation code for this AMAZING card carousel -->
<script setup lang="ts">
import type { Card } from "@/models/visual/Card";
import type { Component } from "vue";

import CardBase from "@/components/Visual/Card/Base.vue";
import { dayjs } from "@/services/dayjs";

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
 * === Generation of styling for css cards ===
 * This is quite complex, because we want *smooth* animations that don't jump.
 *
 * The rough idea is as follows;
 * - We have a 1x2 grid, this lets us place the cards in either the left or right grid item.
 * - The left grid item has a simple animation that just moves it from the right -> left
 *   - and then back to the right when it's time for the next card.
 * - The right grid items have a series of animations for each individual card
 *   that describes how it animates to the next position
 *
 * The complexity here is that the number of cards shown on the right is variable and not constant.
 * we show up to a max of 5 cards on the right (configurable in code, and maybe later in config).
 * This is not even including the fact that breakpoints mean we need to change the way we size cards
 * respectively...
 *
 * This makes it *feel* extremely complicated to implement but in actuality it's quite simple.
 * We use a mixture of SASS generation + Vue3 Styling Variables to offload the vast majority of the
 * complexity to code (not styling) and just have styling be generic.
 *
 * I've arguably probably over-commented this code just due to the complexity.
 *
 * Something to note is how we handle cards counts larger than our maximum (of 5 by default).
 * What we want to do is make the card 'color' changing effect extremely subtle.
 * - Make the old last card disappear behind the second last one
 * - Giving room to slide the left card to the very right
 * - Every other card on the right shuffles to the left leaving a 'new' card
 *   as the top of the second right-most card.
 */

// === Code ==

interface CardStyleVariables {
  marginRight?: string;
  oldMarginRight?: string;
  oldScaleY?: string;
  scaleY?: string;
}

// We will create fake card ids that are just the indexes of our cards.
// By doing this, we can "rotate" the cards by just incrementing the whole list by 1.
// This can also act as a z index for us to use, which is pretty convenient C:
const cardIds = ref<number[]>(cards.map((_, index) => index));

// the active card is the card that's moving from right -> left -> right.
const activeCardId = ref<number>();
const inactiveCardId = ref<number>();

const classes = computed<string[]>(() => {
  const newClasses = [];
  for (const cardId of cardIds.value) newClasses.push(getClass(cardId));
  return newClasses;
});

// There are 4 types of cards to generate
// Active, this is the card moving from right -> left -> right
// Overflow, these cards don't move since even though we show them they are hidden behind the second last card.  These don't have any animations.
// Inactive, this is a card that used to be active but now is the right most card, now needs an animation to become overflow (in some cases)
// 'Normal', this is just one of the normal cards on the right that make their way to become active.
const getClass = (cardId: number): string => {
  const offset = cardIds.value.indexOf(cardId);
  if (cardId === activeCardId.value) return "active-card";
  // If we're in the initial state, we can just set the last card as inactive
  if ((inactiveCardId.value === undefined && cardId === maxShownCards) || cardId === inactiveCardId.value)
    return "inactive-card";
  else if (offset > maxShownCards - 2) return "overflow-card";
  return `normal-card-${offset}`;
};

// This is the main timer that drives the movement of cards
const moveCardsTimer = ref<number>();

// This marks the first card as active (which is the top card on the right)
// then moves it to the end of the array, and after a timeout unmarks it as active.
const moveCards = () => {
  if (cards.length === 0) return;
  else if (cards.length === 1) {
    moveOneCard();
    return;
  }

  inactiveCardId.value = activeCardId.value;
  activeCardId.value = cardIds.value[0];
  // "Rotate" the cards
  cardIds.value = cardIds.value.map((id) => (id + 1) % cards.length);
};

const moveOneCard = () => {
  inactiveCardId.value = activeCardId.value;
  if (activeCardId.value === undefined) activeCardId.value = cardIds.value[0];
  else activeCardId.value = undefined;
};

// Everytime the screen changes we animate, this is to avoid the cards getting stuck in weird positions.
const { thresholds, width } = useDisplay();

const gap = computed<string>(() => {
  let gap = 2;
  if (width.value >= thresholds.value.xxl) gap = 6;
  else if (width.value >= thresholds.value.xl) gap = 3;
  return `${gap}rem`;
});

// Every card from right -> left has increasing margin (by 1rem each time)
// this is scaled by 'scale', so in 1920 it's 1.25rem and in 3840 it's 2.5rem
const scale = computed<number>(() => {
  let scale = 1;
  if (width.value >= thresholds.value.xxl) scale = 2.5;
  else if (width.value >= thresholds.value.xl) scale = 1.25;
  return scale;
});

const normalCardStyles = computed<CardStyleVariables[]>(() => {
  // Determine how many cards we have to care about, ignoring 1 card (since it's our moving card)
  const numberOfCards = Math.min(maxShownCards, cards.length - 1);
  const items: CardStyleVariables[] = [];

  // Start from the right most card and calculate recursively by moving left
  // so we are able to use the right-neighbour card's marginRight and scaleY
  // for the current card's oldMarginRight and oldScaleY
  // Remember that our animation flows from right (old) to left (new)
  // We'll reverse the items at the end so it still maintains LTR chronological order
  for (let i = 0; i < numberOfCards; i++)
    items.push({
      marginRight: `${i * scale.value}rem`,
      // Normal cards talk about how they move from their position to the next one
      oldMarginRight: i === 0 ? inactiveCardStyle.value.marginRight : items[items.length - 1].marginRight,
      oldScaleY: i === 0 ? inactiveCardStyle.value.scaleY : items[items.length - 1].scaleY,
      // We lose 10% for each shift
      scaleY: `${1 - Math.max(0, cardScaleYRatioLoss * (numberOfCards - 1 - i))}`,
    });

  items.reverse();

  // We just need items for the rest so that we don't try to do operations on undefined
  for (let i = numberOfCards; i < maxShownCards; i++) items.push({});
  return items;
});

const activeCardStyle = computed<CardStyleVariables>(() => ({
  oldMarginRight: normalCardStyles.value.length > 0 ? normalCardStyles.value[0].marginRight : "0",
}));

const inactiveCardStyle = computed<CardStyleVariables>(() => {
  // Don't care about size if we just have 1 card
  if (cards.length === 1) return { scaleY: "1" };
  return { scaleY: `${1 - cardScaleYRatioLoss * (Math.min(maxShownCards, cards.length - 1) - 1)}` };
});

onMounted(() => {
  // When debugging animations it's often easier to comment out this line so that they don't move on you every so often.
  if (duration > 0) moveCardsTimer.value = window.setInterval(moveCards, duration);
  moveCards();
});

onUnmounted(() => {
  clearInterval(moveCardsTimer.value);
});

// If cards update then we want to refresh the entire display back to the first step.
watch(
  () => cards,
  (newCards) => {
    cardIds.value = newCards.map((_, index) => index);
    inactiveCardId.value = undefined;
    activeCardId.value = 0;
  },
);
</script>

<template>
  <div grid flex-1 grid-cols-2>
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
// The rough idea of the code below is pretty simple
// - The JS code will handle breakpoints/variables for each card
.active-card {
  // active cards always show at the very top
  z-index: 100 !important;
  // fake grid-gap basically
  padding-right: v-bind(gap);
  animation: active-card 2s ease both;
}

@keyframes active-card {
  // We start on the right side
  0% {
    // active cards don't have any scale/translate
    transform: translateX(0%) scaleY(1);
    // subtract v-bind(gap) since it has v-bind(gap)'s worth of padding
    margin-right: calc(v-bind("activeCardStyle.oldMarginRight") - v-bind(gap));
  }

  // at the end of the animation
  // we end up on the left waiting to be sent back to the right
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
  // we start on the right side
  0% {
    // active cards don't have any scale/translate
    transform: translateX(-100%) scale(1);
    margin-right: 0;
    padding-right: v-bind(gap);
  }

  // delay moving to the left for 20%
  20% {
    transform: translateX(-100%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
    padding-right: v-bind(gap);
  }

  // to avoid the weird squishing look
  90% {
    transform: translateX(0%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }

  // at the end of the animation
  // we end up on the left waiting to be sent back to the right
  100% {
    transform: translateX(0%) scaleY(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }
}

.overflow-card {
  // In the future we could optimise them by not showing them
  // (it's a bit more complicated than just a display none,
  // since we need to handle having the top card become normal)
  display: none;
}

// We can't rely on vue's SFC v-bind pickup code, since it runs too early
// we can rely on its variable rewriting code since that runs *after* postcss
// thus we can generate v-binds like this, but the code that picks them up
// runs precss (before sass) meaning we can't use sass variables.
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

// Sadly vue runs its SFC code to pickup bindings *before* SASS runs
// this sadly means that we need to list all variables here.
// This is quite ugly, but does solve having to list out each class manually...
.force-vue-to-pickup-bindings {
  left: v-bind("normalCardStyles[0].marginRight");
  left: v-bind("normalCardStyles[0].oldMarginRight");
  left: v-bind("normalCardStyles[0].scaleY");
  left: v-bind("normalCardStyles[0].oldScaleY");
  left: v-bind("normalCardStyles[1].marginRight");
  left: v-bind("normalCardStyles[1].oldMarginRight");
  left: v-bind("normalCardStyles[1].scaleY");
  left: v-bind("normalCardStyles[1].oldScaleY");
  left: v-bind("normalCardStyles[2].marginRight");
  left: v-bind("normalCardStyles[2].oldMarginRight");
  left: v-bind("normalCardStyles[2].scaleY");
  left: v-bind("normalCardStyles[2].oldScaleY");
  left: v-bind("normalCardStyles[3].marginRight");
  left: v-bind("normalCardStyles[3].oldMarginRight");
  left: v-bind("normalCardStyles[3].scaleY");
  left: v-bind("normalCardStyles[3].oldScaleY");
}
</style>
