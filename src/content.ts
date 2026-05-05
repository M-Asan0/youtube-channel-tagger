import { getAppData, setAppData } from "./storage";

function extractYtInitialDataFromHtml(): any | null {
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
async function syncSubscribedChannels() {
  const ytInitialData = extractYtInitialDataFromHtml();

  console.log("ytInitialData loaded", ytInitialData);

  if (!ytInitialData) {
    console.log("youtube-channel-tagger: ytInitialData not found");
    return;
  }

  const items =
    ytInitialData.contents
      ?.twoColumnBrowseResultsRenderer
      ?.tabs?.[0]
      ?.tabRenderer
      ?.content
      ?.sectionListRenderer
      ?.contents;

  const channels = items?.flatMap((section: any) =>
    section?.itemSectionRenderer?.contents?.flatMap((shelf: any) =>
      shelf?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items?.map((item: any) => {
        const ch = item?.channelRenderer;
        if (!ch) return null;

        return {
          id: ch.channelId,
          title: ch.title?.simpleText,
          url: `https://www.youtube.com/channel/${ch.channelId}`,
          lastSeenAt: Date.now(),
        };
      }) ?? []
    ) ?? []
  ).filter(Boolean);

  console.log("channels", channels);

  if (!channels || channels.length === 0) {
    console.log("youtube-channel-tagger: no subscribed channels found");
    return;
  }

  const data = await getAppData();

  for (const ch of channels) {
    data.channels[ch.id] = ch;
  }

  await setAppData(data);

  console.log(`youtube-channel-tagger: synced ${channels.length} channels`);
}

if (location.pathname === "/feed/channels") {
  syncSubscribedChannels();
}