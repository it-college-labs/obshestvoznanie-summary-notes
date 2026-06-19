import { TipTapEditor } from "../editor/TipTapEditor";
import { PublishPanel, ArticleDetailsPanel, ArticleMediaPanel, ArticleStylePanel } from "./Panels";
import type { ArticleAdmin, Block, Upload } from "../../api/types";

type UpdateMeta = (field: keyof ArticleAdmin, value: unknown) => void;
type UpdateArray = (field: "tags" | "accent" | "folderPreviewImages", index: number, value: string) => void;

export function EditorCanvas({
  article,
  onContentChange,
}: {
  article: ArticleAdmin;
  onContentChange: (content: Block) => void;
}) {
  return (
    <section className="admin-editor-canvas">
      <div className="admin-editor-pane">
        <TipTapEditor initialContent={article.content} onChange={onContentChange} />
      </div>
    </section>
  );
}

export function EditorInspector({
  article,
  isNew,
  hasChanges,
  uploads,
  uploadingImage,
  updateMeta,
  updateArray,
  uploadImageForField,
}: {
  article: ArticleAdmin;
  isNew: boolean;
  hasChanges: boolean;
  uploads: Upload[];
  uploadingImage: string | null;
  updateMeta: UpdateMeta;
  updateArray: UpdateArray;
  uploadImageForField: (fieldKey: string, file: File, apply: (url: string) => void) => void;
}) {
  return (
    <aside className="admin-editor-inspector">
      <PublishPanel article={article} hasChanges={hasChanges} />
      <ArticleDetailsPanel article={article} isNew={isNew} updateMeta={updateMeta} />
      <ArticleMediaPanel
        article={article}
        uploads={uploads}
        uploadingImage={uploadingImage}
        updateMeta={updateMeta}
        updateArray={updateArray}
        uploadImageForField={uploadImageForField}
      />
      <ArticleStylePanel article={article} updateArray={updateArray} />
    </aside>
  );
}
