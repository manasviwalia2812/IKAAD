import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

/*
----------------------------------------
UPLOAD ROUTE
----------------------------------------
*/
export const uploadPDFs = async (formData) => {
  const response = await api.post("/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 0, // allow long-running ingestion
  });

  return response.data;
};

/*
----------------------------------------
QUERY ROUTE
----------------------------------------
*/
export const askQuestion = async (question, level = "intermediate") => {
  const response = await api.post("/query/", {
    question,
    level: level || "intermediate",
  });
  return response.data;
};

/*
----------------------------------------
SUMMARIZE ROUTE
----------------------------------------
*/
export const summarizeDocuments = async () => {
  const response = await api.post("/summarize/", {}, { timeout: 0 });
  return response.data;
};

/*
----------------------------------------
DOCUMENTS ROUTES
----------------------------------------
*/
export const listDocuments = async () => {
  const response = await api.get("/documents/");
  return response.data;
};

export const deleteDocument = async (filename) => {
  const response = await api.delete(`/documents/${encodeURIComponent(filename)}`);
  return response.data;
};

export const deleteAllDocuments = async () => {
  const response = await api.delete("/documents/");
  return response.data;
};

export default api;
