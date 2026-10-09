<script setup lang="ts">
import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import CharacterTerms from "#src/components/Character/Terms/Index.vue";
import { readCharacterIdNamesMap } from "#src/services/character/readCharacterIdNamesMap";
import { readCharacterPackFolder } from "#src/services/character/readCharacterPackFolder";
import { readCharacterPackZip } from "#src/services/character/readCharacterPackZip";
import { readPickedCharacterPack } from "#src/services/character/readPickedCharacterPack";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

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
// The key of the reader whose terms are open, so they close once the character's pack changes or goes
const termsCharacterPackReaderKey = ref("");
const isPending = ref(false);
const errorMessage = ref("");
// The release read and waiting on its terms, which nothing keeps until the player accepts them
const characterPack = shallowRef<CharacterPack>();
// A release the player picked, read in the page into the pack it would keep: a zip's archive, or every file of a folder.
// Nothing of it leaves the browser; only the characters' names are fetched, from the game's published data
const pickCharacterPack = (input: HTMLInputElement | null) => {
  const files = [...(input?.files ?? [])];
  if (!input || files.length === 0) return;
  isChoosing.value = false;
  isPending.value = true;
  errorMessage.value = "";
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
  getResultAsync(async () => {
    const pickedCharacterPack = input.webkitdirectory
      ? readCharacterPackFolder(files)
      : readCharacterPackZip(takeOne(files).name, new Uint8Array(await takeOne(files).arrayBuffer()));
    const characterIdNamesMap = await readCharacterIdNamesMap(gameDataBaseUrl);
    return readPickedCharacterPack(pickedCharacterPack, characterIdNamesMap, characterId);
  }).match(
    (newCharacterPack) => {
      isPending.value = false;
      characterPack.value = newCharacterPack;
    },
    (error) => {
      console.error(error);
      isPending.value = false;
      errorMessage.value = error.message;
    },
  );
  // A second pick of the same file is still a change
  input.value = "";
};

// The folder's input picks a whole folder, a property every browser has but the HTML standard does not name
onMounted(() => {
  if (folderInput.value) folderInput.value.webkitdirectory = true;
});
</script>

<template>
  <!-- Our own interface over the character screen, not the game's: the official model loaded from the release the player
       Downloaded, its terms shown verbatim and accepted before it is kept, and a kept model removed once confirmed -->
  <div v-if="characterPack" class="terms" role="dialog" aria-modal="true" aria-labelledby="character-pack-terms-title">
    <p id="character-pack-terms-title">The terms of {{ characterPack.modelName }}, as its release ships them</p>
    <p v-if="characterPack.characterId !== characterId">Its names are another character's, so it is kept for them.</p>
    <pre>{{ characterPack.terms }}</pre>
    <div class="actions">
      <button
        type="button"
        @click="
          async () => {
            if (!characterPack) return;

            const acceptedCharacterPack = characterPack;
            characterPack = undefined;
            errorMessage = '';
            await getResultAsync(() => keepCharacterPack(acceptedCharacterPack)).match(noop, (error) => {
              console.error(error);
              errorMessage = error.message;
            });
          }
        "
      >
        Accept the terms and keep the model
      </button>
      <button type="button" @click="characterPack = undefined">Cancel</button>
    </div>
  </div>
  <!-- The terms bundled with the model the character is drawn from, the credit the release carries, read as it ships
       Them whichever copy the model is read from -->
  <div
    v-else-if="characterPackReader && characterPackReader.key === termsCharacterPackReaderKey"
    class="terms"
    role="dialog"
    aria-modal="true"
    aria-labelledby="character-model-terms-title"
  >
    <p id="character-model-terms-title">The terms of this character's model, as its release ships them</p>
    <CharacterTerms :key="characterPackReader.key" :character-pack-reader />
    <div class="actions">
      <button type="button" @click="termsCharacterPackReaderKey = ''">Close</button>
    </div>
  </div>
  <div class="loader">
    <p v-if="isPending">Reading the release…</p>
    <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <template v-if="isChoosing">
      <button type="button" @click="zipInput?.click()">The downloaded .zip</button>
      <button type="button" @click="folderInput?.click()">Its extracted folder</button>
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
      <button v-if="characterPackReader" type="button" @click="termsCharacterPackReaderKey = characterPackReader.key">
        The model's terms
      </button>
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
      aria-label="The release's .zip"
      hidden
      type="file"
      @change="pickCharacterPack(zipInput)"
    />
    <input
      ref="folderInput"
      aria-label="The release's extracted folder"
      hidden
      type="file"
      @change="pickCharacterPack(folderInput)"
    />
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
</style>
