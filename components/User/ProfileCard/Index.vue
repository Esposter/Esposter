<script setup lang="ts">
// @TODO: https://github.com/vuejs/language-tools/issues/3830
/* eslint-disable vue/valid-v-bind */
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import type { Row } from "@/models/user/ProfileCard/Row";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import type { UpdateUserInput } from "@/models/user/UpdateUserInput";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useUserStore } from "@/store/user";
import deepEqual from "deep-equal";

const { backgroundOpacity20 } = useColors();
const userStore = useUserStore();
const { updateAuthUser } = userStore;
const { authUser } = storeToRefs(userStore);
const profileCardRows = computed<Record<keyof UpdateUserInput, Row>>(() => {
  if (!authUser.value)
    throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(DatabaseEntityType.User) });

  return {
    // @TODO: https://github.com/trpc/trpc/issues/1937
    // avatar: {
    //   type: RowValueType.Image,
    //   value: user.image,
    // },
    name: {
      type: RowValueType.Text,
      value: authUser.value.name,
    },
  };
});
const profileCardRowValues = computed(() =>
  Object.entries(profileCardRows.value).reduce((acc, [prop, row]) => {
    acc[prop as keyof UpdateUserInput] = row.value;
    return acc;
  }, {} as UpdateUserInput),
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
    @submit="
      async (e) => {
        e.preventDefault();
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
          v-for="(row, title) in profileCardRows"
          :key="title"
          v-model="editedProfileCardRows[title as keyof UpdateUserInput]"
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
