<script setup lang="ts">
import type { OptionMenuItem } from "@/models/esbabbler/message/OptionMenuItem";

import { authClient } from "@/services/auth/authClient";
import { useEsbabblerStore } from "@/store/esbabbler";

interface FileOptionsMenuProps {
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
}

const { hoverProps, isHovering } = defineProps<FileOptionsMenuProps>();
const emit = defineEmits<{ delete: [] }>();
const esbabblerStore = useEsbabblerStore();
const { optionsMenu } = storeToRefs(esbabblerStore);
const { data: session } = await authClient.useSession(useFetch);
const menuItems: OptionMenuItem[] = [
  {
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      emit("delete");
    },
    title: "Delete",
  },
];
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <v-tooltip v-for="{ icon, shortTitle, title, onClick } of menuItems" :key="title" :text="shortTitle ?? title">
        <template #activator="{ props }">
          <v-btn m-0="!" rd-none="!" :icon size="small" :="props" @click="onClick" />
        </template>
      </v-tooltip>
    </v-card-actions>
  </StyledCard>
</template>
