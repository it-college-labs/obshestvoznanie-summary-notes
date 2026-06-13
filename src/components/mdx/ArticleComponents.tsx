/* eslint-disable react-refresh/only-export-components */
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertTriangle, BookOpen, Brain, Lightbulb } from "lucide-react";

type WithChildren = {
  children: ReactNode;
};

type DefinitionProps = WithChildren & {
  term: string;
};

type CalloutProps = WithChildren & {
  title?: string;
};

type ExampleProps = WithChildren & {
  title?: string;
};

type CompareTableProps = {
  caption?: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
};

function Text({ children }: WithChildren) {
  return <div className="mdx-text">{children}</div>;
}

function Definition({ term, children }: DefinitionProps) {
  return (
    <aside className="mdx-block mdx-definition">
      <span className="mdx-icon">
        <BookOpen size={18} />
      </span>
      <div>
        <strong>{term}</strong>
        <div className="mdx-block-body">{children}</div>
      </div>
    </aside>
  );
}

function Callout({ title = "Важно", children }: CalloutProps) {
  return (
    <aside className="mdx-block mdx-callout">
      <span className="mdx-icon">
        <Lightbulb size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </aside>
  );
}

function Example({ title = "Пример", children }: ExampleProps) {
  return (
    <aside className="mdx-block mdx-example">
      <span className="mdx-icon">
        <Brain size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </aside>
  );
}

function KeyIdea({ children }: WithChildren) {
  return (
    <aside className="mdx-key-idea">
      <span>Ключевая мысль</span>
      <div className="mdx-key-idea__body">{children}</div>
    </aside>
  );
}

function ExamTrap({ children }: WithChildren) {
  return (
    <aside className="mdx-block mdx-trap">
      <span className="mdx-icon">
        <AlertTriangle size={18} />
      </span>
      <div>
        <strong>Ловушка формулировки</strong>
        <div>{children}</div>
      </div>
    </aside>
  );
}

function CompareTable({ caption, columns, rows }: CompareTableProps) {
  return (
    <figure className="mdx-table-wrap">
      {caption && <figcaption>{caption}</figcaption>}
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.length}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Anchor(props: ComponentPropsWithoutRef<"a">) {
  return <a {...props} target="_blank" rel="noreferrer" />;
}

export const mdxComponents = {
  Text,
  PlainText: Text,
  Definition,
  Callout,
  Example,
  CompareTable,
  KeyIdea,
  ExamTrap,
  a: Anchor,
};
