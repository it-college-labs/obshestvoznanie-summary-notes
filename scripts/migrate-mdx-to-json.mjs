import { remark } from "remark";
import remarkMdx from "remark-mdx";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = process.env.API_BASE || "http://localhost:8080";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const metaPath = path.join(__dirname, "articles-meta.json");
const notesDir = path.join(__dirname, "..", "src", "content", "notes");

async function main() {
  if (!ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is required. Example: ADMIN_PASSWORD='...' node scripts/migrate-mdx-to-json.mjs");
  }

  const cookie = await login();
  console.log("Logged in.");

  const metaList = JSON.parse(await fs.readFile(metaPath, "utf8"));

  for (const meta of metaList) {
    const mdxFile = meta.mdxFile || `${meta.id}.mdx`;
    const mdxPath = path.join(notesDir, mdxFile);
    const source = await fs.readFile(mdxPath, "utf8");
    const tree = remark().use(remarkMdx).parse(source);

    const content = convertRoot(tree);
    const article = {
      ...meta,
      content,
      status: "published",
    };

    const existsRes = await fetch(`${API_BASE}/api/admin/articles/${meta.id}`, {
      headers: { Cookie: cookie },
    });

    const exists = existsRes.status === 200;
    const res = await fetch(`${API_BASE}/api/admin/articles${exists ? `/${meta.id}` : ""}`, {
      method: exists ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(article),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to ${exists ? "update" : "create"} ${meta.id}: ${res.status} ${text}`);
      process.exit(1);
    }

    console.log(`${exists ? "Updated" : "Migrated"} ${meta.id}: ${meta.title}`);
  }

  console.log("Migration complete.");
}

async function login() {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }

  const cookies = res.headers.getSetCookie?.() || res.headers.get("set-cookie") || [];
  const cookie = Array.isArray(cookies) ? cookies.join("; ") : cookies;
  if (!cookie) {
    throw new Error("No cookie returned from login");
  }
  return cookie;
}

function convertRoot(root) {
  return {
    type: "doc",
    content: (root.children || []).flatMap((child) => convertNode(child)),
  };
}

function convertNode(node) {
  switch (node.type) {
    case "heading":
      return [
        {
          type: "heading",
          attrs: { level: node.depth },
          content: convertInlineChildren(node.children || []),
        },
      ];

    case "paragraph":
      return [
        {
          type: "paragraph",
          content: convertInlineChildren(node.children || []),
        },
      ];

    case "blockquote":
      return (node.children || []).flatMap((child) => convertNode(child));

    case "bulletList":
      return [
        {
          type: "bulletList",
          content: (node.children || []).map((item) => ({
            type: "listItem",
            content: (item.children || []).flatMap((child) =>
              child.type === "paragraph"
                ? { type: "paragraph", content: convertInlineChildren(child.children || []) }
                : convertNode(child)
            ),
          })),
        },
      ];

    case "orderedList":
      return [
        {
          type: "orderedList",
          attrs: { start: node.start || 1 },
          content: (node.children || []).map((item) => ({
            type: "listItem",
            content: (item.children || []).flatMap((child) =>
              child.type === "paragraph"
                ? { type: "paragraph", content: convertInlineChildren(child.children || []) }
                : convertNode(child)
            ),
          })),
        },
      ];

    case "mdxJsxFlowElement":
      return convertJsxElement(node);

    case "thematicBreak":
      return [];

    default:
      return [];
  }
}

function convertJsxElement(node) {
  const name = node.name;
  const children = node.children || [];

  switch (name) {
    case "Text":
      return children.flatMap((child) => convertNode(child));

    case "KeyIdea":
      return [
        {
          type: "keyIdea",
          content: children.flatMap((child) => convertNode(child)),
        },
      ];

    case "Definition":
      return [
        {
          type: "definition",
          attrs: { term: getStringAttr(node, "term") },
          content: children.flatMap((child) => convertNode(child)),
        },
      ];

    case "Example":
      return [
        {
          type: "example",
          attrs: { title: getStringAttr(node, "title") || "Пример" },
          content: children.flatMap((child) => convertNode(child)),
        },
      ];

    case "Callout":
      return [
        {
          type: "callout",
          attrs: { title: getStringAttr(node, "title") || "Важно" },
          content: children.flatMap((child) => convertNode(child)),
        },
      ];

    case "ExamTrap":
      return [
        {
          type: "examTrap",
          content: children.flatMap((child) => convertNode(child)),
        },
      ];

    case "CompareTable":
      return [
        {
          type: "compareTable",
          attrs: {
            caption: getStringAttr(node, "caption") || "",
            columns: getArrayAttr(node, "columns") || [],
            rows: getArrayAttr(node, "rows") || [],
          },
        },
      ];

    default:
      return children.flatMap((child) => convertNode(child));
  }
}

function getStringAttr(node, name) {
  const attr = (node.attributes || []).find((a) => a.name === name);
  if (!attr) return "";
  if (typeof attr.value === "string") return attr.value;
  return "";
}

function getArrayAttr(node, name) {
  const attr = (node.attributes || []).find((a) => a.name === name);
  if (!attr || !attr.value || !attr.value.data || !attr.value.data.estree) return [];
  return extractExpressionValue(attr.value.data.estree.body[0]?.expression);
}

function extractExpressionValue(expr) {
  if (!expr) return null;
  switch (expr.type) {
    case "ArrayExpression":
      return expr.elements.map((el) => extractExpressionValue(el));
    case "Literal":
      return expr.value;
    case "ObjectExpression": {
      const obj = {};
      for (const prop of expr.properties) {
        if (prop.key && prop.key.type === "Identifier") {
          obj[prop.key.name] = extractExpressionValue(prop.value);
        }
      }
      return obj;
    }
    default:
      return null;
  }
}

function convertInlineChildren(children) {
  return (children || []).flatMap((child) => convertInlineNode(child));
}

function convertInlineNode(node) {
  switch (node.type) {
    case "text":
      return [{ type: "text", text: node.value }];

    case "break":
      return [{ type: "hardBreak" }];

    case "strong":
      return wrapMarks(convertInlineChildren(node.children), [{ type: "bold" }]);

    case "emphasis":
      return wrapMarks(convertInlineChildren(node.children), [{ type: "italic" }]);

    case "delete":
      return wrapMarks(convertInlineChildren(node.children), [{ type: "strike" }]);

    case "inlineCode":
      return [{ type: "text", text: node.value, marks: [{ type: "code" }] }];

    case "link":
      return wrapMarks(convertInlineChildren(node.children), [
        { type: "link", attrs: { href: node.url, target: node.url?.startsWith("http") ? "_blank" : undefined } },
      ]);

    case "mdxJsxTextElement":
      return convertInlineChildren(node.children || []);

    default:
      return [];
  }
}

function wrapMarks(nodes, marks) {
  return nodes.map((n) => ({
    ...n,
    marks: [...(n.marks || []), ...marks],
  }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
