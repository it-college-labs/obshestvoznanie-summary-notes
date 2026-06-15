import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { HardBreak } from "@tiptap/extension-hard-break";
import { KeyIdea, Definition, Example, Callout, ExamTrap, CompareTable } from "./extensions";
import type { Block } from "../../api/types";
import { Toolbar } from "./ui/Toolbar";

function normalizeContent(blocks: Block[]) {
  return blocks.map((block) => {
    if (block.type === "bulletList" || block.type === "orderedList") {
      return {
        ...block,
        content: (block.content || []).map((item) => ({
          type: "listItem",
          content: item.content || [],
        })),
      };
    }
    return block;
  });
}

function toTipTapDocument(content: Block): Record<string, unknown> {
  return {
    type: "doc",
    content: normalizeContent(content.content || []),
  };
}

function fromTipTapDocument(doc: Record<string, unknown>): Block {
  return {
    type: "doc",
    content: (doc.content as Block[]) || [],
  };
}

type TipTapEditorProps = {
  initialContent: Block;
  onChange: (content: Block) => void;
};

export function TipTapEditor({ initialContent, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false,
      }),
      HardBreak,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Начните писать…" }),
      KeyIdea,
      Definition,
      Example,
      Callout,
      ExamTrap,
      CompareTable,
    ],
    content: toTipTapDocument(initialContent),
    onUpdate: ({ editor }) => {
      onChange(fromTipTapDocument(editor.getJSON()));
    },
  });

  if (!editor) return <div className="editor-loading">Загрузка редактора…</div>;

  return (
    <div className="tiptap-editor">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap-editor__content" />
    </div>
  );
}
