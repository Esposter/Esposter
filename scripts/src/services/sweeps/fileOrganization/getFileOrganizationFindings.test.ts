import { FileOrganizationFindingType } from "#src/models/sweeps/fileOrganization/FileOrganizationFindingType";
import { getFileOrganizationFindings } from "#src/services/sweeps/fileOrganization/getFileOrganizationFindings";
import { describe, expect, test } from "vitest";

describe(getFileOrganizationFindings, () => {
  const SERVICE_PATH = "apps/web/app/services/a/a.ts";

  test("reports a second concern beside the first", () => {
    expect.hasAssertions();

    expect(getFileOrganizationFindings(SERVICE_PATH, "export const a = 0;\nexport const b = 0;\n")).toStrictEqual([
      { names: ["a", "b"], path: SERVICE_PATH, type: FileOrganizationFindingType.ExportsPerFile },
    ]);
  });

  test.each([
    ["a schema beside its type", "export interface Thing {}\nexport const thingSchema = 0;\n"],
    ["a values array beside its enum", "export enum VoiceLanguage {}\nexport const VoiceLanguages = [];\n"],
    ["a property-names twin", "export interface LogEntity {}\nexport const LogEntityPropertyNames = 0;\n"],
    ["a screaming constant carrying the name", "export interface Value {}\nexport const VALUE_MAX_LENGTH = 0;\n"],
    ["the entries of a map", "export const SceneComponentMap = {};\nexport const SceneComponentEntries = [];\n"],
    ["a composable's emit type", "export interface SaveEditEmit {}\nexport const useSaveEdit = () => 0;\n"],
    ["an abstract class's schema", "export abstract class AEditor {}\nexport const editorSchema = 0;\n"],
    ["a type and value twin", "export const Name = {};\nexport type Name = 0;\n"],
    ["a function's overloads", "export function a(): void;\nexport function a(b: 0): void;\n"],
    [
      "a schema factory beside its input type, in a model file",
      "export interface EventInput {}\nexport const createEventSchema = 0;\n",
      "packages/db-schema/src/models/EventInput.ts",
    ],
    [
      "a table beside its select schema and row type",
      "export const userStatusesInMessage = 0;\nexport type UserStatusInMessage = 0;\nexport const selectUserStatusInMessageSchema = 0;\n",
    ],
  ])("leaves %s alone", (_, source, path = SERVICE_PATH) => {
    expect.hasAssertions();

    expect(
      getFileOrganizationFindings(path, source).filter(
        ({ type }) => type === FileOrganizationFindingType.ExportsPerFile,
      ),
    ).toStrictEqual([]);
  });

  test("leaves a constants file and a table file's enums alone", () => {
    expect.hasAssertions();

    expect(
      getFileOrganizationFindings("apps/web/app/services/a/constants.ts", "export const A = 0;\nexport const B = 0;\n"),
    ).toStrictEqual([]);
    expect(
      getFileOrganizationFindings(
        "packages/db-schema/src/schema/rooms.ts",
        "export const roomTypeEnum = 0;\nexport const rooms = 0;\nexport const selectRoomSchema = 0;\n",
      ),
    ).toStrictEqual([]);
  });

  test("reports an exported type outside a models layer with no value twin", () => {
    expect.hasAssertions();

    const source = "export interface Thing {}\n";
    expect(getFileOrganizationFindings(SERVICE_PATH, source)).toStrictEqual([
      { names: ["Thing"], path: SERVICE_PATH, type: FileOrganizationFindingType.TypeOutsideModels },
    ]);
    expect(getFileOrganizationFindings("apps/web/app/models/a/Thing.ts", source)).toStrictEqual([]);
    expect(getFileOrganizationFindings("packages/shared/src/util/types/Thing.ts", source)).toStrictEqual([]);
    expect(getFileOrganizationFindings("apps/web/app/components/Thing.ts", source)).toStrictEqual([]);
    expect(getFileOrganizationFindings("apps/web/app/components/Other.ts", source)).toHaveLength(1);
  });

  test("reports a local type unless it is the colocated map", () => {
    expect.hasAssertions();

    expect(getFileOrganizationFindings(SERVICE_PATH, "interface Thing {}\nexport const a = 0;\n")).toStrictEqual([
      { names: ["Thing"], path: SERVICE_PATH, type: FileOrganizationFindingType.LocalType },
    ]);
    expect(
      getFileOrganizationFindings(
        SERVICE_PATH,
        "interface ThingHookMap {}\ninterface ThingEvents {}\nexport const a = 0;\n",
      ),
    ).toStrictEqual([]);
    expect(
      getFileOrganizationFindings(
        "apps/web/app/composables/useA.ts",
        "interface UseAOptions {}\nexport const useA = 0;\n",
      ),
    ).toStrictEqual([]);
  });

  test("reports a screaming constant at module scope in an SFC or composable", () => {
    expect.hasAssertions();

    const source = "const MAX: number = 0;\n";
    const vuePath = "apps/web/app/components/A.vue";
    expect(getFileOrganizationFindings(vuePath, source)).toStrictEqual([
      { names: ["MAX"], path: vuePath, type: FileOrganizationFindingType.ModuleConstant },
    ]);
    expect(getFileOrganizationFindings(SERVICE_PATH, source)).toStrictEqual([]);
  });
});
