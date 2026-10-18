import type { PdfDocumentParameters } from "#src/models/PdfDocumentParameters";
import type { PdfDocumentState } from "#src/models/PdfDocumentState";
import type { PdfLoadingProgress } from "#src/models/PdfLoadingProgress";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfSource } from "#src/models/PdfSource";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { destroyLoadingTask } from "#src/services/destroyLoadingTask";
import { loadPdfDocument } from "#src/services/loadPdfDocument";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface UsePdfDocumentOptions {
  parameters?: PdfDocumentParameters;
  renderer: MaybeRefOrGetter<PdfRenderer | undefined>;
  source: MaybeRefOrGetter<PdfSource | undefined>;
}

const EMPTY_PROGRESS: PdfLoadingProgress = { loaded: 0, total: 0 };

// Loads a document from a source through the consumer's renderer, with its password prompt and its failure as state.
// A source change or the scope's end releases the load in flight, and nothing it reports afterwards is kept
export const usePdfDocument = ({ parameters = {}, renderer, source }: UsePdfDocumentOptions): PdfDocumentState => {
  const pdfDocument = shallowRef<PDFDocumentProxy>();
  const progress = ref<PdfLoadingProgress>(EMPTY_PROGRESS);
  const isFailed = ref(false);
  const isPasswordRequested = ref(false);
  const isPasswordWrong = ref(false);
  let loadingTask: PDFDocumentLoadingTask | undefined;
  let updatePassword: ((password: string) => void) | undefined;
  // Bumped by every release, so a load still waiting on its source destroys the task it made instead of holding it
  let loadGeneration = 0;

  // Destroys the task the current load has made, if it has made one, so its worker is not left running
  const destroyCurrentTask = () => {
    if (loadingTask) destroyLoadingTask(loadingTask);
    loadingTask = undefined;
  };
  const release = () => {
    loadGeneration++;
    destroyCurrentTask();
    pdfDocument.value = undefined;
    progress.value = EMPTY_PROGRESS;
    isFailed.value = false;
    isPasswordRequested.value = false;
    isPasswordWrong.value = false;
  };
  const load = async (currentRenderer: PdfRenderer, currentSource: PdfSource) => {
    const generation = loadGeneration;
    await getResultAsync(async () => {
      const task = await loadPdfDocument(currentRenderer, currentSource, parameters);
      if (generation !== loadGeneration) {
        destroyLoadingTask(task);
        return;
      }

      loadingTask = task;
      task.onProgress = ({ loaded, total }: PdfLoadingProgress) => {
        if (generation === loadGeneration) progress.value = { loaded, total };
      };
      // The renderer asks again with the reason when a password is wrong, so the prompt says so rather than starting over
      task.onPassword = (passwordCallback: (password: string) => void, reason: number) => {
        if (generation !== loadGeneration) return;

        updatePassword = passwordCallback;
        isPasswordWrong.value = reason === currentRenderer.api.PasswordResponses.INCORRECT_PASSWORD;
        isPasswordRequested.value = true;
      };
      const loadedDocument = await task.promise;
      if (generation === loadGeneration) pdfDocument.value = loadedDocument;
    }).match(noop, (error) => {
      // A load a release tore down rejects too, and it is the newer load that stands
      if (generation !== loadGeneration) return;

      isFailed.value = true;
      destroyCurrentTask();
      console.error(error);
    });
  };
  const submitPassword = (password: string) => {
    isPasswordRequested.value = false;
    updatePassword?.(password);
  };

  watch(
    [() => toValue(renderer), () => toValue(source)],
    getSynchronizedFunction(async ([currentRenderer, currentSource]) => {
      release();
      if (currentRenderer && currentSource) await load(currentRenderer, currentSource);
    }),
    { immediate: true },
  );
  onScopeDispose(release);

  return { isFailed, isPasswordRequested, isPasswordWrong, pdfDocument, progress, submitPassword };
};
