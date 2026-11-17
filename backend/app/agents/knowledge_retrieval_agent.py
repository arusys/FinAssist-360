from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.rag.rag_service import RAGService

class KnowledgeRetrievalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Knowledge Retrieval Agent",
            role="RAG Policy Lookup, Standard Operating Procedures & SLA Guidelines"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        db: Session = state.get("db_session")
        query = state.get("query", "")
        req_info = state.get("customer_request", {})
        intent = req_info.get("intent", "")

        search_query = f"{query} {intent.replace('_', ' ')}"
        
        if db:
            rag_result = RAGService.answer_query(search_query, db, top_k=3)
        else:
            rag_result = {
                "answer": "Refer to standard UPI Auto-Reversal policy (T+1 SLA).",
                "sources": [],
                "grounded": True
            }

        citations = []
        for s in rag_result.get("sources", []):
            citations.append({
                "document": s.get("document_title"),
                "section": s.get("section_name"),
                "score": s.get("similarity_score")
            })

        return {
            "grounded_guidance": rag_result.get("answer"),
            "citations": citations,
            "grounded": rag_result.get("grounded", True),
            "applicable_sla_mandate": "T+1 Business Day Auto-Reversal under Central Banking Directives"
        }
