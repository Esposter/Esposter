<script setup lang="ts">
import { Survey } from "@/models/surveyer/Survey";
</script>

<template>
  <SurveyerCreateSurveyDialog :initial-value="new Survey()" :card-props="{ title: 'Create Survey' }">
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Create Survey">
        <template #activator="{ props }">
          <v-btn variant="elevated" :flat="false" :="props" @click="updateIsOpen(true)">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </SurveyerCreateSurveyDialog>
</template>
