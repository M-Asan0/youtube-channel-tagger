import React, { useState } from "react";
import type { AppData } from "../types";
import { saveAppData } from "../storage";

type ImportExportManagementProps = {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>;
}

function isAppData(data: unknown): data is AppData {
  if (typeof data !== "object" || data === null) return false

  const d = data as Record<string, unknown>

  return (
    d.version === 1
    && typeof d.tags === "object" && d.tags != null
    && typeof d.channels === "object" && d.channels != null
    && typeof d.channelTags === "object" && d.channelTags != null
  )
}

export function ImportExportManagement({ appData, setAppData }: ImportExportManagementProps) {
  const [file, setFile] = useState<File | null>(null)

  const fileName = "youtube-channel-tagger"
  const fileNameWithJson = `${fileName}.json`

  function handleExport() {
    const blobData = new Blob([JSON.stringify(appData)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blobData)
    const a = document.createElement("a")
    a.href = url
    a.download = fileNameWithJson
    a.click()

    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File) {
    const json = JSON.parse(await file.text())
    if (isAppData(json) === false) {
      alert("Invalid file format. Import cancelled.")
      return
    }
    if (!window.confirm("This will overwrite the existing data. Is that okay?")) return

    await saveAppData(json)
    setAppData(json)
  }

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Export</h2>
      <div className="panel">
        <button
          className="standalone-btn"
          onClick={() => handleExport()}
        >Export</button>
      </div>

      <h2 style={{ marginTop: 24 }}>Import</h2>
      <div className="panel">
        <input
          type="file"
          accept="application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        ></input>
        <button
          className="standalone-btn"
          disabled={!file}
          onClick={() => {
            if (!file) return;
            handleImport(file)
          }}
        >
          Import
        </button>
      </div>
    </section >
  )
}
