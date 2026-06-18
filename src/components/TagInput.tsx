import { useRef, useState } from "react";
import type { Tag } from "../types";
import { SelectedTags } from "./SelectedTags";

type TagInputProps = {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function TagInput({
  allTags,
  selectedIds,
  onChange,
}: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const candidates = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIds.includes(tag.id)
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
          placeholder="search the tag..."
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