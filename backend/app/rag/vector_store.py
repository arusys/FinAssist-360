import json
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.is_fitted = False
        self.chunk_records: List[Dict[str, Any]] = []
        self.tfidf_matrix = None

    def fit_and_index(self, chunks: List[Dict[str, Any]]) -> None:
        """Indexes a list of chunks, fitting the TF-IDF vectorizer and building the search matrix."""
        if not chunks:
            self.chunk_records = []
            self.is_fitted = False
            self.tfidf_matrix = None
            return

        self.chunk_records = chunks
        corpus = [c["content"] for c in chunks]
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.is_fitted = True

    def add_documents(self, chunks: List[Dict[str, Any]]) -> None:
        """Add new chunks and re-index the collection."""
        all_chunks = self.chunk_records + chunks
        self.fit_and_index(all_chunks)

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.08) -> List[Tuple[Dict[str, Any], float]]:
        """Perform semantic cosine similarity search for the given query."""
        if not self.is_fitted or not self.chunk_records or self.tfidf_matrix is None:
            return []

        # Transform query
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Rank by descending similarity
        ranked_indices = np.argsort(similarities)[::-1]
        
        results = []
        for idx in ranked_indices:
            score = float(similarities[idx])
            if score >= score_threshold:
                results.append((self.chunk_records[idx], round(score, 4)))
            if len(results) >= top_k:
                break
                
        return results

# Global singleton instance for knowledge retrieval
global_vector_store = VectorStore()
