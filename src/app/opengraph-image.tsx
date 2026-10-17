import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI-Powered Project Management Course";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left side: Text */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", padding: "8px 20px", fontSize: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ★ Complete Course Curriculum
            </div>
          </div>
          <h1 style={{ fontSize: 72, fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            AI-Powered Project Management
          </h1>
          <p style={{ fontSize: 28, color: "#dbe2f7", margin: 0, lineHeight: 1.4 }}>
            From planning to reporting — learn to use AI in your PM workflows. 18 modules, quizzes, and a certificate.
          </p>
          <div style={{ marginTop: "40px", display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.1)", padding: "16px 32px", borderRadius: "12px", width: "fit-content" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Enroll Now →</span>
          </div>
        </div>

        {/* Right side: Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://ai-pm-course-liart.vercel.app/course-logo.png"
            alt="Logo"
            style={{ width: 280, height: 280, borderRadius: "24px", objectFit: "cover" }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 32, fontWeight: 700, fontStyle: "italic" }}>Dr. Raid Hamawi</span>
            <span style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: "0.2em", color: "#c3cbe8" }}>Artificial Intelligence</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}