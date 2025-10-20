<template>
  <v-skeleton-loader type="list-item-avatar" :loading="true" />
</template>

<style scoped lang="scss">
:deep(.v-skeleton-loader__avatar) {
  min-width: $avatar-width;
  min-height: $avatar-width;
  width: $avatar-width;
  height: $avatar-width;
}
</style>
