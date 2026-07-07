// oxlint-disable typescript/no-unnecessary-type-assertion
import type { ResourceProcedures } from "@/models/resource/ResourceProcedures";
import type { Resource } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";
import type { z } from "zod";

import { authClient } from "@/services/auth/authClient";
import { RESOURCE_ID_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, jsonDateParse, noop, takeOne } from "@esposter/shared";

interface UseResourceStateOptions {
  defaultName: string;
  localStorageKey: string;
  schema: z.ZodType;
}
// The init parameter is typed never so every content class with an optional-init constructor is accepted
// (their init types vary: Partial<X> vs PartialDeep<X>); the single `as never` below is the centralized cost.
export const useResourceState = <TContent extends ItemMetadata>(
  Model: new (init?: never) => TContent,
  procedures: ResourceProcedures<TContent>,
  { defaultName, localStorageKey, schema }: UseResourceStateOptions,
) => {
  const session = authClient.useSession();
  const route = useRoute();
  const alertStore = useAlertStore();
  const saveToLocalStorage = useSaveToLocalStorage();
  const resources = ref<Resource[]>([]);
  const currentResource = ref<Resource>();
  const content = ref(new Model()) as Ref<TContent>;

  const selectResource = async (id: Resource["id"]) => {
    const resource = resources.value.find((foundResource) => foundResource.id === id);
    if (!resource) return;

    currentResource.value = resource;
    const data = await procedures.readResourceContent({ id });
    content.value = new Model((data ?? undefined) as never);
  };
  // The unauthenticated path stays single-resource in local storage
  const loadLocal = () => {
    const contentJson = localStorage.getItem(localStorageKey);
    content.value = contentJson ? new Model(jsonDateParse(contentJson) as never) : new Model();
  };
  const load = async () => {
    resources.value = await procedures.readResources();
    if (resources.value.length === 0) resources.value = [await procedures.createResource({ name: defaultName })];
    // The resource explorer deep-links a specific resource via query param; fall back to the most recent otherwise
    const requestedId = route.query[RESOURCE_ID_QUERY_PARAMETER_KEY];
    const requestedResource =
      typeof requestedId === "string"
        ? resources.value.find((foundResource) => foundResource.id === requestedId)
        : undefined;
    await selectResource((requestedResource ?? takeOne(resources.value)).id);
  };
  const save = (): Promise<boolean> => {
    saveItemMetadata(content.value);

    const resource = currentResource.value;
    if (session.value.data && resource)
      return getResultAsync(async () => {
        const updatedResource = await procedures.saveResourceContent({
          content: content.value,
          contentVersion: resource.contentVersion,
          id: resource.id,
        });
        currentResource.value = updatedResource;
        resources.value = resources.value.map((foundResource) =>
          foundResource.id === updatedResource.id ? updatedResource : foundResource,
        );
      }).match(
        () => true,
        (error) => {
          alertStore.createAlert(error.message, "error");
          return false;
        },
      );

    return Promise.resolve(saveToLocalStorage(localStorageKey, schema, content.value));
  };
  const createResource = async (name: Resource["name"]) => {
    const newResource = await procedures.createResource({ name });
    resources.value = [newResource, ...resources.value];
    await selectResource(newResource.id);
  };
  const renameResource = async (id: Resource["id"], name: Resource["name"]) => {
    const updatedResource = await procedures.updateResource({ id, name });
    resources.value = resources.value.map((foundResource) =>
      foundResource.id === updatedResource.id ? updatedResource : foundResource,
    );
    if (currentResource.value?.id === updatedResource.id) currentResource.value = updatedResource;
  };
  const deleteResource = async (id: Resource["id"]) => {
    await procedures.deleteResource({ id });
    resources.value = resources.value.filter((foundResource) => foundResource.id !== id);
    if (currentResource.value?.id === id) await load();
  };
  const setCurrentResource = (resource: Resource) => {
    currentResource.value = resource;
    resources.value = resources.value.map((foundResource) =>
      foundResource.id === resource.id ? resource : foundResource,
    );
  };
  // Publishing bakes the latest content, so a failed save must abort instead of publishing stale content
  const publish = async () => {
    if (!procedures.publishResource || !(await save())) return;
    const resource = currentResource.value;
    if (!resource) return;
    await getResultAsync(async () => {
      if (!procedures.publishResource) return;
      setCurrentResource(await procedures.publishResource({ id: resource.id }));
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  const unpublish = async () => {
    const resource = currentResource.value;
    if (!resource) return;
    await getResultAsync(async () => {
      if (!procedures.unpublishResource) return;
      setCurrentResource(await procedures.unpublishResource({ id: resource.id }));
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  return {
    content,
    createResource,
    currentResource,
    deleteResource,
    load,
    loadLocal,
    publish,
    renameResource,
    resources,
    save,
    selectResource,
    setCurrentResource,
    unpublish,
  };
};
