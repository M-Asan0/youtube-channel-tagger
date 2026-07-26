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
      <div style={{ padding: "0 16px" }}>
        <h1>YouTube Channel Tagger</h1>

        <div style={{ display: "flex", marginBottom: 4 }}>
          <button
            onClick={() => setActiveTab("channels")}
            className={`tab-button${activeTab === "channels" ? " active" : ""}`}
            style={{ width: 110 }}
          >
            Channels
          </button>

          <button
            onClick={() => setActiveTab("tags")}
            className={`tab-button${activeTab === "tags" ? " active" : ""}`}
            style={{ width: 90 }}
          >
            Tags
          </button>

          <button
            onClick={() => setActiveTab("importExport")}
            className={`tab-button${activeTab === "importExport" ? " active" : ""}`}
            style={{ width: 160 }}
          >
            Import / Export
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          background: "#f2f2f2",
        }}
      >
        {activeTab === "channels" && (
          <section>
            <h2 style={{ marginTop: 0 }}>Channels</h2>

            <div className="panel">
              <button onClick={syncChannels} disabled={syncing} className="standalone-btn">
                {syncing ? "synchronization..." : "Sync subscribed channels"}
              </button>
            </div>

            <div className="panel">
              {channels.length === 0 ? (
                <p>登録チャンネルがありません</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
            </div>
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
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
