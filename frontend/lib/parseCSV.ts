export default function parseCSV(
  text: string
): Record<string, string | number>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      const trimmed = (values[i] ?? "").trim();
      obj[h.trim()] =
        trimmed !== "" && !isNaN(Number(trimmed))
          ? parseFloat(trimmed)
          : trimmed;
    });
    return obj;
  });
}
