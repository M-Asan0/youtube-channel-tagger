import React, { useState } from "react";
import { saveAppData } from "../storage";
import { TagRow } from "./TagRow";
import type { AppData, Tag } from "../types";

type TagManagementProps = {
  tags: Tag[];
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>;
};

const headerStyle = { textAlign: "left", borderBottom: "1px solid #ccc" } as const;

export function TagManagement({
  tags,
  appData,
  setAppData,
}: TagManagementProps) {
  const [tagInput, setTagInput] = useState("");
  const [colorInput, setColorInput] = useState("#999999");

  async function commitAppData(next: AppData) {
    await saveAppData(next);
    setAppData(next);
  }

  async function addTag() {
    const name = tagInput.trim();
    if (!name) return;

    const id = crypto.randomUUID();
    const order = Object.keys(appData.tags).length;

    const next = {
      ...appData,
      tags: {
        ...appData.tags,
        [id]: {
          id,
          name,
          color: colorInput,
          order,
        },
      },
    };

    await commitAppData(next);
    setTagInput("");
    setColorInput("#999999");
  }

  async function updateTag(tagId: string, patch: Partial<Tag>) {
    const next = {
      ...appData,
      tags: {
        ...appData.tags,
        [tagId]: {
          ...appData.tags[tagId],
          ...patch,
        },
      },
    };

    await commitAppData(next);
  }

  async function deleteTag(tagId: string) {
    const usedCount = getUsedCount(tagId);

    const ok = confirm(
      `このタグを削除しますか？\n${usedCount} 件のチャンネルからこのタグが外れます。`
    );

    if (!ok) return;

    const nextTags = { ...appData.tags };
    delete nextTags[tagId];

    const nextChannelTags = Object.fromEntries(
      Object.entries(appData.channelTags)
        .map(([channelId, tagIds]) => [
          channelId,
          tagIds.filter((id) => id !== tagId),
        ])
        .filter(([, tagIds]) => tagIds.length > 0)
    );

    const next = {
      ...appData,
      tags: nextTags,
      channelTags: nextChannelTags,
    };

    await commitAppData(next);
  }

  function getUsedCount(tagId: string) {
    return Object.values(appData.channelTags).filter((tagIds) =>
      tagIds.includes(tagId)
    ).length;
  }

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Tags</h2>

      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <label>New Tag Name</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag();
              }}
              placeholder="tag name"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <label>Color</label>
            <input
              type="color"
              className="inline-color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
            />
          </div>

          <button onClick={addTag}>Add</button>
        </div>
      </div>

      <div className="panel" style={{ maxHeight: "71vh", overflowY: "auto" }}>
        {tags.length === 0 ? (
          <p>No tags available</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={headerStyle}>Tag Name</th>
                <th style={{ ...headerStyle, width: 80 }}>Color</th>
                <th style={{ ...headerStyle, width: 130 }}>Channels Using</th>
                <th style={{ ...headerStyle, width: 90 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tags.map((tag) => (
                <TagRow
                  key={tag.id}
                  tag={tag}
                  usedCount={getUsedCount(tag.id)}
                  onRename={(name) => updateTag(tag.id, { name })}
                  onRecolor={(color) => updateTag(tag.id, { color })}
                  onDelete={() => deleteTag(tag.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
