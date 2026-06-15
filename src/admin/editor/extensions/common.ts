import { Node, mergeAttributes } from "@tiptap/core";

type AttrConfig = Record<string, { default: string | boolean | number | string | string[] }>;

export function createBlockExtension(options: {
  name: string;
  label: string;
  className: string;
  attrs?: AttrConfig;
}) {
  return Node.create({
    name: options.name,
    group: "block",
    content: "block*",
    isolating: true,
    addAttributes() {
      return options.attrs || {};
    },
    parseHTML() {
      return [{ tag: `aside[data-type="${options.name}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return [
        "aside",
        mergeAttributes({ "data-type": options.name, class: options.className }, HTMLAttributes),
        0,
      ];
    },
    addNodeView() {
      return ({ node }) => {
        const dom = document.createElement("aside");
        dom.className = options.className;
        dom.dataset.type = options.name;

        const header = document.createElement("div");
        header.className = `${options.className}__header`;

        const label = document.createElement("span");
        label.className = `${options.className}__label`;
        label.textContent = options.label;
        header.appendChild(label);

        if (node.attrs.term) {
          const term = document.createElement("strong");
          term.className = `${options.className}__term`;
          term.textContent = String(node.attrs.term);
          header.appendChild(term);
        }

        if (node.attrs.title) {
          const title = document.createElement("span");
          title.className = `${options.className}__title`;
          title.textContent = String(node.attrs.title);
          header.appendChild(title);
        }

        dom.appendChild(header);

        const content = document.createElement("div");
        content.className = `${options.className}__content`;
        dom.appendChild(content);

        return {
          dom,
          contentDOM: content,
        };
      };
    },
  });
}
