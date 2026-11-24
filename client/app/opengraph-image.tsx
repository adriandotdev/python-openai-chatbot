import { ImageResponse } from "next/og";

export const alt = "Flâneur — a sample Paris travel chat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same palette as the light theme in chat.css.
const body = "#f1eee8";
const surface = "#fbfaf7";
const ink = "#0d1633";
const navy = "#14215a";
const brass = "#9a7b43";
const userBubble = "#e8e4db";
const rule = "rgba(13,22,51,0.1)";

// Google Fonts TTF; null if it can't be fetched, so the image still renders.
async function loadFont(family: string, weight: number, text?: string) {
  try {
    const q = text ? `&text=${encodeURIComponent(text)}` : "";
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}${q}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

const recents = [
  { t: "How do I get from CDG…", d: "From Charles de Gaulle, the…" },
  { t: "Where should I eat tonight…", d: "Les Nièmes is a chic, con…", on: true },
  { t: "Capital of France?", d: "Paris, of course, the City…" },
];

export default async function OpengraphImage() {
  const [serifData, sansData, sansBold] = await Promise.all([
    loadFont("Cormorant+Garamond", 600, "Flâneur"),
    loadFont("Instrument+Sans", 400),
    loadFont("Instrument+Sans", 600),
  ]);
  const serif = serifData ? "Cormorant" : "serif";
  const fonts = [
    serifData && { name: "Cormorant", data: serifData, weight: 600 as const, style: "normal" as const },
    sansData && { name: "Instrument", data: sansData, weight: 400 as const, style: "normal" as const },
    sansBold && { name: "Instrument", data: sansBold, weight: 600 as const, style: "normal" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Instrument", background: body, padding: "10px 10px 10px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 250, padding: "26px 14px", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", paddingLeft: 8, fontFamily: serif, fontSize: 44, fontWeight: 600, color: ink }}>
            Flâneur
            <div style={{ display: "flex", width: 9, height: 9, borderRadius: 5, background: brass, marginLeft: 3, marginBottom: 9 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", borderRadius: 24, background: navy, color: "#fff", fontSize: 21 }}>
            New chat
          </div>
          <div style={{ display: "flex", marginTop: 8, paddingLeft: 8, fontSize: 17, color: brass }}>Récents</div>
          {recents.map((r) => (
            <div
              key={r.t}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "9px 10px",
                borderRadius: 10,
                background: r.on ? "#e8e4db" : "transparent",
                borderLeft: r.on ? `3px solid ${brass}` : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", fontSize: 18, color: ink, whiteSpace: "nowrap", overflow: "hidden" }}>{r.t}</div>
              <div style={{ display: "flex", fontSize: 14, color: "#4a5172", whiteSpace: "nowrap", overflow: "hidden" }}>{r.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: surface, borderRadius: 28, padding: "36px 56px 28px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", padding: "14px 22px", borderRadius: "22px 22px 6px 22px", background: userBubble, fontSize: 23, color: ink }}>
                Where should I eat tonight in the Marais?
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 90 }}>
              <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: brass }}>Flâneur</div>
              <div style={{ display: "flex", fontSize: 23, lineHeight: 1.45, color: ink }}>
                The Marais offers delightful variety tonight. For classic bistro fare, try L’As du Fallafel on Rue des Rosiers, or Breizh Café for elevated Breton galettes. Reservations are highly recommended.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 84, padding: "16px 18px 12px 22px", borderRadius: 28, border: `1px solid ${rule}`, background: surface, fontSize: 21, color: navy }}>
            <div style={{ display: "flex" }}>Where to next in Paris?</div>
            <div style={{ display: "flex", width: 40, height: 40, borderRadius: 20, background: "#8f96bb", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              ↑
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
