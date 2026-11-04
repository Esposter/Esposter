import type { SurveyListRow } from "@/models/resource/survey/SurveyListRow";

// A survey list editor as useSurveyListEditor returns it: its draft rows, the message each row is refused with, the
// Announcement its moves read out, and the writes its rows and its add field make
export interface SurveyListEditor<T> {
  addItems: (items: T[]) => void;
  announcement: Ref<string>;
  errors: ComputedRef<(string | undefined)[]>;
  moveItem: (id: string, toIndex: number) => void;
  onRowKeydown: (event: KeyboardEvent, id: string) => Promise<void>;
  removeItem: (id: string) => void;
  rows: ShallowRef<SurveyListRow<T>[]>;
  updateItem: (id: string, update: Partial<T>) => void;
}
