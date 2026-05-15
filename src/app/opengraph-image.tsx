import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt =
  "mDocks local-first Markdown reader for private files and GitHub repo docs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          color: "#0f172a",
          padding: "64px 72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "18px",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "42px",
                fontWeight: 800,
              }}
            >
              m
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "42px", fontWeight: 800 }}>mDocks</div>
              <div style={{ color: "#475569", fontSize: "24px" }}>
                Local Markdown reader
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid #cbd5e1",
              borderRadius: "999px",
              padding: "12px 18px",
              color: "#334155",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            No uploads
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "950px",
          }}
        >
          <div
            style={{
              fontSize: "74px",
              lineHeight: 1.05,
              fontWeight: 800,
            }}
          >
            Read local docs and GitHub repos privately.
          </div>
          <div
            style={{
              maxWidth: "860px",
              color: "#475569",
              fontSize: "31px",
              lineHeight: 1.35,
            }}
          >
            Open folders, Markdown files, and cloned repositories in a focused
            browser viewer with TOC, live reload, and syntax highlighting.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "14px",
          }}
        >
          {["Browser files", "Local server", "Offline friendly"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "14px 18px",
                color: "#334155",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
