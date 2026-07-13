import { ImageResponse } from "next/og";

export const alt = "Kayumanggi — a Filipino culinary voyage through Tokyo, Paris and Rome, in BGC Manila";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cormorant Garamond (the site's display serif), static weight 500 as WOFF.
// Satori can't parse the variable-font build, so we use Fontsource's static file.
const FONT_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond@latest/files/cormorant-garamond-latin-500-normal.woff";

export default async function OpengraphImage() {
  const font = await fetch(FONT_URL).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#14100C",
          color: "#EFE7D8",
          fontFamily: "Cormorant",
          position: "relative",
        }}
      >
        {/* brass frame */}
        <div
          style={{
            position: "absolute",
            top: 34,
            left: 34,
            right: 34,
            bottom: 34,
            border: "1px solid rgba(199,154,84,0.42)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 9,
            color: "#C79A54",
          }}
        >
          14°35′N · 121°00′E · BONIFACIO GLOBAL CITY
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 118,
            letterSpacing: 16,
            marginTop: 18,
          }}
        >
          KAYUMANGGI
        </div>
        <div
          style={{
            width: 120,
            height: 1,
            background: "#C79A54",
            marginTop: 30,
            marginBottom: 30,
          }}
        />
        <div style={{ display: "flex", fontSize: 36, color: "#C9BCA6" }}>
          Filipino soul · a passport for the palate
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cormorant", data: font, weight: 500, style: "normal" }],
    },
  );
}
