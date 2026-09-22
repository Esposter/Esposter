// Every named export a file declares inline, which is the only export form the file-organization skill allows
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const EXPORT_REGEX: RegExp =
  /^export (?<kind>abstract class|async function|class|const|enum|function|interface|let|type) (?<name>\w+)/gmu;
export const TYPE_KINDS: readonly string[] = ["interface", "type"];
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const LOCAL_TYPE_REGEX: RegExp = /^(?:interface|type) (?<name>\w+)/gmu;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const MODULE_CONSTANT_REGEX: RegExp = /^const (?<name>[A-Z][A-Z0-9_]+) =/gmu;
// The multi-export files the skill sanctions by name: a constants file and its test and bench twins
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CONSTANTS_FILE_REGEX: RegExp = /\/constants(?:\.test|\.bench)?\.ts$/u;
// Where one identifier word ends and the next begins: a case change, a digit run, or a separator
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WORD_BOUNDARY_REGEX: RegExp = /(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|[_$]+/u;
export const COMPOSABLE_PREFIX = "use";
// The naming skill's abstract-class marker, one letter the concrete twin does not carry
export const ABSTRACT_PREFIX = "a";
// The event and hook map interfaces the skill colocates with the service that creates the singleton
// (`references/colocated-types.md`); an emitter's event map is that construct under the emitter's own name
export const COLOCATED_MAP_SUFFIXES: readonly string[] = ["HookMap", "Events"];
// A drizzle table file's `pgEnum` wrappers sit beside the table that reads them (`.agents/ledgers/file-organization/packages.md`)
export const SCHEMA_DIRECTORY = "/schema/";
export const ENUM_SUFFIX = "Enum";
// A type-utility folder is a models layer for types with no runtime twin (`util/types/`)
export const MODEL_DIRECTORIES: readonly string[] = ["/models/", "/types/"];
export const COMPOSABLES_DIRECTORY = "/composables/";
