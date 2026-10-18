<script setup lang="ts">
import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import CharacterTerms from "#src/components/Character/Terms/Index.vue";
import { readCharacterIdNamesMap } from "#src/services/character/readCharacterIdNamesMap";
import { readCharacterPackFolders } from "#src/services/character/readCharacterPackFolders";
import { readCharacterPackZips } from "#src/services/character/readCharacterPackZips";
import { readPickedCharacterPacks } from "#src/services/character/readPickedCharacterPacks";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  // The character the screen shows, whom a picked release is kept for unless its names say whose it is
  characterId: number;
  // Where the character's pack is read from, the browser's kept copy or the host's, none where it is drawn as its body's
  // Capsule
  characterPackReader?: CharacterPackReader;
  // Removes the character's kept pack, called once the player confirms it
  confirmRemoval: () => void;
  // Where the host serves the game's published data, which the characters' names are read from
  gameDataBaseUrl: string;
  // Whether the browser keeps a pack the player loaded for the character
  isCharacterPackKept: boolean;
  // Keeps a release whose terms the player accepted, rejecting where the browser did not keep it
  keepCharacterPack: (characterPack: CharacterPack) => Promise<void>;
}

const { characterId, characterPackReader, confirmRemoval, gameDataBaseUrl, isCharacterPackKept, keepCharacterPack } =
  defineProps<Props>();
const zipInput = useTemplateRef("zipInput");
const folderInput = useTemplateRef("folderInput");
const isChoosing = ref(false);
const isConfirmingRemoval = ref(false);
const isPending = ref(false);
// The reasons the releases picked were skipped, each naming its release
const errorMessages = ref<string[]>([]);
// The releases read and waiting on their terms, which nothing keeps until the player accepts them
const characterPacks = shallowRef<CharacterPack[]>();
// The releases the player picked, read in the page into the packs they would keep: each zip's archive, or the files of a
// Folder, which is one release or a folder of them. Nothing of them leaves the browser; only the characters' names are
// Fetched, from the game's published data
const pickCharacterPacks = (input: HTMLInputElement | null) => {
  const files = [...(input?.files ?? [])];
  if (!input || files.length === 0) return;
  isChoosing.value = false;
  isPending.value = true;
  errorMessages.value = [];
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
  getResultAsync(async () => {
    const { failures: unreadFailures, pickedCharacterPacks } = input.webkitdirectory
      ? { failures: [], pickedCharacterPacks: readCharacterPackFolders(files) }
      : await readCharacterPackZips(files);
    const characterIdNamesMap = await readCharacterIdNamesMap(gameDataBaseUrl);
    const { characterPacks: newCharacterPacks, failures } = await readPickedCharacterPacks(
      pickedCharacterPacks,
      characterIdNamesMap,
      characterId,
    );
    return { characterPacks: newCharacterPacks, failures: [...unreadFailures, ...failures] };
  }).match(
    ({ characterPacks: newCharacterPacks, failures }) => {
      isPending.value = false;
      errorMessages.value = failures;
      if (newCharacterPacks.length > 0) characterPacks.value = newCharacterPacks;
    },
    (error) => {
      console.error(error);
      isPending.value = false;
      errorMessages.value = [error.message];
    },
  );
  // A second pick of the same file is still a change
  input.value = "";
};
// Kept one at a time, since each keep rewrites the browser's index of the packs it keeps
const acceptCharacterPacks = async () => {
  const acceptedCharacterPacks = characterPacks.value ?? [];
  characterPacks.value = undefined;
  errorMessages.value = [];
  for (const acceptedCharacterPack of acceptedCharacterPacks)
    // oxlint-disable-next-line no-await-in-loop -- each keep rewrites the index the next one reads, so the keeps run in turn
    await getResultAsync(() => keepCharacterPack(acceptedCharacterPack)).match(noop, (error) => {
      console.error(error);
      errorMessages.value = [...errorMessages.value, error.message];
    });
};

// The folder's input picks a whole folder, a property every browser has but the HTML standard does not name
onMounted(() => {
  if (folderInput.value) folderInput.value.webkitdirectory = true;
});
</script>

<template>
  <!-- Our own interface over the character screen, not the game's: the official model loaded from the release the player
       Downloaded, its terms shown verbatim and accepted before it is kept, and a kept model removed once confirmed -->
  <div v-if="characterPacks" class="terms" role="dialog" aria-modal="true" aria-labelledby="character-pack-terms-title">
    <p id="character-pack-terms-title">The terms of the models picked, as their releases ship them</p>
    <div class="releases">
      <template v-for="characterPack in characterPacks" :key="characterPack.packHash">
        <p>The terms of {{ characterPack.modelName }}, as its release ships them</p>
        <p v-if="characterPack.characterId !== characterId">
          Its names are another character's, so it is kept for them.
        </p>
        <pre>{{ characterPack.terms }}</pre>
      </template>
    </div>
    <div class="actions">
      <button type="button" @click="acceptCharacterPacks()">Accept the terms and keep the models</button>
      <button type="button" @click="characterPacks = undefined">Cancel</button>
    </div>
  </div>
  <div class="loader">
    <p v-if="isPending">Reading the releases…</p>
    <p v-for="errorMessage in errorMessages" :key="errorMessage" role="alert">{{ errorMessage }}</p>
    <template v-if="isChoosing">
      <button type="button" @click="zipInput?.click()">The downloaded .zips</button>
      <button type="button" @click="folderInput?.click()">Their extracted folder</button>
      <button type="button" @click="isChoosing = false">Cancel</button>
    </template>
    <template v-else-if="isConfirmingRemoval">
      <p>Remove this character's model? It is drawn as its capsule until its release is loaded again.</p>
      <button
        type="button"
        @click="
          confirmRemoval();
          isConfirmingRemoval = false;
        "
      >
        Remove
      </button>
      <button type="button" @click="isConfirmingRemoval = false">Cancel</button>
    </template>
    <template v-else>
      <button v-if="isCharacterPackKept" type="button" @click="isConfirmingRemoval = true">
        Remove this character's model
      </button>
      <button v-else-if="!characterPackReader && !isPending" type="button" @click="isChoosing = true">
        Load this character's official model
      </button>
    </template>
    <input
      ref="zipInput"
      accept=".zip,application/zip"
      aria-label="The releases' .zip files"
      hidden
      multiple
      type="file"
      @change="pickCharacterPacks(zipInput)"
    />
    <input
      ref="folderInput"
      aria-label="The releases' extracted folder"
      hidden
      type="file"
      @change="pickCharacterPacks(folderInput)"
    />
  </div>
  <!-- The terms bundled with the model the character is drawn from, the credit the release carries, read as it ships
       Shown beside the loader whichever copy the model is read from, so the player needs no button to reach them -->
  <div v-if="characterPackReader" class="model-terms">
    <CharacterTerms :key="characterPackReader.key" :character-pack-reader />
  </div>
</template>

<style scoped>
/* Our own interface, so no reference measures it: the character screen's own colours and units, beside its foot */
.loader {
  position: absolute;
  right: calc(var(--unit) * 120);
  bottom: calc(var(--unit) * 48);
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 16);
  color: #ece5d8;
  font-size: calc(var(--unit) * 22);
}

.loader p {
  max-width: calc(var(--unit) * 720);
  margin: 0;
}

button {
  padding: 0 calc(var(--unit) * 26);
  border: none;
  border-radius: calc(var(--unit) * 25);
  background: #ece5d8;
  color: #3b4255;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 49);
}

.terms {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  width: calc(var(--unit) * 960);
  max-height: calc(var(--unit) * 800);
  flex-direction: column;
  gap: calc(var(--unit) * 20);
  padding: calc(var(--unit) * 32);
  border-radius: calc(var(--unit) * 16);
  background: #ece5d8;
  color: #3b4255;
  font-size: calc(var(--unit) * 22);
  transform: translate(-50%, -50%);
  user-select: text;
}

.terms p {
  margin: 0;
  font-weight: 600;
}

.releases {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 20);
  overflow: auto;
}

.terms pre {
  overflow: auto;
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
}

.terms button {
  background: #3b4255;
  color: #ece5d8;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--unit) * 16);
}

/* The model's terms above the loader, scrolled within their own height, the Terms view taking the panel's styles */
.model-terms {
  position: absolute;
  right: calc(var(--unit) * 120);
  bottom: calc(var(--unit) * 120);
  width: calc(var(--unit) * 720);
  max-height: calc(var(--unit) * 400);
  overflow: auto;
  padding: calc(var(--unit) * 20);
  border-radius: calc(var(--unit) * 16);
  background: rgb(236 229 216 / 0.9);
  color: #3b4255;
  font-size: calc(var(--unit) * 18);
  user-select: text;
}

.model-terms pre {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
}
</style>
