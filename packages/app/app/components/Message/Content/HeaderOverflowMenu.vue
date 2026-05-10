<script setup lang="ts">
import { mergeProps } from "vue";
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props }">
      <v-tooltip location="bottom" text="More">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="mergeProps(props, tooltipProps)" icon="mdi-dots-vertical" size="small" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <div flex pa-1>
        <MessageContentHeaderActionButtons />
      </div>
    </StyledCard>
  </v-menu>
</template>
