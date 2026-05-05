import type { AppData } from "./types";

const STORAGE_KEY = "youtubeChannelTaggerData";

export const DEFAULT_DATA: AppData = {
  version: 1,
  tags: {},
  channels: {},
  channelTags: {},
};

export async function getAppData(): Promise<AppData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] as AppData ?? DEFAULT_DATA;
}

export async function setAppData(data: AppData): Promise<void> {
    await chrome.storage.local.set({
        [ STORAGE_KEY ]: data,
    })
}