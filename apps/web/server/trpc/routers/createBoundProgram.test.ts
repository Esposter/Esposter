import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Resource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { AUDIENCE_KEY_COLUMN, createAudienceSheet } from "@@/server/trpc/routers/createAudienceSheet.test";
import { describe } from "vitest";

interface CreateBoundProgramOptions {
  keyValues: string[];
  name: string;
  programCaller: DecorateRouterRecord<TRPCRouter["program"]>;
  sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  surveyId: Resource["id"];
}

// A program bound to an audience sheet and a survey — the minimum setup for issuing participant tokens
export const createBoundProgram = async ({
  keyValues,
  name,
  programCaller,
  sheetCaller,
  surveyId,
}: CreateBoundProgramOptions): Promise<Resource> => {
  const sheet = await createAudienceSheet(sheetCaller, name, keyValues);
  const newResource = await programCaller.createResource({ name });
  const programResource: ProgramResource = {
    audience: { id: sheet.id, type: DatasetProviderType.Sheet },
    emailId: "",
    keyColumn: AUDIENCE_KEY_COLUMN,
    surveyId,
  };
  await programCaller.saveResourceContent({
    content: programResource,
    contentVersion: newResource.contentVersion,
    id: newResource.id,
  });
  return newResource;
};

describe.todo("createBoundProgram");
