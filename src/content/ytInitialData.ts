export function extractYtInitialDataFromHtml(): any | null {
  const html = document.documentElement.innerHTML;
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);

  if (start === -1) return null;

  const jsonStart = start + marker.length;
  const end = html.indexOf(";</script>", jsonStart);

  if (end === -1) return null;

  const jsonText = html.slice(jsonStart, end);

  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}