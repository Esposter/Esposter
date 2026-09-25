// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { ResourceType } from "@esposter/db-schema";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

const showErrorMock = vi.hoisted(() => vi.fn<() => void>());

mockNuxtImport("showError", () => showErrorMock);

describe(useValidateResourceBlade, () => {
  const resource = createResourceListItem({ type: ResourceType.Note });

  test("404s a blade the loaded resource's type does not have", () => {
    expect.hasAssertions();

    useRouter().currentRoute.value.params.id = resource.id;
    const scope = effectScope();
    scope.run(() => {
      useValidateResourceBlade(ref<Resource | undefined>(resource), ref(ResourceBladeSlug.Items));
    });

    expect(showErrorMock).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  // Swapping to another resource keeps the page it leaves mounted until the next one resolves, while the route
  // Already names the next resource's blade — a todo list's Items judged against the note still loaded
  test("leaves a blade alone while the route names another resource", () => {
    expect.hasAssertions();

    useRouter().currentRoute.value.params.id = crypto.randomUUID();
    const scope = effectScope();
    scope.run(() => {
      useValidateResourceBlade(ref<Resource | undefined>(resource), ref(ResourceBladeSlug.Items));
    });

    expect(showErrorMock).not.toHaveBeenCalled();

    scope.stop();
  });
});
