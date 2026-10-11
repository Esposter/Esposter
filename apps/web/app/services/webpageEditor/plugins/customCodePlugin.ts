import type { Component, ComponentView, Editor, Plugin } from "grapesjs";

interface CodeViewer {
  focus: () => void;
  getContent: () => string;
  getElement: () => HTMLElement;
  refresh: () => void;
  setContent: (code: string) => void;
}

interface OpenModalOptions {
  target?: Component;
  title?: string;
}

const CUSTOM_CODE_ID = "custom-code";
const CODE_PROPERTY = "custom-code-plugin__code";
const OPEN_MODAL_COMMAND = "custom-code:open-modal";
const TOOLBAR_BUTTON_ID = "custom-code";
const MODAL_TITLE = "Insert your code";
const SAVE_LABEL = "Save";
const DEFAULT_CONTENT = "<span>Insert here your custom code</span>";

// Shown on the canvas in place of a custom code that holds a script, which the canvas never runs
const SCRIPT_PLACEHOLDER = `<div style="pointer-events: none; padding: 10px;">
      <svg viewBox="0 0 24 24" style="height: 30px; vertical-align: middle;">
        <path d="M13 14h-2v-4h2m0 8h-2v-2h2M1 21h22L12 2 1 21z"></path>
        </svg>
      Custom code with <i>&lt;script&gt;</i> can't be rendered on the canvas
    </div>`;

const CODE_ICON = `<svg viewBox="0 0 24 24">
        <path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4m-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"></path>
      </svg>`;

export const customCodePlugin: Plugin = (editor: Editor) => {
  // Each custom code view keeps its own pending update, so one view's update never cancels another's
  const updateTimers = new WeakMap<ComponentView, number>();
  let codeViewer: CodeViewer | undefined;
  let modalTarget: Component | undefined;

  const createCodeViewer = (): CodeViewer =>
    editor.CodeManager.createViewer({ codeName: "htmlmixed", readOnly: 0, theme: "hopscotch" });

  const getCodeViewer = () => {
    codeViewer ??= createCodeViewer();
    return codeViewer;
  };

  const saveCode = () => {
    modalTarget?.set(CODE_PROPERTY, getCodeViewer().getContent());
    editor.Modal.close();
  };

  const createSaveButton = () => {
    const button = window.document.createElement("button");
    const prefix = editor.getConfig("stylePrefix");
    button.setAttribute("type", "button");
    button.textContent = SAVE_LABEL;
    button.className = `${prefix}btn-prim ${prefix}btn-import__custom-code`;
    button.onclick = saveCode;

    return button;
  };

  const createModalContent = () => {
    const viewer = getCodeViewer();
    const content = window.document.createElement("div");
    content.className = `${editor.getConfig("stylePrefix")}custom-code`;
    content.append(viewer.getElement(), createSaveButton());
    viewer.refresh();
    setTimeout(() => viewer.focus(), 0);

    return content;
  };

  const showCodeModal = (target: Component, title: string) => {
    const code = target.get(CODE_PROPERTY) || "";
    editor.Modal.open({ content: createModalContent(), title }).onceClose(() => editor.stopCommand(OPEN_MODAL_COMMAND));
    getCodeViewer().setContent(code);
  };

  editor.Blocks.add(CUSTOM_CODE_ID, {
    activate: true,
    category: "Extra",
    content: { type: CUSTOM_CODE_ID },
    label: "Custom Code",
    media: `
      <svg viewBox="0 0 24 24">
        <path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4m-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"></path>
      </svg>
    `,
    select: true,
  });

  // The `script` type is overridden so a script inside a custom code is emptied on the canvas, never run
  editor.Components.addType("script", {
    view: {
      onRender() {
        if (this.model.closestType(CUSTOM_CODE_ID)) this.el.innerHTML = "";
      },
    },
  });

  editor.Components.addType(CUSTOM_CODE_ID, {
    model: {
      defaults: { components: DEFAULT_CONTENT, editable: true, name: "Custom Code" },

      init() {
        this.on(`change:${CODE_PROPERTY}`, this.onCustomCodeChange);
        if (this.components().length === 0) this.components(this.get(CODE_PROPERTY) || DEFAULT_CONTENT);

        const toolbar = this.get("toolbar") ?? [];
        if (!toolbar.some((button) => button.id === TOOLBAR_BUTTON_ID))
          this.set("toolbar", [{ command: OPEN_MODAL_COMMAND, id: TOOLBAR_BUTTON_ID, label: CODE_ICON }, ...toolbar]);
      },

      // An empty code keeps the default content, so the block still has something to click to edit it again
      onCustomCodeChange() {
        this.components(this.get(CODE_PROPERTY) || DEFAULT_CONTENT);
      },
    },

    view: {
      events: () => ({ dblclick: "onActive" }),

      init() {
        this.listenTo(this.model.components(), "add remove reset", this.onComponentsChange);
        this.onComponentsChange();
      },

      onActive() {
        editor.Commands.run(OPEN_MODAL_COMMAND, { target: this.model });
      },

      onComponentsChange() {
        clearTimeout(updateTimers.get(this));
        updateTimers.set(
          this,
          window.setTimeout(() => this.updatePlaceholder(), 0),
        );
      },

      updatePlaceholder() {
        const content: string = this.model.get(CODE_PROPERTY) || "";
        const hasScript = content.includes("<script");
        if (hasScript) this.el.innerHTML = SCRIPT_PLACEHOLDER;
        this.model.set({ droppable: !hasScript });
      },
    },
  });

  editor.Commands.add(OPEN_MODAL_COMMAND, {
    run(_editor, _sender, options: OpenModalOptions = {}) {
      modalTarget = options.target ?? editor.getSelected();
      if (modalTarget?.get("editable")) showCodeModal(modalTarget, options.title || MODAL_TITLE);
    },

    stop() {
      editor.Modal.close();
    },
  });
};
