import { checkIsSameWord } from "#src/services/sweeps/fileOrganization/checkIsSameWord";
import { OPERATION_PREFIXES } from "#src/services/sweeps/fileOrganization/constants";
import { getNameWords } from "#src/services/sweeps/fileOrganization/getNameWords";

// Whether one export is a second spelling of another's concern rather than a second concern: it carries every
// Word of the base (`serializableValueSchema` beside `SerializableValue`, `selectPostSchema` beside `posts`),
// Or opens on the same two words (`SceneComponentEntries` beside `SceneComponentMap`, `BanInMessageWithUsers`
// Beside `bansInMessageRelation`). A companion is what the skill's exceptions all look like once named — a
// Schema beside its type, an enum beside its values array, a property-names twin, a composable's own shapes
export const checkIsCompanion = (name: string, base: string): boolean => {
  const nameWords = getNameWords(name);
  const baseWords = getNameWords(base);
  // A name opening on an operation the base does not itself name is a second concern however many words the two
  // Share, so a shared noun alone never makes a companion — `deleteUser` beside `User`
  const [nameOpening] = nameWords;
  if (
    nameWords.length > 1 &&
    nameOpening !== undefined &&
    OPERATION_PREFIXES.has(nameOpening) &&
    !baseWords.includes(nameOpening)
  )
    return false;

  const hasEveryWord = baseWords.every((baseWord) => nameWords.some((nameWord) => checkIsSameWord(nameWord, baseWord)));
  const hasSameOpening =
    baseWords.length > 1 &&
    nameWords.length > 1 &&
    baseWords.slice(0, 2).every((baseWord, index) => checkIsSameWord(nameWords[index] ?? "", baseWord));
  return hasEveryWord || hasSameOpening;
};
