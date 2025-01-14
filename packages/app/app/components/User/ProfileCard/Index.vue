<!-- eslint-disable perfectionist/sort-objects -->
<script setup lang="ts">
import type { UpdateUserInput } from "#shared/db/schema/users";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useUserStore } from "@/store/user";
import deepEqual from "fast-deep-equal";

const { backgroundOpacity20 } = useColors();
const userStore = useUserStore();
const { updateAuthUser } = userStore;
const { authUser } = storeToRefs(userStore);
const profileCardRows = computed(() => {
  if (!authUser.value)
    throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(DatabaseEntityType.User) });

  return {
    name: {
      type: RowValueType.Text,
      value: authUser.value.name,
    },
    image: {
      type: RowValueType.Image,
      value: authUser.value.image,
    },
  } as const;
});
const profileCardRowValues = computed(
  () =>
    Object.entries(profileCardRows.value).reduce<Record<string, unknown>>((acc, [prop, row]) => {
      acc[prop] = row.value;
      return acc;
    }, {}) as UpdateUserInput,
);
const editedProfileCardRows = ref(structuredClone(profileCardRowValues.value));
const editMode = ref(false);
const isValid = ref(true);
const isUpdated = computed(() => isValid.value && !deepEqual(profileCardRowValues.value, editedProfileCardRows.value));
</script>

<template>
  <div class="text-h6" font-bold>Profile</div>
  <div class="text-subtitle-1">Your personal information</div>
  <v-form
    v-model="isValid"
    @submit.prevent="
      async () => {
        await updateAuthUser(editedProfileCardRows);
        editMode = false;
      }
    "
  >
    <StyledCard mt-6 p-2="!">
      <v-card-title>
        <div font-bold>Personal Information</div>
        <v-divider mt-2 />
      </v-card-title>
      <v-container px-0="!" py-6="!">
        <UserProfileCardRow
          v-for="(row, title) of profileCardRows"
          :key="title"
          v-model="editedProfileCardRows[title]"
          px-4
          :title
          :row="{
            type: row.type,
            value: row.value,
          }"
          :edit-mode
        />
      </v-container>
      <v-card-actions px-4="!">
        <template v-if="editMode">
          <v-btn variant="outlined" @click="editMode = false">Cancel</v-btn>
          <StyledButton
            type="submit"
            :button-props="{
              disabled: !isUpdated,
            }"
          >
            Save
          </StyledButton>
        </template>
        <v-btn v-else variant="elevated" color="border" @click="editMode = true">
          <span font-bold>Edit Settings</span>
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-form>
</template>

<style scoped lang="scss">
.v-row:nth-of-type(even) {
  background-color: v-bind(backgroundOpacity20);
}
</style>
