from typing import List, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_documents(
    documents: List[Any],
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[Any]:
    """
    Split documents into semantically meaningful chunks.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = splitter.split_documents(documents)
    return chunks
