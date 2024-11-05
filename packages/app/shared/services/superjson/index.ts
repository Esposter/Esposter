import { Game as ClickerGame } from "@/models/clicker/data/Game";
import { Dashboard } from "@/models/dashboard/Dashboard";
import { Game as DungeonsGame } from "@/models/dungeons/data/Game";
import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { TableEditor } from "@/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
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
