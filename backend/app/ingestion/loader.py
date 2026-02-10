from pathlib import Path
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document


def load_documents_from_directory(base_dir: str) -> List[Document]:
    """
    Load all PDF documents from a given directory (recursively).

    Args:
        base_dir (str): Path to the base directory containing PDFs.

    Returns:
        List[Document]: List of loaded LangChain Document objects.
    """

    base_path = Path(base_dir).resolve()
    documents: List[Document] = []

    if not base_path.exists():
        raise FileNotFoundError(f"Directory does not exist: {base_path}")

    pdf_files = list(base_path.glob("**/*.pdf"))

    for pdf_file in pdf_files:
        loader = PyPDFLoader(str(pdf_file))
        docs = loader.load()

        # attach source metadata
        for doc in docs:
            doc.metadata["source"] = str(pdf_file)

        documents.extend(docs)

    return documents
