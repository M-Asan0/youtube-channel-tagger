import type { Channel } from "../types";

export function extractChannelsFromYtInitialData(ytInitialData: any): Channel[] {
  const channelItems =
    ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content
      ?.expandedShelfContentsRenderer?.items ?? [];

  return channelItems
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
    .filter(Boolean) as Channel[];
}
