<template>
  <div flex>
    <v-skeleton-loader self-start type="avatar" :loading="true" />
    <div w-full>
      <v-skeleton-loader type="heading" :loading="true" width="20%" />
      <v-skeleton-loader type="paragraph" :loading="true" />
    </div>
  </div>
</template>

<style scoped>
:deep(.v-skeleton-loader__avatar) {
  margin-right: 0;
  min-width: var(--avatar-width);
  min-height: var(--avatar-width);
  width: var(--avatar-width);
  height: var(--avatar-width);
}

:deep(.v-skeleton-loader__heading) {
  margin-bottom: 0;
}
</style>
