"use client";

import { isValidElement, ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { CodeBlock } from "@/components/viewer/code-block";

type CodeChild = ReactElement<{ className?: string; children?: ReactNode }>;

function isCodeElement(node: unknown): node is CodeChild {
  return isValidElement(node) && (node.type === "code" || (typeof node.type === "string" && node.type === "code"));
}

function getStringContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getStringContent).join("");
  if (isValidElement(children)) {
    const props = (children as ReactElement<{ children?: ReactNode }>).props;
    return getStringContent(props.children);
  }
  return "";
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <article className="markdown thin-scrollbar">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "prepend",
              properties: {
                className: ["heading-anchor"],
                "aria-label": "Link to section",
              },
              content: { type: "text", value: "#" },
            },
          ],
        ]}
        components={{
          pre({ children, ...props }) {
            const child = Array.isArray(children) ? children[0] : children;
            if (isCodeElement(child)) {
              const className = child.props.className ?? "";
              const match = /language-([\w-]+)/.exec(className);
              const code = getStringContent(child.props.children).replace(/\n$/, "");
              return <CodeBlock code={code} lang={match?.[1]} />;
            }
            return <pre {...props}>{children}</pre>;
          },
          a({ children, href, ...props }) {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ alt, src, ...props }) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img alt={alt ?? ""} src={src as string} {...props} />;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
