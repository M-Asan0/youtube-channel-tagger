import React from "react";
import type { Tag } from "../types";

type TagEditModalProps = {
  editingTag: Tag;
  setEditingTag: React.Dispatch<React.SetStateAction<Tag | null>>;
  updateTag: () => void;
};

export function TagEditModal({ editingTag, setEditingTag, updateTag }: TagEditModalProps) {
  return (
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
        <h3>Edit Tag</h3>

        <div>
          <label>Tag Name</label>
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
          <label>Color</label>
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
          <button onClick={updateTag}>Save</button>
          <button
            onClick={() => setEditingTag(null)}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
