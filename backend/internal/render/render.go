package render

import (
	"fmt"
	"html"
	"strings"
	"unicode"

	"github.com/nksv-ilya/neuroarchive/internal/models"
)

func RenderArticle(article *models.Article) (*models.ArticlePublic, error) {
	var headings []models.Heading
	var sb strings.Builder

	sb.WriteString(`<article class="article-render">`)

	content := article.Content.Content
	if content == nil {
		content = []models.Block{}
	}

	for _, block := range content {
		h, err := renderBlock(&sb, block, &headings)
		if err != nil {
			return nil, err
		}
		if h != nil {
			headings = append(headings, *h)
		}
	}

	sb.WriteString(`</article>`)

	return &models.ArticlePublic{
		Meta:     article.ArticleMeta,
		HTML:     sb.String(),
		Headings: headings,
	}, nil
}

func renderBlock(sb *strings.Builder, block models.Block, headings *[]models.Heading) (*models.Heading, error) {
	switch block.Type {
	case "doc":
		for _, child := range block.Content {
			if _, err := renderBlock(sb, child, headings); err != nil {
				return nil, err
			}
		}
		return nil, nil

	case "heading":
		level := 2
		if attrs, ok := block.Attrs["level"].(float64); ok {
			level = int(attrs)
		}
		if level < 1 || level > 6 {
			level = 2
		}
		text := renderInline(block.Content)
		id := slugify(text)
		sb.WriteString(fmt.Sprintf("<h%d id=\"%s\">%s</h%d>\n", level, id, text, level))
		return &models.Heading{Level: level, Text: text, ID: id}, nil

	case "paragraph":
		text := renderInline(block.Content)
		if strings.TrimSpace(text) == "" {
			sb.WriteString("<p></p>\n")
		} else {
			sb.WriteString(fmt.Sprintf("<p>%s</p>\n", text))
		}
		return nil, nil

	case "keyIdea":
		content := renderBlockContent(block.Content, headings)
		sb.WriteString(fmt.Sprintf(`<aside class="mdx-key-idea"><span>Ключевая мысль</span><div class="mdx-key-idea__body">%s</div></aside>`, content))
		return nil, nil

	case "definition":
		term := ""
		if t, ok := block.Attrs["term"].(string); ok {
			term = html.EscapeString(t)
		}
		content := renderBlockContent(block.Content, headings)
		sb.WriteString(fmt.Sprintf(`<aside class="mdx-block mdx-definition"><span class="mdx-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></span><div><strong>%s</strong><div class="mdx-block-body">%s</div></div></aside>`, term, content))
		return nil, nil

	case "example":
		title := "Пример"
		if t, ok := block.Attrs["title"].(string); ok && t != "" {
			title = html.EscapeString(t)
		}
		content := renderBlockContent(block.Content, headings)
		sb.WriteString(fmt.Sprintf(`<aside class="mdx-block mdx-example"><span class="mdx-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg></span><div><strong>%s</strong><div>%s</div></div></aside>`, title, content))
		return nil, nil

	case "callout":
		title := "Важно"
		if t, ok := block.Attrs["title"].(string); ok && t != "" {
			title = html.EscapeString(t)
		}
		content := renderBlockContent(block.Content, headings)
		sb.WriteString(fmt.Sprintf(`<aside class="mdx-block mdx-callout"><span class="mdx-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg></span><div><strong>%s</strong><div>%s</div></div></aside>`, title, content))
		return nil, nil

	case "examTrap":
		content := renderBlockContent(block.Content, headings)
		sb.WriteString(fmt.Sprintf(`<aside class="mdx-block mdx-trap"><span class="mdx-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg></span><div><strong>Ловушка формулировки</strong><div>%s</div></div></aside>`, content))
		return nil, nil

	case "compareTable":
		renderTable(sb, block.Attrs)
		return nil, nil

	case "image":
		src := ""
		alt := ""
		if s, ok := block.Attrs["src"].(string); ok {
			src = html.EscapeString(s)
		}
		if a, ok := block.Attrs["alt"].(string); ok {
			alt = html.EscapeString(a)
		}
		sb.WriteString(fmt.Sprintf(`<img src="%s" alt="%s" />`, src, alt))
		return nil, nil

	case "bulletList":
		sb.WriteString("<ul>\n")
		for _, item := range block.Content {
			if item.Type == "listItem" {
				sb.WriteString("<li>")
				sb.WriteString(renderBlockContent(item.Content, headings))
				sb.WriteString("</li>\n")
			}
		}
		sb.WriteString("</ul>\n")
		return nil, nil

	case "orderedList":
		sb.WriteString("<ol>\n")
		for _, item := range block.Content {
			if item.Type == "listItem" {
				sb.WriteString("<li>")
				sb.WriteString(renderBlockContent(item.Content, headings))
				sb.WriteString("</li>\n")
			}
		}
		sb.WriteString("</ol>\n")
		return nil, nil

	default:
		// Treat unknown blocks as paragraphs for safety.
		text := renderInline(block.Content)
		if text != "" {
			sb.WriteString(fmt.Sprintf("<p>%s</p>\n", text))
		}
		return nil, nil
	}
}

func renderBlockContent(blocks []models.Block, headings *[]models.Heading) string {
	var sb strings.Builder
	for _, b := range blocks {
		renderBlock(&sb, b, headings)
	}
	return sb.String()
}

func renderInline(nodes []models.Block) string {
	if nodes == nil {
		return ""
	}
	var sb strings.Builder
	for _, node := range nodes {
		switch node.Type {
		case "text":
			text := html.EscapeString(node.Text)
			for _, mark := range node.Marks {
				switch mark.Type {
				case "bold":
					text = "<strong>" + text + "</strong>"
				case "italic":
					text = "<em>" + text + "</em>"
				case "strike":
					text = "<s>" + text + "</s>"
				case "code":
					text = "<code>" + text + "</code>"
				case "link":
					href := ""
					if h, ok := mark.Attrs["href"].(string); ok {
						href = html.EscapeString(h)
					}
					text = fmt.Sprintf(`<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>`, href, text)
				}
			}
			sb.WriteString(text)
		case "hardBreak":
			sb.WriteString("<br>")
		}
	}
	return sb.String()
}

func renderTable(sb *strings.Builder, props map[string]interface{}) {
	caption := ""
	if c, ok := props["caption"].(string); ok {
		caption = html.EscapeString(c)
	}
	columns := []string{}
	if cols, ok := props["columns"].([]interface{}); ok {
		for _, c := range cols {
			if s, ok := c.(string); ok {
				columns = append(columns, html.EscapeString(s))
			}
		}
	}
	rows := [][]string{}
	if rawRows, ok := props["rows"].([]interface{}); ok {
		for _, rawRow := range rawRows {
			if row, ok := rawRow.([]interface{}); ok {
				parsed := []string{}
				for _, cell := range row {
					if s, ok := cell.(string); ok {
						parsed = append(parsed, html.EscapeString(s))
					} else {
						parsed = append(parsed, "")
					}
				}
				rows = append(rows, parsed)
			}
		}
	}

	sb.WriteString(`<figure class="mdx-table-wrap">`)
	if caption != "" {
		sb.WriteString(fmt.Sprintf(`<figcaption>%s</figcaption>`, caption))
	}
	sb.WriteString("<table><thead><tr>")
	for _, col := range columns {
		sb.WriteString(fmt.Sprintf("<th>%s</th>", col))
	}
	sb.WriteString("</tr></thead><tbody>")
	for _, row := range rows {
		sb.WriteString("<tr>")
		for _, cell := range row {
			sb.WriteString(fmt.Sprintf("<td>%s</td>", cell))
		}
		sb.WriteString("</tr>")
	}
	sb.WriteString("</tbody></table></figure>")
}

func slugify(s string) string {
	s = strings.TrimSpace(s)
	var sb strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsNumber(r) || r == '-' || r == ' ' {
			sb.WriteRune(unicode.ToLower(r))
		} else if r == ' ' || r == '–' || r == '—' {
			sb.WriteRune(' ')
		}
	}
	s = strings.Join(strings.Fields(sb.String()), "-")
	s = strings.ToLower(s)
	return s
}
