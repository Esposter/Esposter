<script setup lang="ts">
const isOpen = ref(true);
const callLink = ref("");

onMounted(() => {
  callLink.value = window.location.href;
});
</script>

<template>
  <StyledCard v-if="isOpen" m-4 max-w-80 p-4 absolute bottom-16 left-0>
    <div flex flex-col gap-y-3>
      <div flex items-center justify-between>
        <span text-body-medium font-medium>Your call's ready</span>
        <v-tooltip text="Close">
          <template #activator="{ props }">
            <v-btn :="props" icon="mdi-close" size="small" variant="plain" @click="isOpen = false" />
          </template>
        </v-tooltip>
      </div>
      <span text-body-small text-medium-emphasis> Share this call link with others you want in the call. </span>
      <div bg-background rd px-2 py-1 flex items-center gap-x-2>
        <span text-body-small truncate>{{ callLink }}</span>
        <StyledClipboardIconButton :source="callLink" text="Copy call link" />
      </div>
    </div>
  </StyledCard>
</template>
