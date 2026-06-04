import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const fileName = "NTE 在 TikTok 上的生态位分析（近3个月）.pdf";
    const filePath = path.join(process.cwd(), "app", "diagnosis", fileName);
    const data = await fs.readFile(filePath);

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response("File not found", { status: 404 });
  }
}
