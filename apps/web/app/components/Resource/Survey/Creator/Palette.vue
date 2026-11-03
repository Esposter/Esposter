<script setup lang="ts">
import { SURVEY_PALETTE_GROUPS } from "@/services/resource/survey/constants";
import { surveyNodeTypeDefinitionMap } from "survey-engine";

const { insertNode } = useSurveyCreatorCommands();
</script>

<template>
  <div flex flex-col gap-3>
    <section v-for="{ category, types } of SURVEY_PALETTE_GROUPS" :key="category" flex flex-col gap-1>
      <h3 text-muted ui-title>{{ category }}</h3>
      <UiButton v-for="type of types" :key="type" w-full @click="insertNode(type)">
        {{ surveyNodeTypeDefinitionMap[type].label }}
      </UiButton>
    </section>
  </div>
</template>
