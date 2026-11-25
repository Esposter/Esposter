<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { RowValueType } from "#src/models/user/ProfileCard/RowValueType";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { createEntityNotFoundError } from "#src/services/shared/error/createEntityNotFoundError";
import { PROFILE_MUTATION_KEY } from "#src/services/user/constants";
import { DatabaseEntityType } from "@esposter/db-schema";
import { checkIsDeepEqual } from "@esposter/shared";

interface Props {
  section?: undefined | UserSettingsPageSection;
}

defineProps<Props>();
const { data: session } = await useAuthSession();
const { updateUser } = authClient;
const { checkIsPending, executeMutation } = useMutation();
// The profile a save sent, shown in place of the session's until the session reads it back
const savedProfile = shallowRef<Pick<NonNullable<typeof session.value>["user"], "biography" | "image" | "name">>();
watch(
  () => session.value?.user,
  () => {
    savedProfile.value = undefined;
  },
);
const profileCardValues = computed(() => {
  if (!session.value) throw createEntityNotFoundError(DatabaseEntityType.User);

  const { biography, image, name } = savedProfile.value ?? session.value.user;
  // Better Auth declares the image nullable, but its column is `notNull().default("")`, so absence is `""` here too
  return { biography, image: image ?? "", name };
});
const profileCardRows = computed(() => {
  const { biography, image, name } = profileCardValues.value;
  /* oxlint-disable sorting/sort-objects -- the rows render in declaration order, and Name is the first row */
  return {
    name: { type: RowValueType.Text, value: name },
    biography: { type: RowValueType.Textarea, value: biography },
    image: { type: RowValueType.Image, value: image },
  } as const;
  /* oxlint-enable sorting/sort-objects */
});
const editedProfileCardRows = ref(structuredClone(profileCardValues.value));
const isEditMode = ref(false);
const isEditFormValid = ref(true);
const disabled = computed(
  () => !isEditFormValid.value || checkIsDeepEqual(profileCardValues.value, editedProfileCardRows.value),
);
// The form stays open on its edits until the server keeps the save, and the card shows what it kept. A refused save
// Leaves the form open on the edits it could not persist
const saveProfile = async () => {
  const editedProfile = structuredClone(toRaw(editedProfileCardRows.value));
  await executeMutation(() => requireAuthData(updateUser(editedProfile)), {
    awaitedBecause: AwaitedReason.ServerDecidedOutcome,
    key: PROFILE_MUTATION_KEY,
    onSuccess: () => {
      savedProfile.value = editedProfile;
      isEditMode.value = false;
    },
  });
};
const isSavePending = computed(() => checkIsPending(PROFILE_MUTATION_KEY));
</script>

<template>
  <UiForm v-model:is-valid="isEditFormValid" @submit="saveProfile()">
    <!-- The form holds the section, so its Save stays a submit while sitting beside the heading it acts on -->
    <UserSettingsSection :section>
      <template #actions>
        <template v-if="isEditMode">
          <UiButton :variant="UiButtonVariant.Quiet" @click="isEditMode = false">Cancel</UiButton>
          <UiButton
            type="submit"
            :disabled
            :is-pending="isSavePending ? true : undefined"
            :variant="UiButtonVariant.Accent"
          >
            Save
          </UiButton>
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
