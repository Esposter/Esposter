/* oxlint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { useAlertStore } from "@/store/alert";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

interface ResourceMutations {
  deleteResource: (input: { id: string }) => Promise<Resource>;
  publishResource?: (input: { id: string }) => Promise<ResourcePublication>;
  readResourceContent: (input: { id: string }) => Promise<unknown>;
  readResourcePublication?: (input: { id: string }) => Promise<ResourcePublication | undefined>;
  saveResourceContent: (input: { content: unknown; contentVersion: number; id: string }) => Promise<Resource>;
  unpublishResource?: (input: { id: string }) => Promise<Resource>;
  updateResource: (input: { id: string; name: string }) => Promise<Resource>;
}
// Blade-scoped state for one resource (metadata + content + publication). Mutations live on each type's
// CreateResourceProcedures router, so the dispatch is an explicit per-type map.
export const useResource = (id: MaybeRefOrGetter<string>) => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const resource = ref<Resource>();
  const publication = ref<ResourcePublication>();
  const getResourceMutations = (type: ResourceType): ResourceMutations => {
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
      case ResourceType.File:
        return {
          deleteResource: (input) => $trpc.file.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.file.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.file.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.file.updateResource.mutate(input),
        };
      case ResourceType.Flowchart:
        return {
          deleteResource: (input) => $trpc.flowchart.deleteResource.mutate(input),
          readResourceContent: (input) => $trpc.flowchart.readResourceContent.query(input),
          saveResourceContent: (input) => $trpc.flowchart.saveResourceContent.mutate(input as never),
          updateResource: (input) => $trpc.flowchart.updateResource.mutate(input),
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
        throw new InvalidOperationError(Operation.Read, type, "resource type is not editable in the explorer");
    }
  };
  const load = async () => {
    // Resolved per call so a persisted store's loader always reads the current route id
    const idValue = toValue(id);
    resource.value = await $trpc.resource.readResource.query({ id: idValue });
    publication.value = await getResourceMutations(resource.value.type).readResourcePublication?.({ id: idValue });
  };
  // The blob is written on first save, so a freshly created resource returns undefined content
  const readContent = () => {
    const current = resource.value;
    if (!current) return Promise.resolve(undefined);
    return getResourceMutations(current.type).readResourceContent({ id: current.id });
  };
  // Optimistic concurrency: reads the tracked contentVersion and writes the returned row back so the
  // Next save carries the bumped version (sequential autosaves stay consistent)
  const save = (content: unknown): Promise<boolean> => {
    const current = resource.value;
    if (!current) return Promise.resolve(false);
    return getResultAsync(async () => {
      resource.value = await getResourceMutations(current.type).saveResourceContent({
        content,
        contentVersion: current.contentVersion,
        id: current.id,
      });
    }).match(
      () => true,
      (error) => {
        alertStore.createAlert(error.message, "error");
        return false;
      },
    );
  };
  const rename = (name: string) => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    return getResultAsync(async () => {
      resource.value = await getResourceMutations(current.type).updateResource({ id: current.id, name });
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  const remove = () => {
    const current = resource.value;
    if (!current) return Promise.resolve(false);
    return getResultAsync(() => getResourceMutations(current.type).deleteResource({ id: current.id })).match(
      () => true,
      (error) => {
        alertStore.createAlert(error.message, "error");
        return false;
      },
    );
  };
  const publish = () => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    const { publishResource } = getResourceMutations(current.type);
    if (!publishResource) return Promise.resolve();
    return getResultAsync(async () => {
      publication.value = await publishResource({ id: current.id });
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  const unpublish = () => {
    const current = resource.value;
    if (!current) return Promise.resolve();
    const { unpublishResource } = getResourceMutations(current.type);
    if (!unpublishResource) return Promise.resolve();
    return getResultAsync(async () => {
      await unpublishResource({ id: current.id });
      publication.value = undefined;
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  return { load, publication, publish, readContent, remove, rename, resource, save, unpublish };
};
