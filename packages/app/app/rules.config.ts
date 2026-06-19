import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";
import type { TextFieldValue } from "@/models/vuetify/TextFieldValue";
import type { RulesOptions } from "vuetify/labs/rules";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { profanity } from "@2toad/profanity";

export default {
  aliases: {
    isNotProfanity: (err) => (value: TextFieldValue) =>
      !value || !profanity.exists(value) || err || `This field cannot contain profanity`,
    requireAtLeastN: (n, err) => (value: TextFieldValue) =>
      !value || Number(value) >= n || err || `Must be at least ${n}`,
    requireAtMostMaxFileSize: (err) => (value: FileFieldValue) =>
      !value ||
      (Array.isArray(value) ? value : [value]).every((file) => file.size <= MAX_FILE_REQUEST_SIZE) ||
      err ||
      `This field's file size should be at most ${MAX_FILE_REQUEST_SIZE / MEGABYTE} MB`,
  },
} satisfies RulesOptions;
