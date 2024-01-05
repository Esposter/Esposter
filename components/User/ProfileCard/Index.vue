<script setup lang="ts">
import { type User } from "@/db/schema/users";
import { type EditedRow } from "@/models/user/ProfileCard/EditedRow";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import { type UpdateUserInput } from "@/server/trpc/routers/user";
import { useUserStore } from "@/store/user";

interface UserProfileCardProps {
  user: User;
}

const { user } = defineProps<UserProfileCardProps>();
const { backgroundOpacity20 } = useColors();
const userStore = useUserStore();
const { updateAuthUser } = userStore;
const profileCardRows = ref<Record<keyof UpdateUserInput, EditedRow>>({
  // @TODO: https://github.com/trpc/trpc/issues/1937
  // avatar: {
  //   type: RowValueType.Image,
  //   value: user.image,
  //   editedValue: user.image,
  // },
  name: {
    type: RowValueType.Text,
    value: user.name,
    editedValue: user.name,
  },
});
const editMode = ref(false);
</script>

<template>
  <div class="text-h6" font-bold>Profile</div>
  <div class="text-subtitle-1">Your personal information</div>
  <StyledCard mt-6 p-2="!">
    <v-card-title>
      <div font-bold>Personal Information</div>
      <v-divider mt-2 />
    </v-card-title>
    <v-container px-0="!" py-6="!">
      <!-- @TODO: https://github.com/vuejs/language-tools/issues/3830 -->
      <!-- eslint-disable-next-line vue/valid-v-bind -->
      <UserProfileCardRow
        v-for="[title, row] in Object.entries(profileCardRows)"
        :key="title"
        v-model="row.editedValue"
        px-4
        :title
        :row="{
          type: row.type,
          value: row.value,
        }"
        :edit-mode="editMode"
      />
    </v-container>
    <v-card-actions px-4="!">
      <template v-if="editMode">
        <v-btn
          variant="outlined"
          @click="
            async () => {
              const updateUserInput = Object.entries(profileCardRows).reduce((acc, [prop, row]) => {
                acc[prop as keyof UpdateUserInput] = row.editedValue;
                return acc;
              }, {} as UpdateUserInput);
              await updateAuthUser(updateUserInput);
              editMode = false;
            }
          "
        >
          Cancel
        </v-btn>
        <StyledButton>Save</StyledButton>
      </template>
      <v-btn v-else variant="elevated" color="border" @click="editMode = true">
        <span font-bold>Edit Settings</span>
      </v-btn>
    </v-card-actions>
  </StyledCard>
</template>

<style scoped lang="scss">
.v-row:nth-of-type(even) {
  background-color: v-bind(backgroundOpacity20);
}
</style>
