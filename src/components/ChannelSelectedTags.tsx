import { Fragment } from "react";
import type { Tag } from "../types";

type ChannelSelectedTagsProps = {
  allTags: Tag[];
  selectedIds: string[];
  onRemove: (id: string) => void;
};

export function ChannelSelectedTags({
  allTags,
  selectedIds,
  onRemove,
}: ChannelSelectedTagsProps) {
  return (
    <Fragment>
      {selectedIds.map((id) => {
        const tag = allTags.find((t) => t.id === id);
        if (!tag) return null;

        return (
          <span
            key={id}
            style={{
              border: "1px solid #ddd",
              borderBottom: `2px solid ${tag.color}`,
              borderRadius: 4,
              padding: "2px 4px 1px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {tag.name}
            <button
              onClick={() => onRemove(id)}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
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
    </Fragment>
  );
}