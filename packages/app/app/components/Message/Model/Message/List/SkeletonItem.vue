<template>
  <div flex>
    <v-skeleton-loader self-start type="avatar" :loading="true" />
    <div w-full>
      <v-skeleton-loader type="heading" :loading="true" width="20%" />
      <v-skeleton-loader type="paragraph" :loading="true" />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.v-skeleton-loader__avatar) {
  margin-right: 0;
  min-width: $avatar-width;
  min-height: $avatar-width;
  width: $avatar-width;
  height: $avatar-width;
}

:deep(.v-skeleton-loader__heading) {
  margin-bottom: 0;
}
</style>
