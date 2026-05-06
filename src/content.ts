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

  const data = await getAppData();

  for (const ch of channels) {
    data.channels[ch.id] = ch;
  }

  await setAppData(data);

  console.log(`youtube-channel-tagger: synced ${channels.length} channels`);
}

function addChannelTagsLink() {
  if (document.getElementById("yt-channel-tagger-link")) return;

  const sections = document.querySelector("ytd-guide-renderer #sections");
  if (!sections) return;

  const item = document.createElement("a");
  item.id = "yt-channel-tagger-link";
  item.href = chrome.runtime.getURL("manage.html");
  item.target = "_blank";
  item.textContent = "Channel Tags";

  item.style.display = "block";
  item.style.padding = "10px 24px";
  item.style.color = "var(--yt-spec-text-primary)";
  item.style.textDecoration = "none";
  item.style.fontSize = "14px";

  sections.appendChild(item);
}

function init() {
  addChannelTagsLink();

  setTimeout(addChannelTagsLink, 1000);
  setTimeout(addChannelTagsLink, 3000);

  if (location.pathname === "/feed/channels") {
    syncSubscribedChannels();
  }
}

init();