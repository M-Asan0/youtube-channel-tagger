export type Tag = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type Channel = {
  id: string;
  title: string;
  url: string;
  lastSeenAt: number;
};

export type AppData = {
  version: 1;
  tags: Record<string, Tag>;
  channels: Record<string, Channel>;
  channelTags: Record<string, string[]>;
};