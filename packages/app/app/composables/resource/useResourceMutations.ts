import type { ResourceMutations } from "@/models/resource/ResourceMutations";

import { ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Mutations live on each type's createResourceProcedures router, so the dispatch is an explicit per-type map
export const useResourceMutations = () => {
  const { $trpc } = useNuxtApp();
  return (type: ResourceType): ResourceMutations => {
    switch (type) {
      case ResourceType.Blueprint:
        return {
          deleteResource: (input) => $trpc.blueprint.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.blueprint.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.blueprint.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.blueprint.updateResource.mutate(input),
        };
      case ResourceType.Dashboard:
        return {
          deleteResource: (input) => $trpc.dashboard.deleteResource.mutate(input),
          publishResource: (input) => $trpc.dashboard.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.dashboard.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.dashboard.readResourcePublication.query(input),
          readResourceViewCount: (input) => $trpc.dashboard.readResourceViewCount.query(input),
          // Content is untyped at this cross-type dispatch; the calling store owns the concrete schema
          saveResourceContent: (input) => $trpc.dashboard.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.dashboard.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.dashboard.updateResource.mutate(input),
        };
      case ResourceType.Email:
        return {
          deleteFile: (input) => $trpc.email.deleteFile.mutate(input),
          deleteResource: (input) => $trpc.email.deleteResource.mutate(input),
          generateDownloadFileSasUrls: (input) => $trpc.email.generateDownloadFileSasUrls.query(input),
          generateUploadFileSasEntities: (input) => $trpc.email.generateUploadFileSasEntities.query(input),
          publishResource: (input) => $trpc.email.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.email.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.email.readResourcePublication.query(input),
          saveResourceContent: (input) => $trpc.email.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.email.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.email.updateResource.mutate(input),
        };
      case ResourceType.Flowchart:
        return {
          deleteResource: (input) => $trpc.flowchart.deleteResource.mutate(input),
          publishResource: (input) => $trpc.flowchart.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.flowchart.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.flowchart.readResourcePublication.query(input),
          saveResourceContent: (input) => $trpc.flowchart.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.flowchart.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.flowchart.updateResource.mutate(input),
        };
      case ResourceType.Program:
        return {
          deleteResource: (input) => $trpc.program.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.program.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.program.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.program.updateResource.mutate(input),
        };
      case ResourceType.Sheet:
        return {
          deleteResource: (input) => $trpc.sheet.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.sheet.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.sheet.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.sheet.updateResource.mutate(input),
        };
      case ResourceType.Survey:
        return {
          deleteFile: (input) => $trpc.survey.deleteFile.mutate(input),
          deleteResource: (input) => $trpc.survey.deleteResource.mutate(input),
          generateDownloadFileSasUrls: (input) => $trpc.survey.generateDownloadFileSasUrls.query(input),
          generateUploadFileSasEntities: (input) => $trpc.survey.generateUploadFileSasEntities.query(input),
          publishResource: (input) => $trpc.survey.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.survey.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.survey.readResourcePublication.query(input),
          readResourceViewCount: (input) => $trpc.survey.readResourceViewCount.query(input),
          saveResourceContent: (input) => $trpc.survey.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.survey.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.survey.updateResource.mutate(input),
        };
      case ResourceType.TodoList:
        return {
          deleteResource: (input) => $trpc.todoList.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.todoList.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.todoList.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.todoList.updateResource.mutate(input),
        };
      case ResourceType.Webpage:
        return {
          deleteFile: (input) => $trpc.webpage.deleteFile.mutate(input),
          deleteResource: (input) => $trpc.webpage.deleteResource.mutate(input),
          generateDownloadFileSasUrls: (input) => $trpc.webpage.generateDownloadFileSasUrls.query(input),
          generateUploadFileSasEntities: (input) => $trpc.webpage.generateUploadFileSasEntities.query(input),
          publishResource: (input) => $trpc.webpage.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.webpage.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.webpage.readResourcePublication.query(input),
          readResourceViewCount: (input) => $trpc.webpage.readResourceViewCount.query(input),
          saveResourceContent: (input) => $trpc.webpage.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.webpage.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.webpage.updateResource.mutate(input),
        };
      default:
        throw new InvalidOperationError(Operation.Read, type satisfies never, "resource type is not supported");
    }
  };
};
