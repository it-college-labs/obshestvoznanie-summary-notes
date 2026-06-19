import type { Editor } from "@tiptap/react";
import { Bold, Heading1, Heading2, Heading3, Italic, Link, List, ListOrdered, Quote } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type ToolbarProps = {
  editor: Editor;
};

type ToolbarAnchor = {
  left: number;
  top: number;
  canvasWidth: number;
};

export function Toolbar({ editor }: ToolbarProps) {
  const [anchor, setAnchor] = useState<ToolbarAnchor | null>(null);
  const [toolbarWidth, setToolbarWidth] = useState(0);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateAnchor = () => {
      const { state, view } = editor;
      const { selection } = state;

      if (selection.empty || !editor.isEditable) {
        setAnchor(null);
        return;
      }

      const canvas = view.dom.closest(".tiptap-editor__canvas");
      if (!(canvas instanceof HTMLElement)) {
        setAnchor(null);
        return;
      }

      try {
        const start = view.coordsAtPos(selection.from);
        const end = view.coordsAtPos(selection.to);
        const canvasRect = canvas.getBoundingClientRect();
        const left = (start.left + end.right) / 2 - canvasRect.left;
        const top = Math.min(start.top, end.top) - canvasRect.top;

        setAnchor({
          left: Math.max(12, Math.min(left, canvasRect.width - 12)),
          top: Math.max(12, top),
          canvasWidth: canvasRect.width,
        });
      } catch (_err) {
        setAnchor(null);
      }
    };

    editor.on("selectionUpdate", updateAnchor);
    editor.on("transaction", updateAnchor);
    window.addEventListener("resize", updateAnchor);
    updateAnchor();

    return () => {
      editor.off("selectionUpdate", updateAnchor);
      editor.off("transaction", updateAnchor);
      window.removeEventListener("resize", updateAnchor);
    };
  }, [editor]);

  const resolvedLeft = useMemo(() => {
    if (!anchor) return 0;
    if (!toolbarWidth) return anchor.left;

    const edgeGap = 12;
    const halfWidth = toolbarWidth / 2;
    const minLeft = halfWidth + edgeGap;
    const maxLeft = anchor.canvasWidth - halfWidth - edgeGap;

    if (maxLeft < minLeft) {
      return anchor.canvasWidth / 2;
    }

    return Math.max(minLeft, Math.min(anchor.left, maxLeft));
  }, [anchor, toolbarWidth]);

  useLayoutEffect(() => {
    if (!anchor || !toolbarRef.current) return;

    const updateWidth = () => {
      if (!toolbarRef.current) return;
      setToolbarWidth(toolbarRef.current.offsetWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(toolbarRef.current);

    return () => observer.disconnect();
  }, [anchor]);

  if (!anchor) return null;

  const isActive = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);

  return (
    <div
      ref={toolbarRef}
      className="editor-bubble-toolbar"
      style={{ left: resolvedLeft, top: anchor.top }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        aria-label="Жирный"
        title="Жирный"
        className={isActive("bold") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        aria-label="Курсив"
        title="Курсив"
        className={isActive("italic") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
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
        <Link size={15} />
      </button>
      <span className="editor-bubble-toolbar__divider" aria-hidden="true" />
      <button
        type="button"
        aria-label="Заголовок 1"
        title="Заголовок 1"
        className={isActive("heading", { level: 1 }) ? "active" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={15} />
      </button>
      <button
        type="button"
        aria-label="Заголовок 2"
        title="Заголовок 2"
        className={isActive("heading", { level: 2 }) ? "active" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </button>
      <button
        type="button"
        aria-label="Заголовок 3"
        title="Заголовок 3"
        className={isActive("heading", { level: 3 }) ? "active" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </button>
      <span className="editor-bubble-toolbar__divider" aria-hidden="true" />
      <button
        type="button"
        aria-label="Маркированный список"
        title="Маркированный список"
        className={isActive("bulletList") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </button>
      <button
        type="button"
        aria-label="Нумерованный список"
        title="Нумерованный список"
        className={isActive("orderedList") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </button>
      <button
        type="button"
        aria-label="Цитата"
        title="Цитата"
        className={isActive("blockquote") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </button>
    </div>
  );
}
