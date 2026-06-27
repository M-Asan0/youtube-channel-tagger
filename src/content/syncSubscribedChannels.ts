import { fetchAppData, saveAppData } from "../storage";
import { parseYtInitialData } from "./parseYtInitialData";
import { extractChannelsFromYtInitialData } from "./extractChannels";

export async function syncSubscribedChannels() {
  const ytInitialData = parseYtInitialData(document.documentElement.innerHTML);

  if (!ytInitialData) {
    console.log("youtube-channel-tagger: ytInitialData not found");
    return;
  }

  const channels = extractChannelsFromYtInitialData(ytInitialData);

  if (channels.length === 0) {
    console.log("youtube-channel-tagger: no subscribed channels found");
    return;
  }

  try {
    const data = await fetchAppData();

    for (const ch of channels) {
      data.channels[ch.id] = ch;
    }

    await saveAppData(data);

    console.log(`youtube-channel-tagger: synced ${channels.length} channels`);
  } catch {
    // Extension context may have been invalidated by a reload
  }
}