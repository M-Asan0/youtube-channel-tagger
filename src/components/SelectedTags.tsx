import type { Tag } from "../types";

type SelectedTagsProps = {
  allTags: Tag[];
  selectedIds: string[];
  onRemove: (id: string) => void;
};

export function SelectedTags({
  allTags,
  selectedIds,
  onRemove,
}: SelectedTagsProps) {
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