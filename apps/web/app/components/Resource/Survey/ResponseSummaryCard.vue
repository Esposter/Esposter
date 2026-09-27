<script setup lang="ts">
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";

import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { SURVEY_SUMMARY_AXIS_HEIGHT, SURVEY_SUMMARY_BAR_HEIGHT } from "@/services/survey/summary/constants";
import { pluralize } from "#shared/util/text/pluralize";

interface Props {
  card: SurveySummaryCard;
}

const { card } = defineProps<Props>();
const emit = defineEmits<{ showIndividual: [] }>();
const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
// A bar per choice, each labelled with its count and its share of the responses that answered
const chart = computed(() => {
  if (card.type !== SurveySummaryCardType.Choice) return undefined;
  const { answeredCount, choices } = card;
  return {
    options: {
      chart: {
        height: choices.length * SURVEY_SUMMARY_BAR_HEIGHT + SURVEY_SUMMARY_AXIS_HEIGHT,
        toolbar: { show: false },
      },
      dataLabels: {
        formatter: (count: number) =>
          `${count} (${numberFormat.format(answeredCount ? (count / answeredCount) * 100 : 0)}%)`,
      },
      plotOptions: { bar: { horizontal: true } },
      xaxis: { categories: choices.map(({ label }) => label) },
    },
    series: [{ data: choices.map(({ count }) => count), name: "Responses" }],
  };
});
</script>

<template>
  <section p-4 flex flex-col gap-2 ui-frame>
    <h3 ui-title>{{ card.title }}</h3>
    <p text-sm text-muted>{{ card.answeredCount }} {{ pluralize("response", card.answeredCount) }}</p>
    <template v-if="card.type === SurveySummaryCardType.Choice && chart">
      <p v-if="card.average !== undefined">Average {{ numberFormat.format(card.average) }}</p>
      <StyledApexChart :options="chart.options" :series="chart.series" type="bar" />
    </template>
    <dl v-else-if="card.type === SurveySummaryCardType.Number" flex flex-wrap gap-6>
      <div
        v-for="[term, value] of [
          ['Minimum', card.minimum],
          ['Average', card.average],
          ['Maximum', card.maximum],
        ] as const"
        :key="term"
      >
        <dt text-sm text-muted>{{ term }}</dt>
        <dd>{{ numberFormat.format(value) }}</dd>
      </div>
    </dl>
    <template v-else-if="card.type === SurveySummaryCardType.Text">
      <ul v-if="card.answers.length > 0" flex flex-col gap-1>
        <li v-for="(answer, index) of card.answers" :key="index" p-2 ws-pre-wrap ui-field>{{ answer }}</li>
      </ul>
      <UiButton v-if="card.answeredCount > card.answers.length" self-start @click="emit('showIndividual')">
        See every answer
      </UiButton>
    </template>
  </section>
</template>
