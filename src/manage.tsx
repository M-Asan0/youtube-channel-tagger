import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { fetchAppData, saveAppData } from "./storage";
import type { AppData } from "./types";
import { ChannelTagInput } from "./components/ChannelTagInput";
import { TagManagement } from "./components/TagManagement";
import { ImportExportManagement } from "./components/ImportExportManagement"

type Tab = "tags" | "channels" | "importExport";

function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("channels");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchAppData().then(setAppData);
  }, []);

  async function syncChannels() {
    setSyncing(true);
    try {
      await chrome.runtime.sendMessage({ type: "syncChannelsRequest" });
      setAppData(await fetchAppData());
    } finally {
      setSyncing(false);
    }
  }

  async function updateChannelTags(channelId: string, tagIds: string[]) {
    if (!appData) return;

    const channelTags = { ...appData.channelTags };

    if (tagIds.length > 0) {
      channelTags[channelId] = tagIds;
    } else {
      delete channelTags[channelId];
    }

    const next = {
      ...appData,
      channelTags,
    };

    await saveAppData(next);
    setAppData(next);
  }

  if (!appData) return <p>Loading...</p>;

  const tags = Object.values(appData.tags).sort(
    (a, b) => a.order - b.order
  );

  const channels = Object.values(appData.channels);

  return (
    <div>
      <h1>YouTube Channel Tagger</h1>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ccc",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setActiveTab("channels")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderBottom:
              activeTab === "channels"
                ? "2px solid #000"
                : "2px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === "channels" ? "bold" : "normal",
          }}
        >
          Channels
        </button>

        <button
          onClick={() => setActiveTab("tags")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderBottom:
              activeTab === "tags" ? "2px solid #000" : "2px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === "tags" ? "bold" : "normal",
          }}
        >
          Tags
        </button>

        <button
          onClick={() => setActiveTab("importExport")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderBottom:
              activeTab === "importExport" ? "2px solid #000" : "2px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === "importExport" ? "bold" : "normal",
          }}
        >
          Import / Export
        </button>
      </div>

      {activeTab === "channels" && (
        <section>
          <div
            style={{
              display: "flex-col",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 8,
              borderBottom: "1px solid #eee",
            }}
          >
            <h2>Channels</h2>
            <button onClick={syncChannels} disabled={syncing}>
              {syncing ? "synchronization..." : "Sync subscribed channels"}
            </button>
          </div>

          {channels.length === 0 ? (
            <p>登録チャンネルがありません</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {channels.map((ch) => (
                <li
                  key={ch.id}
                  style={{
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{ch.title}</strong>
                  <br />

                  <ChannelTagInput
                    allTags={tags}
                    selectedIds={appData.channelTags[ch.id] ?? []}
                    onChange={(ids) => updateChannelTags(ch.id, ids)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab === "tags" && (
        <TagManagement
          tags={tags}
          appData={appData}
          setAppData={setAppData}
        />
      )}

      {activeTab === "importExport" && (
        <ImportExportManagement appData={appData} setAppData={setAppData} />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
