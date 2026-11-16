<!-- eslint-disable perfectionist/sort-objects -- the rows render in declaration order -->
<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { RowValueType } from "#src/models/user/ProfileCard/RowValueType";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { getEntityNotFoundStatusMessage } from "#src/services/shared/error/getEntityNotFoundStatusMessage";
import { PROFILE_MUTATION_KEY } from "#src/services/user/constants";
import { DatabaseEntityType } from "@esposter/db-schema";
import { checkIsDeepEqual } from "@esposter/shared";

interface Props {
  section?: UserSettingsPageSection;
}

defineProps<Props>();
const { data: session } = await useAuthSession();
const { updateUser } = authClient;
const { executeMutation } = useMutation();
// The profile a save sent, shown in place of the session's until the session reads it back
const savedProfile = shallowRef<Pick<NonNullable<typeof session.value>["user"], "biography" | "image" | "name">>();
watch(
  () => session.value?.user,
  () => {
    savedProfile.value = undefined;
  },
);
const profileCardRows = computed(() => {
  if (!session.value)
    throw createError({ statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.User), status: 404 });

  const { biography, image, name } = savedProfile.value ?? session.value.user;
  return {
    name: { type: RowValueType.Text, value: name },
    biography: { type: RowValueType.Textarea, value: biography },
    image: { type: RowValueType.Image, value: image },
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
const isEditMode = ref(false);
const isEditFormValid = ref(true);
const disabled = computed(
  () => !isEditFormValid.value || checkIsDeepEqual(profileCardRowValues.value, editedProfileCardRows.value),
);
// The form closes as the save is sent, and the card shows what it sent. A refused save puts the session's profile back
// And reopens the form on the edits it could not persist
const saveProfile = () => {
  const editedProfile = structuredClone(toRaw(editedProfileCardRows.value));
  executeMutation(() => requireAuthData(updateUser(editedProfile)), {
    applyOptimistic: () => {
      savedProfile.value = editedProfile;
      isEditMode.value = false;
      return () => {
        if (savedProfile.value === editedProfile) savedProfile.value = undefined;
        // A form the reader has opened again since holds their new draft, which the refused one does not replace
        if (isEditMode.value) return;

        isEditMode.value = true;
        editedProfileCardRows.value = structuredClone(editedProfile);
      };
    },
    key: PROFILE_MUTATION_KEY,
  });
};
</script>

<template>
  <UiForm v-model:is-valid="isEditFormValid" @submit="saveProfile()">
    <!-- The form holds the section, so its Save stays a submit while sitting beside the heading it acts on -->
    <UserSettingsSection :section>
      <template #actions>
        <template v-if="isEditMode">
          <UiButton :variant="UiButtonVariant.Quiet" @click="isEditMode = false">Cancel</UiButton>
          <UiButton type="submit" :disabled :variant="UiButtonVariant.Accent">Save</UiButton>
        </template>
        <UiButton v-else :variant="UiButtonVariant.Accent" @click="isEditMode = true">
          <UiIcon :meaning="UiIconMeaning.Edit" />
          Edit profile
        </UiButton>
      </template>
      <div flex flex-col gap-4>
        <UserProfileCardRow
          v-for="(row, title) of profileCardRows"
          :key="title"
          v-model="editedProfileCardRows[title]"
          :is-edit-mode
          :row
          :title
        />
      </div>
    </UserSettingsSection>
  </UiForm>
</template>
