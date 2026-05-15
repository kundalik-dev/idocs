import { permanentRedirect } from "next/navigation";

export default function PrivateMarkdownViewerRedirect() {
  permanentRedirect("/blogs/private-markdown-viewer");
}
