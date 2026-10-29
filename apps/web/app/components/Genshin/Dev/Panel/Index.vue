<script setup lang="ts">
import type { DevReading } from "@/models/genshin/dev/DevReading";
import type { DevRegistry, DevResult, DevScenario } from "genshin-world";

import { GENSHIN_DEV_SCENARIOS_TAB } from "@/services/genshin/dev/constants";
import { getDevTabName } from "@/services/genshin/dev/getDevTabName";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getOrCreate } from "@esposter/shared";

interface Props {
  registry: DevRegistry;
}

// The development panel, a drawer on the right: the registry's variables as controls, one tab per name a group starts
// With and one frame per group in it, and its scenarios as buttons in the last tab. It reads the registry again whenever
// The registry changes, and it never takes the keyboard, so the game keeps running under it
const isOpen = defineModel<boolean>({ required: true });
const { registry } = defineProps<Props>();
const readings = shallowRef<DevReading[]>([]);
const scenarios = shallowRef<readonly DevScenario[]>([]);
const scenarioResult = shallowRef<DevResult>();
const tab = useLocalStorage(LocalStorageKey.GenshinDevPanelTab, "");

const refresh = () => {
  readings.value = registry.getVariables().map((variable) => ({ value: variable.get(), variable }));
  scenarios.value = registry.getScenarios();
};
refresh();
onScopeDispose(registry.subscribe(refresh));

const tabItems = computed(() =>
  [...new Set(readings.value.map(({ variable }) => getDevTabName(variable.group))), GENSHIN_DEV_SCENARIOS_TAB].map(
    (name) => ({ title: name, value: name }),
  ),
);
const selectedTab = computed({
  get: () => (tabItems.value.some(({ value }) => value === tab.value) ? tab.value : (tabItems.value[0]?.value ?? "")),
  set: (value) => {
    tab.value = value;
  },
});
const sections = computed(() => {
  const groupMap = new Map<string, DevReading[]>();
  for (const reading of readings.value)
    if (getDevTabName(reading.variable.group) === selectedTab.value)
      getOrCreate(groupMap, reading.variable.group, () => []).push(reading);

  return Array.from(groupMap, ([group, items]) => ({ group, items, title: group.slice(selectedTab.value.length + 1) }));
});
</script>

<template>
  <UiFrame v-if="isOpen" fixed top-0 right-0 bottom="[var(--dock-inset-block-end)]" w="[24rem]" title="Developer panel">
    <template #actions>
      <UiButton @click="isOpen = false">Close</UiButton>
    </template>
    <UiTabs v-model="selectedTab" :items="tabItems" label="Developer panel sections" is-filling>
      <template #default="{ value: tabName }">
        <div v-if="tabName === GENSHIN_DEV_SCENARIOS_TAB" ui-body flex flex-col gap-2>
          <UiButton
            v-for="scenario in scenarios"
            :key="scenario.name"
            @click="scenarioResult = registry.runScenario(scenario)"
          >
            {{ scenario.name }}
          </UiButton>
          <p v-if="scenarioResult">{{ scenarioResult.ok ? "Done" : scenarioResult.error }}</p>
        </div>
        <div v-else flex flex-col gap-3>
          <UiFrame v-for="section in sections" :key="section.group" :title="section.title">
            <GenshinDevPanelVariable
              v-for="{ value, variable } in section.items"
              :key="variable.name"
              :value
              :variable
              @set="(newValue) => registry.run(`set ${variable.name} ${newValue}`)"
            />
          </UiFrame>
        </div>
      </template>
    </UiTabs>
  </UiFrame>
</template>
