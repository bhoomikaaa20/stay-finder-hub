import azure from "@/assets/hotel-azure.jpg";
import alpine from "@/assets/hotel-alpine.jpg";
import urban from "@/assets/hotel-urban.jpg";
import tropical from "@/assets/hotel-tropical.jpg";
import desert from "@/assets/hotel-desert.jpg";
import tuscan from "@/assets/hotel-tuscan.jpg";

// Maps DB image_url paths → bundled URLs.
// Falls back to the original URL if not found (e.g. uploaded images via Storage).
const map: Record<string, string> = {
  "/src/assets/hotel-azure.jpg": azure,
  "/src/assets/hotel-alpine.jpg": alpine,
  "/src/assets/hotel-urban.jpg": urban,
  "/src/assets/hotel-tropical.jpg": tropical,
  "/src/assets/hotel-desert.jpg": desert,
  "/src/assets/hotel-tuscan.jpg": tuscan,
};

export function resolveImage(url?: string | null): string {
  if (!url) return azure;
  return map[url] ?? url;
}
