import type { Editor } from "@tiptap/react";
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link, Table, BookOpen, Brain, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";

type ToolbarProps = {
  editor: Editor;
};

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);

  const toggleBlock = (type: string, attrs?: Record<string, unknown>) => {
    const pos = editor.state.selection.from;
    editor
      .chain()
      .focus()
      .insertContentAt(pos, { type, attrs: attrs || {}, content: [{ type: "paragraph" }] })
      .run();
  };

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-group">
        <button
          type="button"
          className={isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className={isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className={isActive("link") ? "active" : ""}
          onClick={() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <Link size={16} />
        </button>
      </div>

      <div className="editor-toolbar-group">
        <button
          type="button"
          className={isActive("heading", { level: 1 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          className={isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          className={isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="editor-toolbar-group">
        <button
          type="button"
          className={isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          className={isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="editor-toolbar-group">
        <button type="button" onClick={() => toggleBlock("keyIdea")}>
          <Sparkles size={16} />
          <span>Ключевая мысль</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const term = window.prompt("Термин");
            if (term) toggleBlock("definition", { term });
          }}
        >
          <BookOpen size={16} />
          <span>Определение</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const title = window.prompt("Название примера", "Пример");
            toggleBlock("example", { title: title || "Пример" });
          }}
        >
          <Brain size={16} />
          <span>Пример</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const title = window.prompt("Название блока", "Важно");
            toggleBlock("callout", { title: title || "Важно" });
          }}
        >
          <Lightbulb size={16} />
          <span>Callout</span>
        </button>
        <button type="button" onClick={() => toggleBlock("examTrap")}>
          <AlertTriangle size={16} />
          <span>Ловушка</span>
        </button>
      </div>

      <div className="editor-toolbar-group">
        <button
          type="button"
          onClick={() => {
            toggleBlock("compareTable", {
              caption: "",
              columns: ["", ""],
              rows: [
                ["", ""],
                ["", ""],
              ],
            });
          }}
        >
          <Table size={16} />
          <span>Таблица</span>
        </button>
      </div>
    </div>
  );
}
