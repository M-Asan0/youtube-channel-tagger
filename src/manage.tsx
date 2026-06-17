import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getAppData, setAppData } from "./storage";
import type { AppData } from "./types";
import { TagInput } from "./components/TagInput";
import { TagManagement } from "./components/TagManagement";

type Tab = "tags" | "channels";

function App() {
  const [appData, setAppDataState] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("channels");

  useEffect(() => {
    getAppData().then(setAppDataState);
  }, []);

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

    await setAppData(next);
    setAppDataState(next);
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
      </div>

      {activeTab === "channels" && (
        <section>
          <h2>Channels</h2>

          {channels.length === 0 ? (
            <p>登録チャンネルがありません</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {channels.map((ch) => (
                <li key={ch.id} style={{ marginBottom: 8 }}>
                  <strong>{ch.title}</strong>
                  <br />

                  <TagInput
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
          setAppDataState={setAppDataState}
        />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);