import {
  FILE_NAME_CHARACTER_REPLACEMENT,
  GENERATED_JSON_EXTENSION,
  UNSAFE_FILE_NAME_CHARACTERS_REGEX,
} from "#src/services/voiceMatch/constants";

// The file one generated record is kept in, named for the entity with what no file system takes replaced. The
// Name never has to round-trip: a reader takes the whole folder and finds the entity's name inside the record
export const getGeneratedFileName = (name: string): string =>
  `${name.replaceAll(UNSAFE_FILE_NAME_CHARACTERS_REGEX, FILE_NAME_CHARACTER_REPLACEMENT)}${GENERATED_JSON_EXTENSION}`;
