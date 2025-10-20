<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { CSSProperties } from "vue";
import type { VListItem } from "vuetify/components";

interface ListItemProps extends Pick<MessageComponentProps<StandardMessageEntity>, "isPreview"> {
  active?: boolean;
}

const { active, isPreview = false } = defineProps<ListItemProps>();
const slots = defineSlots<Record<keyof VListItem["$slots"], () => VNode>>();
const style = computed<CSSProperties>(() =>
  isPreview ? { pointerEvents: "none", userSelect: "none" } : { pointerEvents: "auto", userSelect: "auto" },
);
</script>

<template>
  <v-list-item :active>
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend) {
  align-self: flex-start;

  > :first-child {
    width: $avatar-width;
  }

  > .v-list-item__spacer {
    width: 1rem;
  }
}

:deep(.v-list-item__content) {
  pointer-events: v-bind("style.pointerEvents");
  user-select: v-bind("style.userSelect");
}
// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  line-clamp: unset;
  -webkit-line-clamp: unset;
}
</style>
