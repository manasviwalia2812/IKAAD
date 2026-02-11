import { useState } from "react";
import { uploadPDFs } from "../api/api";

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);


  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert("Please select at least one PDF file");
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
    <div style={{ marginBottom: "2rem" }}>
      <h2>Upload Study Material</h2>

      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
      />

      <br />
      <br />

      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Processing..." : "Upload PDFs"}
      </button>


      <p>{status}</p>
    </div>
  );
}

export default UploadPage;
