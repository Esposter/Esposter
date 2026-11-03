<script setup lang="ts">
import { SurveyNodeType, surveyNodeTypeDefinitionMap } from "survey-engine";

// The kinds the palette offers, in the groups it draws them under. The page is the toolbar's to add
const PALETTE_GROUPS: { category: string; types: SurveyNodeType[] }[] = [
  {
    category: "Input",
    types: [
      SurveyNodeType.Text,
      SurveyNodeType.Comment,
      SurveyNodeType.Boolean,
      SurveyNodeType.RadioGroup,
      SurveyNodeType.Dropdown,
      SurveyNodeType.Checkbox,
      SurveyNodeType.TagBox,
      SurveyNodeType.ButtonGroup,
      SurveyNodeType.Rating,
      SurveyNodeType.Slider,
      SurveyNodeType.MultipleText,
    ],
  },
  {
    category: "Choice grids and lists",
    types: [
      SurveyNodeType.Ranking,
      SurveyNodeType.ImagePicker,
      SurveyNodeType.Matrix,
      SurveyNodeType.MatrixDynamic,
      SurveyNodeType.PanelDynamic,
    ],
  },
  { category: "Content", types: [SurveyNodeType.Html, SurveyNodeType.Image, SurveyNodeType.Expression] },
  { category: "Layout", types: [SurveyNodeType.Panel] },
];
const { insertNode } = useSurveyCreatorCommands();
</script>

<template>
  <div flex flex-col gap-3>
    <section v-for="{ category, types } of PALETTE_GROUPS" :key="category" flex flex-col gap-1>
      <h3 text-muted ui-title>{{ category }}</h3>
      <UiButton v-for="type of types" :key="type" w-full @click="insertNode(type)">
        {{ surveyNodeTypeDefinitionMap[type].label }}
      </UiButton>
    </section>
  </div>
</template>
