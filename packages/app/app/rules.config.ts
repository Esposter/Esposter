import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";
import type { TextFieldValue } from "@/models/vuetify/TextFieldValue";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { profanity } from "@2toad/profanity";

export default {
  aliases: {
    isNotProfanity: () => (value: TextFieldValue) =>
      !value || !profanity.exists(value) || `This field cannot contain profanity`,
    requireAtLeastN: (n: number) => (value: TextFieldValue) => !value || Number(value) >= n || `Must be at least ${n}`,
    requireAtMostMaxFileSize: () => (value: FileFieldValue) =>
      !value ||
      value.size <= MAX_FILE_REQUEST_SIZE ||
      `This field's file size should be at most ${MAX_FILE_REQUEST_SIZE / MEGABYTE} MB`,
  },
};
