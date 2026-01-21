# System Architecture – IKAAD

## Overview

IKAAD follows a modular Retrieval-Augmented Generation (RAG) architecture designed for explainability, scalability, and evaluation.

## Core Components

- Frontend Web Interface
- Backend API (FastAPI)
- Document Ingestion & Processing Module
- Vector Database (FAISS / Chroma)
- LLM Generation Service
- Analytics & Evaluation Module

## High-Level Flow

1. User uploads documents
2. Documents are cleaned, parsed, and semantically chunked
3. Embeddings are generated and stored in vector database
4. User submits query
5. Relevant chunks are retrieved
6. LLM generates grounded response with citations
7. System evaluates confidence and grounding

## Design Principles

- Modular microservices
- Explainable AI responses
- Learning-oriented interaction
- Research-friendly evaluation
