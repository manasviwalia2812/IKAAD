import { useEffect, useState } from "react";
import { deleteAllDocuments, deleteDocument, listDocuments, uploadPDFs } from "../api/api";

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState("");

  const refreshDocuments = async () => {
    setDocsError("");
    setDocsLoading(true);
    try {
      const res = await listDocuments();
      const docs = res?.status === "success" ? res?.data?.documents || [] : [];
      setDocuments(docs);
    } catch (e) {
      setDocsError(
        e.response?.data?.detail || e.message || "Failed to load document list."
      );
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, []);


  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert("Please select at least one file (PDF, DOCX, or PPTX)");
      return;
    }

    if (isUploading) return; // prevent double submit

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      setIsUploading(true);
      setStatus("Uploading and processing...");

      const response = await uploadPDFs(formData);

      // response IS already response.data
      console.log("✅ Backend response:", response);

      if (response.success) {
        setStatus(
          `Upload successful. ${response.documents_loaded} documents processed. You can now ask questions.`
        );
        refreshDocuments();
      } else {
        setStatus(
          `Upload failed on server: ${response.error || "Unknown error"}`
        );
      }
          } catch (error) {
      // ADD DETAILED LOGGING HERE
      console.error("❌ Error caught:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      setStatus(
        "Network or client error. Upload may or may not have completed. Please check backend logs."
      );
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div>
      <h2 style={{ margin: "0 0 6px" }}>Documents</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 14px", fontSize: "0.95rem" }}>
        Upload PDFs, PPTX, or DOCX. You can remove files anytime.
      </p>

      <input
        type="file"
        accept=".pdf,.docx,.pptx"
        multiple
        onChange={handleFileChange}
      />

      <br />
      <br />

      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Processing..." : "Upload documents"}
      </button>

      <p>{status}</p>

      <hr style={{ margin: "1.5rem 0" }} />

      <div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Uploaded documents</h3>
          <button type="button" onClick={refreshDocuments} disabled={docsLoading}>
            {docsLoading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={async () => {
              const ok = window.confirm(
                "Delete ALL uploaded documents and clear the model index? This cannot be undone."
              );
              if (!ok) return;
              try {
                await deleteAllDocuments();
                setStatus("All documents deleted and index cleared.");
                refreshDocuments();
              } catch (e) {
                setStatus(
                  `Failed to delete all documents: ${
                    e.response?.data?.detail || e.message
                  }`
                );
              }
            }}
            disabled={docsLoading || documents.length === 0}
          >
            Delete all
          </button>
        </div>

        {docsError && (
          <p style={{ color: "#e74c3c", marginTop: "0.5rem" }}>{docsError}</p>
        )}

        {documents.length === 0 && !docsLoading ? (
          <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>
            No documents uploaded yet.
          </p>
        ) : (
          <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
            {documents.map((doc) => (
              <li key={doc.name} style={{ marginBottom: "0.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ wordBreak: "break-word" }}>
                    {doc.name}{" "}
                    <span style={{ color: "var(--color-muted)", fontSize: "0.9em" }}>
                      ({Math.round((doc.size_bytes || 0) / 1024)} KB)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = window.confirm(
                        `Delete \"${doc.name}\" and rebuild the index?`
                      );
                      if (!ok) return;
                      try {
                        await deleteDocument(doc.name);
                        setStatus(`Deleted ${doc.name} and rebuilt index.`);
                        refreshDocuments();
                      } catch (e) {
                        setStatus(
                          `Failed to delete ${doc.name}: ${
                            e.response?.data?.detail || e.message
                          }`
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
