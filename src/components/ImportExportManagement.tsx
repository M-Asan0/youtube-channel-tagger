import React from "react"
import type { AppData } from "../types";

type ImportExportManagementProps = {
  appData: AppData;
}

export function ImportExportManagement({ appData }: ImportExportManagementProps) {
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

  return (
    <section>
      <h2>Import</h2>
      <h2>Export</h2>
      <button
        onClick={() => handleExport()}
      >Export</button>
    </section>
  )
}
