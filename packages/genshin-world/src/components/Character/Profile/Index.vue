<script setup lang="ts">
import type { CharacterMenuProfileEntry } from "genshin-interface";
import type { GameLanguage, GameText } from "genshin-text";

import { readCharacterProfile } from "#src/services/profile/readCharacterProfile";
import { toCharacterProfileEntries } from "#src/services/profile/toCharacterProfileEntries";
import { getResultAsync } from "@esposter/shared";
import { CharacterMenuProfile } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The character whose Profile tab this is
  avatarId: number;
  // The character's total Companionship EXP, from which its Friendship Level is read
  friendshipExp: number;
  // Where the host serves the game's published data, which the profile's record is read from
  gameDataBaseUrl: string;
  // The game's words in the reader's language, the unlock line among them
  gameText: GameText;
  // The reader's language, whose text the profile is read in
  language: GameLanguage;
  // The names the stat tables and namecards cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
}

const { avatarId, friendshipExp, gameDataBaseUrl, gameText, language, nameText } = defineProps<Props>();
const entries = ref<CharacterMenuProfileEntry[]>([]);
const namecardName = ref("");
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readCharacterProfile(gameDataBaseUrl, avatarId, language, friendshipExp)).match(
  ({ friendshipLevel, namecardNameTextId, profileText }) => {
    entries.value = toCharacterProfileEntries(
      [...profileText.stories, ...profileText.voices],
      friendshipLevel,
      gameText[GameTextKey.StoryUnlocksAt],
    );
    namecardName.value = nameText[String(namecardNameTextId)] || "";
  },
  (error) => {
    console.error(error);
  },
);
</script>

<template>
  <!-- The Profile tab, its stories loaded for the character, the reader's language and the Companionship EXP, each of which
       The screen keys it by so a change reads them again, the panel empty until they arrive -->
  <CharacterMenuProfile :entries :namecard-name />
</template>
