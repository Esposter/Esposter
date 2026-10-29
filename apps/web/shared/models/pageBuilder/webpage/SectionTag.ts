import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { z } from "zod";

// The semantic element a section renders as
export type SectionTag =
  | ElementTag.Division
  | ElementTag.Footer
  | ElementTag.Header
  | ElementTag.Main
  | ElementTag.Section;

export const SectionTags = [
  ElementTag.Section,
  ElementTag.Header,
  ElementTag.Main,
  ElementTag.Footer,
  ElementTag.Division,
] as const satisfies SectionTag[];

export const sectionTagSchema = z.enum(SectionTags) satisfies z.ZodType<SectionTag>;
