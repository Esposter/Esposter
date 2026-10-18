import { CharacterDrawing } from "#src/models/character/CharacterDrawing";

// The drawing of a character by the state of its official model: a character with no reader is not drawn, a model
// Still loading is drawn as its capsule, a loaded model takes the capsule's place, and a model that fails to load, which
// A reader without the official model does, leaves no character
export const getCharacterDrawing = ({
  hasReader,
  isFailed,
  isLoaded,
}: {
  hasReader: boolean;
  isFailed: boolean;
  isLoaded: boolean;
}): CharacterDrawing => {
  if (!hasReader || isFailed) return CharacterDrawing.None;
  return isLoaded ? CharacterDrawing.Model : CharacterDrawing.Capsule;
};
