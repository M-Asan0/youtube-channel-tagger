import { useEffect, useRef, useState } from "react";
import type { Tag } from "../types";

type TagRowProps = {
  tag: Tag;
  usedCount: number;
  onRename: (name: string) => void;
  onRecolor: (color: string) => void;
  onDelete: () => void;
};

const cellStyle = { padding: "4px 0", borderBottom: "1px solid #eee" };

export function TagRow({
  tag,
  usedCount,
  onRename,
  onRecolor,
  onDelete,
}: TagRowProps) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);

  const colorRef = useRef<HTMLInputElement>(null);
  const revertNameRef = useRef(false);
  const colorCommittedRef = useRef(false);

  // 保存済みの値が変わったら下書きを追従させる
  useEffect(() => setName(tag.name), [tag.name]);
  useEffect(() => setColor(tag.color), [tag.color]);

  function commitName() {
    const escaped = revertNameRef.current;
    revertNameRef.current = false;

    const next = name.trim();

    // Escape されておらず、空でもなく、実際に変わった時だけ保存する
    if (!escaped && next && next !== tag.name) {
      setName(next);
      onRename(next);
    } else {
      // それ以外（Escape・空欄・変更なし）は打ちかけを捨てて元に戻す
      setName(tag.name);
    }
  }

  // ドラッグ中に飛ぶのは input で、change はピッカーを閉じた時に1回だけ飛ぶ
  useEffect(() => {
    const el = colorRef.current;
    if (!el) return;

    const handleChange = () => {
      if (el.value === tag.color) return;

      colorCommittedRef.current = true;
      onRecolor(el.value);
    };

    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [tag.color, onRecolor]);

  // Escape で閉じた時は change が飛ばないので、表示だけ保存済みの色に戻す
  function syncColor() {
    if (colorCommittedRef.current) {
      colorCommittedRef.current = false;
      return;
    }

    setColor(tag.color);
  }

  return (
    <tr>
      <td style={cellStyle}>
        <input
          className="inline-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              revertNameRef.current = true;
              e.currentTarget.blur();
            }
          }}
        />
      </td>

      <td style={cellStyle}>
        <input
          ref={colorRef}
          type="color"
          className="inline-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          onBlur={syncColor}
        />
      </td>

      <td style={cellStyle}>{usedCount}</td>

      <td style={cellStyle}>
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  );
}
