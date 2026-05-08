import { slug } from "github-slugger";
import { marked } from "marked";

// 配置marked选项，支持更丰富的Markdown功能
marked.use({
  mangle: false,
  headerIds: false, // 启用标题ID，便于目录跳转
  gfm: true, // 启用GitHub风格的Markdown
  breaks: true, // 支持换行符转换为<br>
  pedantic: false,
  // sanitize: false, // 已禁用，默认启用安全过滤
  smartLists: true,
  smartypants: false,
});

// 自定义渲染器，增强功能
const renderer = new marked.Renderer();

// HTML 实体编码函数，防止 XSS
function escapeHtml(text: string): string {
  const entityMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return String(text).replace(/[&<>"'`=/]/g, (s) => entityMap[s]);
}

// URL 安全验证函数
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// 自定义标题渲染，添加锚点ID
renderer.heading = function(text: string, level: number) {
  const escapedText = slug(text);
  const safeText = escapeHtml(text);
  return `<h${level} id="${escapedText}">
    <a href="#${escapedText}" class="anchor-link">${safeText}</a>
  </h${level}>`;
};

// 自定义代码块渲染，添加语言标识和复制按钮
renderer.code = function(code: string, language: string | undefined) {
  const validLang = language && language !== '' ? escapeHtml(language) : 'text';
  const safeCode = escapeHtml(code);
  return `<div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-language">${validLang}</span>
      <button class="copy-code-btn" onclick="copyCode(this)" title="复制代码">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>
    <pre><code class="language-${validLang}">${safeCode}</code></pre>
  </div>`;
};

// 自定义表格渲染，添加响应式样式
renderer.table = function(header: string, body: string) {
  return `<div class="table-wrapper">
    <table class="markdown-table">
      <thead>${header}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
};

// 自定义链接渲染，外部链接添加target="_blank"，并验证URL安全性
renderer.link = function(href: string, title: string | null, text: string) {
  const safeText = escapeHtml(text);
  const safeTitle = title ? ` title="${escapeHtml(title)}"` : '';

  // URL 安全验证
  let safeHref = href;
  if (!isValidUrl(href)) {
    safeHref = "#";
  }

  const isExternal = href.startsWith('http://') || href.startsWith('https://');
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${escapeHtml(safeHref)}"${safeTitle}${target}>${safeText}</a>`;
};

// 自定义图片渲染，添加懒加载和响应式
renderer.image = function(href: string, title: string | null, text: string) {
  const safeTitle = title ? ` title="${escapeHtml(title)}"` : '';
  const safeAlt = escapeHtml(text);
  const safeHref = isValidUrl(href) ? href : "";

  return `<figure class="markdown-image">
    <img src="${escapeHtml(safeHref)}" alt="${safeAlt}"${safeTitle} loading="lazy" decoding="async" class="responsive-image" />
    ${text ? `<figcaption>${safeAlt}</figcaption>` : ''}
  </figure>`;
};

// 自定义引用块渲染
renderer.blockquote = function(quote: string) {
  return `<blockquote class="markdown-blockquote">${quote}</blockquote>`;
};

marked.setOptions({ renderer });

// slugify
export const slugify = (content: string) => {
  if (!content) return '';
  return slug(content.toString());
};

// markdownify
export const markdownify = async (content: string, div?: boolean) => {
  const options = { renderer };
  return div ? marked.parse(content, options) : marked.parseInline(content, options);
};

// hyphen to space, uppercase only first letter in each word
export const upperHumanize = (content: string | undefined) => {
  if (!content) return '';
  return content
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase());
};

// hyphen to space, lowercase all letters
export const lowerHumanize = (content: string | undefined) => {
  if (!content) return '';
  return content
    .toLowerCase()
    .replace(/-/g, " ");
};

// plainify
export const plainify = (content: string) => {
  if (!content) return '';
  const parseMarkdown = marked.parse(content);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};
