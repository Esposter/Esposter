import type { FileCaller } from "#server/models/resource/FileCaller";
import type { PublishCaller } from "#server/models/resource/PublishCaller";
import type { Context } from "#server/trpc/context";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";

import { createCallerFactory } from "#server/trpc/index";
import { dashboardRouter } from "#server/trpc/routers/dashboard";
import { emailRouter } from "#server/trpc/routers/email";
import { noteRouter } from "#server/trpc/routers/note";
import { surveyRouter } from "#server/trpc/routers/survey";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { whiteboardRouter } from "#server/trpc/routers/whiteboard";
import { ResourceType } from "@esposter/db-schema";

// The one record of every router the dispatch reaches, keyed by resource type; each router is named once, here
const resourceCallers = {
  [ResourceType.Dashboard]: (ctx: Context) => createCallerFactory(dashboardRouter)(ctx),
  [ResourceType.Email]: (ctx: Context) => createCallerFactory(emailRouter)(ctx),
  [ResourceType.Note]: (ctx: Context) => createCallerFactory(noteRouter)(ctx),
  [ResourceType.Survey]: (ctx: Context) => createCallerFactory(surveyRouter)(ctx),
  [ResourceType.Webpage]: (ctx: Context) => createCallerFactory(webpageRouter)(ctx),
  [ResourceType.Whiteboard]: (ctx: Context) => createCallerFactory(whiteboardRouter)(ctx),
};

export const publishCallers: Record<PublishableResourceType, (ctx: Context) => PublishCaller> = resourceCallers;

export const fileCallers: Record<FileAssetsResourceType, (ctx: Context) => FileCaller> = {
  [ResourceType.Email]: resourceCallers[ResourceType.Email],
  [ResourceType.Note]: resourceCallers[ResourceType.Note],
  [ResourceType.Survey]: resourceCallers[ResourceType.Survey],
  [ResourceType.Webpage]: resourceCallers[ResourceType.Webpage],
  [ResourceType.Whiteboard]: resourceCallers[ResourceType.Whiteboard],
};
