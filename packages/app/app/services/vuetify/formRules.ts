/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { ValidationRule } from "vuetify";

import { MAX_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { profanityMatcher } from "#shared/services/obscenity/profanityMatcher";

type FileFieldValue = File | undefined;
type TextFieldValue = null | string;

export const formRules: {
  isNotProfanity: ValidationRule;
  requireAtMostMaxFileSize: ValidationRule;
  requireAtMostNCharacters: (n: number) => ValidationRule;
  required: ValidationRule;
} = {
  isNotProfanity: (value: TextFieldValue) =>
    !value || !profanityMatcher.hasMatch(value) || `This field cannot contain profanity`,
  requireAtMostMaxFileSize: (value: FileFieldValue) =>
    // @TODO: Right now trpc uses application/octet-stream for uploading files which uses the same namespace as normal requests
    // compared to using multipart/form-data, so we'll apply the same frontend validation for now for simplicity
    !value ||
    value.size < MAX_REQUEST_SIZE ||
    `This field's file size should be less than ${MAX_REQUEST_SIZE / MEGABYTE} MB`,
  requireAtMostNCharacters: (n) => (value: TextFieldValue) =>
    (value !== null && value.length <= n) || `You must enter a maximum of ${n} characters`,
  required: (value: TextFieldValue) => (value && value.length > 0) || "This field is required",
};
