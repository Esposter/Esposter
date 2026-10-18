<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { GENSHIN_RARITY_LINE_PREFIX, PERCENT_FORMAT } from "@/services/agentConsole/constants";
import { getLoreRates } from "@/services/agentConsole/getLoreRates";
import { getSessionStartLine } from "@/services/agentConsole/getSessionStartLine";
import { getStarColor } from "@/services/agentConsole/getStarColor";

interface Props {
  // The character's name, which the nameplate reads
  avatar: string;
  // The session-start hook's context, which carries the character's stars and, when the lore pick drew it, the rows
  sessionStartContext: string;
}

const { avatar, sessionStartContext } = defineProps<Props>();
const rarity = computed(() => Number(getSessionStartLine(sessionStartContext, GENSHIN_RARITY_LINE_PREFIX)));
const starColor = computed(() => getStarColor(rarity.value));
const stars = computed(() => "★".repeat(rarity.value));
const loreRates = computed(() => getLoreRates(sessionStartContext));
const maxProbability = computed(() => Math.max(...loreRates.value.map(({ probability }) => probability)));
// A session the lore pick drew falls its star in; one a pin or a birthday chose has no rows, so its nameplate is there
// From the start
const isFalling = computed(() => loreRates.value.length > 0);
const isLanded = ref(!isFalling.value);
const isRatesShown = ref(false);
</script>

<template>
  <div absolute inset-0 pointer-events-none>
    <AgentConsoleThemeGenshinFallingStar v-if="isFalling && !isLanded" :color="starColor" @land="isLanded = true" />
    <div v-if="isLanded" absolute inset-x-0 class="bottom-1/4" flex flex-col items-center gap-2 pointer-events-auto>
      <ul v-if="isRatesShown" w-64 flex flex-col gap-2 bg-background p-3 rounded>
        <li v-for="{ displayName, name, probability } in loreRates" :key="name" flex flex-col gap-1>
          <span flex items-center gap-2>
            <UiItemContent is-markless :title="displayName">
              <template #append>
                <span text-muted>{{ PERCENT_FORMAT.format(probability) }}</span>
              </template>
            </UiItemContent>
          </span>
          <span block h-1 rounded-full bg-accent :style="{ width: `${(probability / maxProbability) * 100}%` }" />
        </li>
      </ul>
      <span :style="{ color: starColor }">{{ stars }}</span>
      <span font-bold>{{ avatar }}</span>
      <UiButton
        v-if="isFalling"
        :aria-expanded="isRatesShown"
        :variant="UiButtonVariant.Quiet"
        @click="isRatesShown = !isRatesShown"
      >
        Rates
      </UiButton>
    </div>
  </div>
</template>
