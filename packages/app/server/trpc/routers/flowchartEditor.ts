import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const flowchartEditorRouter = router(createResourceProcedures(ResourceType.Flowchart));
