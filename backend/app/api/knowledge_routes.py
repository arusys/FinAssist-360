from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import (
    KnowledgeDocResponse,
    KnowledgeSearchQuery,
    KnowledgeSearchResponse,
    KnowledgeChunkResult
)
from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.rag.document_processor import DocumentProcessor
from app.rag.rag_service import RAGService
from app.rag.vector_store import global_vector_store
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter(prefix="/knowledge", tags=["RAG Knowledge Base"])

@router.get("/documents", response_model=List[KnowledgeDocResponse])
def list_knowledge_documents(db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return docs

@router.post("/search", response_model=KnowledgeSearchResponse)
def search_knowledge_base(
    req: KnowledgeSearchQuery,
    db: Session = Depends(get_db)
):
    res = RAGService.answer_query(req.query, db, top_k=req.top_k)
    sources = [
        KnowledgeChunkResult(
            document_id=s.get("document_id", 0),
            document_title=s.get("document_title", ""),
            category=s.get("category", ""),
            section_name=s.get("section_name"),
            content=s.get("content", ""),
            similarity_score=s.get("similarity_score", 0.0)
        ) for s in res.get("sources", [])
    ]
    return KnowledgeSearchResponse(
        query=res["query"],
        answer=res["answer"],
        sources=sources,
        grounded=res["grounded"]
    )

@router.post("/upload", response_model=KnowledgeDocResponse)
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    filename = file.filename or "uploaded_doc.txt"
    file_type = filename.split(".")[-1].lower() if "." in filename else "txt"
    
    text = DocumentProcessor.extract_text(contents, filename)
    chunks = DocumentProcessor.chunk_document(text)

    new_doc = KnowledgeDocument(
        title=title,
        category=category,
        filename=filename,
        file_type=file_type,
        file_size_bytes=len(contents),
        total_chunks=len(chunks),
        uploaded_by=current_user.full_name
    )
    db.add(new_doc)
    db.flush()

    for idx, c in enumerate(chunks):
        doc_chunk = DocumentChunk(
            document_id=new_doc.id,
            chunk_index=idx,
            content=c["content"],
            section_name=c.get("section_name", "General")
        )
        db.add(doc_chunk)

    audit = AuditLog(
        username=current_user.username,
        user_role=current_user.role.value,
        action="KNOWLEDGE_DOC_UPLOADED",
        entity_type="KnowledgeDocument",
        entity_id=str(new_doc.id),
        details=f"Uploaded '{title}' ({len(chunks)} chunks)"
    )
    db.add(audit)

    db.commit()
    db.refresh(new_doc)

    # Reload vector index
    RAGService.reload_index_from_db(db)

    return new_doc

@router.delete("/documents/{id}")
def delete_document(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    RAGService.reload_index_from_db(db)
    return {"message": f"Document '{doc.title}' deleted successfully"}
