import { fetchAppData, saveAppData } from "../storage";
import { parseYtInitialData } from "./parseYtInitialData";

export async function syncSubscribedChannels() {
  const ytInitialData = parseYtInitialData();

  if (!ytInitialData) {
    console.log("youtube-channel-tagger: ytInitialData not found");
    return;
  }

  const channelItems =
    ytInitialData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content
      ?.expandedShelfContentsRenderer?.items ?? [];

  const channels = channelItems
    .map((item: any) => {
      const ch = item?.channelRenderer;
      if (!ch) return null;

      return {
        id: ch.channelId,
        title: ch.title?.simpleText,
        url: `https://www.youtube.com/channel/${ch.channelId}`,
        lastSeenAt: Date.now(),
      };
    })
    .filter(Boolean);

  if (!channels || channels.length === 0) {
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