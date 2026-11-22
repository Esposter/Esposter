import type { WikiImageInfoResponse } from "#src/models/WikiImageInfoResponse";

import { checkIsObject } from "#src/services/checkIsObject";
import { checkIsOptional } from "#src/services/checkIsOptional";

const checkIsString = (value: unknown): boolean => typeof value === "string";

// A title the wiki answered under, and the title it was asked as, each present or absent and a string
const checkIsNormalization = (value: unknown): boolean =>
  checkIsObject(value) && checkIsOptional(value.from, checkIsString) && checkIsOptional(value.to, checkIsString);

// An image's url, present or absent and a string
const checkIsImageInfo = (value: unknown): boolean => checkIsObject(value) && checkIsOptional(value.url, checkIsString);

// A page's title, and its image infos when it has any
const checkIsPage = (value: unknown): boolean =>
  checkIsObject(value) &&
  checkIsOptional(value.title, checkIsString) &&
  checkIsOptional(
    value.imageinfo,
    (imageinfo) => Array.isArray(imageinfo) && imageinfo.every((info) => checkIsImageInfo(info)),
  );

// The query the reader takes its normalised titles and its pages from, each present or absent and of its shape
export const checkIsWikiImageInfoResponse = (value: unknown): value is WikiImageInfoResponse =>
  checkIsObject(value) &&
  checkIsOptional(
    value.query,
    (query) =>
      checkIsObject(query) &&
      checkIsOptional(
        query.normalized,
        (normalized) => Array.isArray(normalized) && normalized.every((pair) => checkIsNormalization(pair)),
      ) &&
      checkIsOptional(
        query.pages,
        (pages) => checkIsObject(pages) && Object.values(pages).every((page) => checkIsPage(page)),
      ),
  );
