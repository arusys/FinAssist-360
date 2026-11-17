from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.all_schemas import (
    BankingServiceSchema,
    ServiceDependencySchema,
    ServiceImpactAnalysisRequest,
    ServiceImpactAnalysisResponse
)
from app.services.banking_ops_service import BankingOperationsService

router = APIRouter(prefix="/services", tags=["Banking Operations & Dependency Intelligence"])

@router.get("", response_model=List[BankingServiceSchema])
def list_banking_services(db: Session = Depends(get_db)):
    services = BankingOperationsService.get_services(db)
    result = []
    for s in services:
        deps = [
            ServiceDependencySchema(
                id=d.id,
                target_service_id=d.target_service_id,
                target_service_name=d.target_service.name if d.target_service else None,
                dependency_type=d.dependency_type,
                criticality=d.criticality,
                description=d.description
            ) for d in s.dependencies
        ]
        result.append(BankingServiceSchema(
            id=s.id,
            name=s.name,
            code=s.code,
            category=s.category,
            description=s.description,
            status=s.status,
            availability=s.availability,
            current_incident_count=s.current_incident_count,
            affected_requests_count=s.affected_requests_count,
            sla_threshold=s.sla_threshold,
            dependencies=deps
        ))
    return result

@router.get("/graph")
def get_service_dependency_graph(db: Session = Depends(get_db)):
    """Visual dependency graph nodes and links for interactive topology rendering."""
    return BankingOperationsService.get_dependency_graph(db)

@router.get("/{id}", response_model=BankingServiceSchema)
def get_service_by_id(id: int, db: Session = Depends(get_db)):
    s = BankingOperationsService.get_service_by_id(db, id)
    if not s:
        raise HTTPException(status_code=404, detail="Banking service not found")
    deps = [
        ServiceDependencySchema(
            id=d.id,
            target_service_id=d.target_service_id,
            target_service_name=d.target_service.name if d.target_service else None,
            dependency_type=d.dependency_type,
            criticality=d.criticality,
            description=d.description
        ) for d in s.dependencies
    ]
    return BankingServiceSchema(
        id=s.id,
        name=s.name,
        code=s.code,
        category=s.category,
        description=s.description,
        status=s.status,
        availability=s.availability,
        current_incident_count=s.current_incident_count,
        affected_requests_count=s.affected_requests_count,
        sla_threshold=s.sla_threshold,
        dependencies=deps
    )

@router.post("/impact-analysis", response_model=ServiceImpactAnalysisResponse)
def analyze_cross_service_impact(
    req: ServiceImpactAnalysisRequest,
    db: Session = Depends(get_db)
):
    try:
        return BankingOperationsService.analyze_cross_service_impact(
            db, req.service_id, req.simulated_failure_state
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
