import type { Editor } from "@tiptap/react";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Heading2,
  Lightbulb,
  ListPlus,
  Pilcrow,
  Plus,
  Sparkles,
  Table,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

type InsertOption = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  build: () => Record<string, unknown> | null;
};

type InsertAnchor = {
  top: number;
  pos: number;
};

type InlineInsertMenuProps = {
  editor: Editor;
};

function promptValue(label: string, fallback: string) {
  const value = window.prompt(label, fallback);
  if (value === null) return null;
  return value.trim() || fallback;
}

function insertAt(editor: Editor, pos: number, content: Record<string, unknown>) {
  editor
    .chain()
    .focus()
    .insertContentAt(pos, content, { updateSelection: true })
    .run();
}

function blockPositionAtIndex(editor: Editor, index: number) {
  let pos = 0;
  for (let i = 0; i <= index; i += 1) {
    pos += editor.state.doc.child(i).nodeSize;
  }
  return pos;
}

function getTopLevelBlocks(editor: Editor) {
  return Array.from(editor.view.dom.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

export function InlineInsertMenu({ editor }: InlineInsertMenuProps) {
  const [anchor, setAnchor] = useState<InsertAnchor | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const options = useMemo<InsertOption[]>(
    () => [
      {
        id: "paragraph",
        label: "Абзац",
        icon: Pilcrow,
        build: () => ({ type: "paragraph" }),
      },
      {
        id: "heading",
        label: "Заголовок",
        icon: Heading2,
        build: () => ({ type: "heading", attrs: { level: 2 } }),
      },
      {
        id: "bulletList",
        label: "Список",
        icon: ListPlus,
        build: () => ({
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
        }),
      },
      {
        id: "keyIdea",
        label: "Ключевая мысль",
        icon: Sparkles,
        build: () => ({ type: "keyIdea", content: [{ type: "paragraph" }] }),
      },
      {
        id: "definition",
        label: "Определение",
        icon: BookOpen,
        build: () => {
          const term = promptValue("Термин", "");
          if (term === null) return null;
          return { type: "definition", attrs: { term }, content: [{ type: "paragraph" }] };
        },
      },
      {
        id: "example",
        label: "Пример",
        icon: Brain,
        build: () => {
          const title = promptValue("Название примера", "Пример");
          if (title === null) return null;
          return { type: "example", attrs: { title }, content: [{ type: "paragraph" }] };
        },
      },
      {
        id: "callout",
        label: "Callout",
        icon: Lightbulb,
        build: () => {
          const title = promptValue("Название блока", "Важно");
          if (title === null) return null;
          return { type: "callout", attrs: { title }, content: [{ type: "paragraph" }] };
        },
      },
      {
        id: "examTrap",
        label: "Ловушка",
        icon: AlertTriangle,
        build: () => ({ type: "examTrap", content: [{ type: "paragraph" }] }),
      },
      {
        id: "compareTable",
        label: "Таблица",
        icon: Table,
        build: () => ({
          type: "compareTable",
          attrs: {
            caption: "",
            columns: ["", ""],
            rows: [
              ["", ""],
              ["", ""],
            ],
          },
        }),
      },
    ],
    [],
  );

  useEffect(() => {
    const canvas = editor.view.dom.closest(".tiptap-editor__canvas");
    if (!(canvas instanceof HTMLElement)) return;

    const updateAnchor = (event: MouseEvent) => {
      if (menuOpen) return;

      const blocks = getTopLevelBlocks(editor);
      if (blocks.length === 0) {
        const canvasRect = canvas.getBoundingClientRect();
        setAnchor({ top: 34, pos: 0 });
        if (
          event.clientX < canvasRect.left ||
          event.clientX > canvasRect.right ||
          event.clientY < canvasRect.top ||
          event.clientY > canvasRect.bottom
        ) {
          setAnchor(null);
        }
        return;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const mouseY = event.clientY;
      const firstRect = blocks[0].getBoundingClientRect();
      const beforeFirstTop = canvasRect.top + 28;
      const firstGapMiddle = (beforeFirstTop + firstRect.top) / 2;

      if (Math.abs(mouseY - firstGapMiddle) <= 14) {
        setAnchor({ top: firstGapMiddle - canvasRect.top, pos: 0 });
        return;
      }

      for (let index = 0; index < blocks.length; index += 1) {
        const currentRect = blocks[index].getBoundingClientRect();
        const nextRect = blocks[index + 1]?.getBoundingClientRect();
        const lower = currentRect.bottom;
        const upper = nextRect ? nextRect.top : currentRect.bottom + 34;
        const middle = (lower + upper) / 2;
        const inGap = mouseY >= lower - 8 && mouseY <= upper + 8;

        if (inGap && Math.abs(mouseY - middle) <= Math.max(14, (upper - lower) / 2 + 8)) {
          setAnchor({
            top: middle - canvasRect.top,
            pos:
              index < editor.state.doc.childCount
                ? blockPositionAtIndex(editor, index)
                : editor.state.doc.content.size,
          });
          return;
        }
      }

      setAnchor(null);
    };

    const clearAnchor = () => {
      if (!menuOpen) setAnchor(null);
    };

    canvas.addEventListener("mousemove", updateAnchor);
    canvas.addEventListener("mouseleave", clearAnchor);

    return () => {
      canvas.removeEventListener("mousemove", updateAnchor);
      canvas.removeEventListener("mouseleave", clearAnchor);
    };
  }, [editor, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const close = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".inline-insert")) return;
      setMenuOpen(false);
      setAnchor(null);
    };

    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  if (!anchor) return null;

  return (
    <div className="inline-insert" style={{ top: anchor.top }}>
      <span className="inline-insert__line" aria-hidden="true" />
      <button
        type="button"
        className="inline-insert__button"
        aria-label="Добавить блок"
        title="Добавить блок"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Plus size={16} />
      </button>
      <span className="inline-insert__line" aria-hidden="true" />

      {menuOpen && (
        <div className="inline-insert__menu">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const content = option.build();
                  if (!content) return;
                  insertAt(editor, anchor.pos, content);
                  setMenuOpen(false);
                  setAnchor(null);
                }}
              >
                <Icon size={16} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
