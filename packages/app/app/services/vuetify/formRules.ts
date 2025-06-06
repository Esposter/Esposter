/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { ValidationRule } from "vuetify";

import { MAX_REQUEST_SIZE, MEGABYTE } from "#shared/services/esposter/constants";
import { profanityMatcher } from "#shared/services/obscenity/profanityMatcher";
import deepEqual from "fast-deep-equal";

type FileFieldValue = File | undefined;
type TextFieldValue = null | string;

export const formRules: {
  isNotEqual: (oldValue: TextFieldValue) => ValidationRule;
  isNotProfanity: ValidationRule;
  requireAtMostMaxFileSize: ValidationRule;
  requireAtMostNCharacters: (n: number) => ValidationRule;
  required: ValidationRule;
} = {
  isNotEqual: (oldValue) => (value: TextFieldValue) =>
    !deepEqual(value, oldValue) || `new value cannot be the same as the existing value`,
  isNotProfanity: (value: TextFieldValue) => !value || !profanityMatcher.hasMatch(value) || `cannot contain profanity`,
  requireAtMostMaxFileSize: (value: FileFieldValue) =>
    // @TODO: Right now trpc uses application/octet-stream for uploading files which uses the same namespace as normal requests
    // compared to using multipart/form-data, so we'll apply the same frontend validation for now for simplicity
    !value || value.size < MAX_REQUEST_SIZE || `file size should be less than ${MAX_REQUEST_SIZE / MEGABYTE} MB`,
  requireAtMostNCharacters: (n) => (value: TextFieldValue) => (value && value.length <= n) || `max ${n} characters`,
  required: (value: TextFieldValue) => (value && value.length > 0) || "required",
};
