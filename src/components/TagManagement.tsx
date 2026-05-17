import React, { useState } from "react";
import { setAppData } from "../storage";
import type { AppData, Tag } from "../types";

type TagManagementProps = {
  tags: Tag[];
  appData: AppData;
  setAppDataState: React.Dispatch<React.SetStateAction<AppData | null>>;
};

export function TagManagement({
  tags,
  appData,
  setAppDataState,
}: TagManagementProps) {
  const [tagInput, setTagInput] = useState("");
  const [colorInput, setColorInput] = useState("#999999");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  async function saveAppData(next: AppData) {
    await setAppData(next);
    setAppDataState(next);
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

    await saveAppData(next);
    setTagInput("");
    setColorInput("#999999");
  }

  async function updateTag() {
    if (!editingTag) return;

    const name = editingTag.name.trim();
    if (!name) return;

    const next = {
      ...appData,
      tags: {
        ...appData.tags,
        [editingTag.id]: {
          ...appData.tags[editingTag.id],
          name,
          color: editingTag.color,
        },
      },
    };

    await saveAppData(next);
    setEditingTag(null);
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

    await saveAppData(next);
  }

  function getUsedCount(tagId: string) {
    return Object.values(appData.channelTags).filter((tagIds) =>
      tagIds.includes(tagId)
    ).length;
  }

  return (
    <section>
      <h2>Tags</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label>New Tag Name</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="tag name"
        />

        <label>Color</label>
        <input
          value={colorInput}
          onChange={(e) => setColorInput(e.target.value)}
          placeholder="#999999"
        />

        <span
          style={{
            display: "inline-block",
            width: 20,
            height: 20,
            background: colorInput,
            border: "1px solid #ccc",
          }}
        />

        <button onClick={addTag}>Add</button>
      </div>

      <h3>Tag List</h3>

      {tags.length === 0 ? (
        <p>No tags available</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Tag Name
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Color
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Channels Using
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td style={{ padding: "8px 0" }}>{tag.name}</td>

                <td style={{ padding: "8px 0" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      background: tag.color,
                      border: "1px solid #ccc",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  {tag.color}
                </td>

                <td style={{ padding: "8px 0" }}>{getUsedCount(tag.id)}</td>

                <td style={{ padding: "8px 0" }}>
                  <button onClick={() => setEditingTag(tag)}>Edit</button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingTag && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              minWidth: 320,
            }}
          >
            <h3>タグを編集</h3>

            <div>
              <label>タグ名</label>
              <br />
              <input
                value={editingTag.name}
                onChange={(e) =>
                  setEditingTag({
                    ...editingTag,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label>色</label>
              <br />
              <input
                value={editingTag.color}
                onChange={(e) =>
                  setEditingTag({
                    ...editingTag,
                    color: e.target.value,
                  })
                }
              />

              <span
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  background: editingTag.color,
                  border: "1px solid #ccc",
                  marginLeft: 8,
                  verticalAlign: "middle",
                }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={updateTag}>保存</button>
              <button
                onClick={() => setEditingTag(null)}
                style={{ marginLeft: 8 }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}