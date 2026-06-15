import type { Editor } from "@tiptap/react";
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link } from "lucide-react";

type ToolbarProps = {
  editor: Editor;
};

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-group">
        <button
          type="button"
          aria-label="Жирный"
          title="Жирный"
          className={isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          aria-label="Курсив"
          title="Курсив"
          className={isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          aria-label="Ссылка"
          title="Ссылка"
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
          aria-label="Заголовок 1"
          title="Заголовок 1"
          className={isActive("heading", { level: 1 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          aria-label="Заголовок 2"
          title="Заголовок 2"
          className={isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          aria-label="Заголовок 3"
          title="Заголовок 3"
          className={isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="editor-toolbar-group">
        <button
          type="button"
          aria-label="Маркированный список"
          title="Маркированный список"
          className={isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          aria-label="Нумерованный список"
          title="Нумерованный список"
          className={isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          aria-label="Цитата"
          title="Цитата"
          className={isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </button>
      </div>

    </div>
  );
}
