import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

export const CodeBlockExtension = CodeBlockLowlight.configure({ lowlight: createLowlight(common) });
