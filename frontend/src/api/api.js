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
QUERY ROUTE (for chat UI later)
----------------------------------------
*/
export const askQuestion = async (question) => {
  const response = await api.post("/query/", {
    question: question,
  });

  return response.data;
};

export default api;
