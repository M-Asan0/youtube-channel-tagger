import { parseYtInitialData } from "./content/parseYtInitialData";
import { extractChannelsFromYtInitialData } from "./content/extractChannels";
import { fetchAppData, saveAppData } from "./storage";

const SYNC_TIMEOUT_MS = 10000;

async function syncChannels(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const response = await fetch("https://www.youtube.com/feed/channels", {
      signal: controller.signal,
    });
    const html = await response.text();
    const ytInitialData = parseYtInitialData(html);

    if (!ytInitialData) return false;

    const channels = extractChannelsFromYtInitialData(ytInitialData);
    if (channels.length === 0) return false;

    const data = await fetchAppData();
    for (const ch of channels) {
      data.channels[ch.id] = ch;
    }
    await saveAppData(data);

    return true;
  } finally {
    clearTimeout(timer);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "syncChannelsRequest") return;

  syncChannels()
    .then((ok) => sendResponse({ ok }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});
