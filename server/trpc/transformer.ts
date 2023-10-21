import { Game as ClickerGame } from "@/models/clicker/Game";
import { Game as DungeonsGame } from "@/models/dungeons/Game";
import { TableEditor } from "@/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";
import SuperJSON from "superjson";

// @TODO: Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(ClickerGame);
RegisterSuperJSON(DungeonsGame);
RegisterSuperJSON(TableEditorConfiguration);
RegisterSuperJSON(TableEditor);
RegisterSuperJSON(TodoListItem);
RegisterSuperJSON(VuetifyComponentItem);

export const transformer = SuperJSON;
