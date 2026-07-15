/* oxlint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { ResourceMutations } from "@/models/resource/ResourceMutations";

import { ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Mutations live on each type's createResourceProcedures router, so the dispatch is an explicit per-type map
export const useResourceMutations = () => {
  const { $trpc } = useNuxtApp();
  return (type: ResourceType): ResourceMutations => {
    switch (type) {
      case ResourceType.Dashboard:
        return {
          deleteResource: (input) => $trpc.dashboard.deleteResource.mutate(input),
          publishResource: (input) => $trpc.dashboard.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.dashboard.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.dashboard.readResourcePublication.query(input),
          // Content is untyped at this cross-type dispatch; the calling store owns the concrete schema
          saveResourceContent: (input) => $trpc.dashboard.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.dashboard.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.dashboard.updateResource.mutate(input),
        };
      case ResourceType.Email:
        return {
          deleteResource: (input) => $trpc.email.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.email.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.email.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.email.updateResource.mutate(input),
        };
      case ResourceType.Flowchart:
        return {
          deleteResource: (input) => $trpc.flowchart.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.flowchart.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.flowchart.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.flowchart.updateResource.mutate(input),
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
          deleteResource: (input) => $trpc.survey.deleteResource.mutate(input),
          publishResource: (input) => $trpc.survey.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.survey.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.survey.readResourcePublication.query(input),
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
          deleteResource: (input) => $trpc.webpage.deleteResource.mutate(input),
          publishResource: (input) => $trpc.webpage.publishResource.mutate(input),
          readResourceContent: (input) => $trpc.webpage.readResourceContent.query(input),
          readResourcePublication: (input) => $trpc.webpage.readResourcePublication.query(input),
          saveResourceContent: (input) => $trpc.webpage.saveResourceContent.mutate(input as never),
          unpublishResource: (input) => $trpc.webpage.unpublishResource.mutate(input),
          updateResource: (input) => $trpc.webpage.updateResource.mutate(input),
        };
      default:
        throw new InvalidOperationError(Operation.Read, type satisfies never, "resource type is not supported");
    }
  };
};
