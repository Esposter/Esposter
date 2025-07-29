<!-- eslint-disable perfectionist/sort-objects -->
<script setup lang="ts">
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import { authClient } from "@/services/auth/authClient";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import deepEqual from "fast-deep-equal";

const { data: session } = await authClient.useSession(useFetch);
const { updateUser } = authClient;
const { backgroundOpacity20 } = useColors();
const profileCardRows = computed(() => {
  if (!session.value)
    throw createError({ message: getEntityNotFoundStatusMessage(DatabaseEntityType.User), statusCode: 404 });

  return {
    name: {
      type: RowValueType.Text,
      value: session.value.user.name,
    },
    image: {
      type: RowValueType.Image,
      value: session.value.user.image,
    },
  } as const;
});
const profileCardRowValues = computed(
  () =>
    Object.entries(profileCardRows.value).reduce<Record<string, unknown>>((acc, [property, row]) => {
      acc[property] = row.value;
      return acc;
    }, {}) as { [P in keyof typeof profileCardRows.value]: (typeof profileCardRows.value)[P]["value"] },
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
        await updateUser(editedProfileCardRows);
        editMode = false;
      }
    "
  >
    <StyledCard mt-6 p-2>
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
          :edit-mode
          :row
          :title
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
