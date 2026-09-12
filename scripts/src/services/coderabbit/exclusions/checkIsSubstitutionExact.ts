import type { RenameSubstitution } from "#src/models/coderabbit/RenameSubstitution";

// Replaying the sweep's substitutions on the parent blob must reproduce the committed blob byte for byte: then
// There is by construction no other content change, so a balanced logic edit cannot be admitted. It errs only
// Toward keeping files reviewable — a reformatter rewrap or an under-specified rename fails the compare.
export const checkIsSubstitutionExact = (
  parentBlob: string,
  committedBlob: string,
  substitutions: RenameSubstitution[],
): boolean =>
  substitutions.reduce(
    (blob, { newName, oldName }) =>
      blob.replaceAll(new RegExp(String.raw`\b${RegExp.escape(oldName)}\b`, "gu"), newName),
    parentBlob,
  ) === committedBlob;
