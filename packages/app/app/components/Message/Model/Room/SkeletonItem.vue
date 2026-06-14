<template>
  <v-skeleton-loader type="list-item-avatar" :loading="true" />
</template>

<style scoped>
:deep(.v-skeleton-loader__avatar) {
  min-width: var(--avatar-width);
  min-height: var(--avatar-width);
  width: var(--avatar-width);
  height: var(--avatar-width);
}
</style>
