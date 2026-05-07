import { ImageResponse } from "next/og";

export const alt = "iDocs local Markdown reader";
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
          justifyContent: "center",
          background: "#ffffff",
          color: "#111111",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background: "#111111",
              color: "#ffffff",
              fontSize: "42px",
              fontWeight: 800,
            }}
          >
            i
          </div>
          <div style={{ fontSize: "40px", fontWeight: 800 }}>iDocs</div>
        </div>
        <div
          style={{
            maxWidth: "900px",
            fontSize: "76px",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          Private local Markdown reader
        </div>
        <div
          style={{
            maxWidth: "850px",
            marginTop: "28px",
            color: "#555555",
            fontSize: "32px",
            lineHeight: 1.35,
          }}
        >
          Open folders and files directly from your machine with a clean reading view.
        </div>
      </div>
    ),
    size
  );
}
