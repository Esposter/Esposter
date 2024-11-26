import { Game as DungeonsGame } from "@/models/dungeons/data/Game";
import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { Game as ClickerGame } from "@/shared/models/clicker/data/Game";
import { Dashboard } from "@/shared/models/dashboard/data/Dashboard";
import { TableEditor } from "@/shared/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "@/shared/models/tableEditor/TableEditorConfiguration";
import { VuetifyComponentItem } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { RegisterSuperJSON } from "@/shared/services/superjson/RegisterSuperJSON";
import baseSuperJSON from "superjson";

// @TODO: Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(ClickerGame);
RegisterSuperJSON(Dashboard);
RegisterSuperJSON(DungeonsGame);
RegisterSuperJSON(EmailEditor);
RegisterSuperJSON(TableEditorConfiguration);
RegisterSuperJSON(TableEditor);
RegisterSuperJSON(TodoListItem);
RegisterSuperJSON(VuetifyComponentItem);

export const SuperJSON = baseSuperJSON;
