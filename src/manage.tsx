import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getAppData, setAppData } from "./storage";
import type { AppData, Tag } from "./types";

type TagInputProps = {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

type Tab = "tags" | "channels";

function SelectedTags({
  allTags,
  selectedIds,
  onRemove,
}: {
  allTags: Tag[];
  selectedIds: string[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
      }}
    >
      {selectedIds.map((id) => {
        const tag = allTags.find((t) => t.id === id);
        if (!tag) return null;

        return (
          <span
            key={id}
            style={{
              background: tag.color,
              color: "#fff",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {tag.name}
            <button
              onClick={() => onRemove(id)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
}

function TagInput({ allTags, selectedIds, onChange }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const candidates = allTags.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIds.includes(t.id)
  );

  function select(id: string) {
    onChange([...selectedIds, id]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(id: string) {
    onChange(selectedIds.filter((s) => s !== id));
  }

  return (
    <div>
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          border: "1px solid #ccc",
          padding: 4,
          minWidth: 200,
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="タグを検索..."
          style={{ border: "none", outline: "none", minWidth: 100 }}
        />

        {open && candidates.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              listStyle: "none",
              margin: 0,
              padding: 0,
              zIndex: 10,
              width: "100%",
            }}
          >
            {candidates.map((t) => (
              <li
                key={t.id}
                onMouseDown={() => select(t.id)}
                style={{ padding: "4px 8px", cursor: "pointer" }}
                className="tag-candidate-item"
              >
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <SelectedTags
        allTags={allTags}
        selectedIds={selectedIds}
        onRemove={remove}
      />
    </div>
  );
}

function App() {
  const [appData, setAppDataState] = useState<AppData | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("channels");

  useEffect(() => {
    getAppData().then(setAppDataState);
  }, []);

  async function addTag() {
    const name = tagInput.trim();
    if (!name || !appData) return;

    const id = crypto.randomUUID();
    const order = Object.keys(appData.tags).length;

    const next = {
      ...appData,
      tags: {
        ...appData.tags,
        [id]: {
          id,
          name,
          color: "#999999",
          order,
        },
      },
    };

    await setAppData(next);
    setTagInput("");
    setAppDataState(next);
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
              activeTab === "channels" ? "2px solid #000" : "2px solid transparent",
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

      {activeTab === "tags" && (
        <section>
          <h2>Tags</h2>

          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグ名"
          />

          <button onClick={addTag}>追加</button>

          {tags.length === 0 ? (
            <p>タグがありません</p>
          ) : (
            <ul>
              {tags.map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
            </ul>
          )}
        </section>
      )}

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
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);