<!-- eslint-disable perfectionist/sort-objects -->
<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import { authClient } from "@/services/auth/authClient";
import { requireAuthData } from "@/services/auth/requireAuthData";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { PROFILE_MUTATION_KEY } from "@/services/user/constants";
import { DatabaseEntityType } from "@esposter/db-schema";
import deepEqual from "fast-deep-equal";

const { data: session } = await authClient.useSession(useFetch);
const { updateUser } = authClient;
const { executeMutation } = useMutation();
const profileCardRows = computed(() => {
  if (!session.value)
    throw createError({ statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.User), status: 404 });

  return {
    name: { type: RowValueType.Text, value: session.value.user.name },
    biography: { type: RowValueType.Textarea, value: session.value.user.biography },
    image: { type: RowValueType.Image, value: session.value.user.image },
  } as const;
});
// `Object.fromEntries` types its result as a plain record, so the key-to-value correspondence the rows
// Already carry is restated here rather than lost
const profileCardRowValues = computed(
  () =>
    Object.fromEntries(Object.entries(profileCardRows.value).map(([property, row]) => [property, row.value])) as {
      [P in keyof typeof profileCardRows.value]: (typeof profileCardRows.value)[P]["value"];
    },
);
const editedProfileCardRows = ref(structuredClone(profileCardRowValues.value));
const editMode = ref(false);
const isEditFormValid = ref(true);
const disabled = computed(
  () => !isEditFormValid.value || deepEqual(profileCardRowValues.value, editedProfileCardRows.value),
);
</script>

<template>
  <UiForm
    v-model:is-valid="isEditFormValid"
    @submit="
      async () => {
        await executeMutation(() => requireAuthData(updateUser(editedProfileCardRows)), {
          key: PROFILE_MUTATION_KEY,
          // A rejected save leaves the form open on the edits it could not persist — closing it would drop them
          onSuccess: () => {
            editMode = false;
          },
        });
      }
    "
  >
    <UiFrame title="Personal Information">
      <div flex flex-col gap-4>
        <UserProfileCardRow
          v-for="(row, title) of profileCardRows"
          :key="title"
          v-model="editedProfileCardRows[title]"
          :edit-mode
          :row
          :title
        />
      </div>
      <div flex flex-wrap gap-2 justify-end>
        <template v-if="editMode">
          <UiButton @click="editMode = false">Cancel</UiButton>
          <UiButton type="submit" :disabled :variant="UiButtonVariant.Accent">Save</UiButton>
        </template>
        <UiButton v-else :variant="UiButtonVariant.Accent" @click="editMode = true">Edit Settings</UiButton>
      </div>
    </UiFrame>
  </UiForm>
</template>
