<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");
const submit = async () => {
  const newName = name.value;
  name.value = "";
  await createRole({ name: newName, permissions: 0n, position: 0, roomId });
};
</script>

<!-- Discord creates a placeholder role and has you rename it in the editor. Named here instead: a role's name is
     the whole of it at creation, and one that exists before it has one shows up in every member's role list as
     "new role" until someone finishes the job -->
<template>
  <UiForm flex gap-2 items-start @submit="submit()">
    <UiTextField v-model="name" is-label-hidden label="New role name" placeholder="Create role..." flex-1 min-w-0 />
    <UiIconButton
      :disabled="!createRoleInputSchema.shape.name.safeParse(name).success"
      label="Create role"
      :meaning="UiIconMeaning.Create"
      type="submit"
      :variant="UiButtonVariant.Quiet"
    />
  </UiForm>
</template>
