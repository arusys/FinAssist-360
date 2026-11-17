from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.all_schemas import DashboardSummaryResponse, AnalyticsDashboardResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/dashboard", tags=["Intelligent Dashboard & Analytics"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_summary(db)

@router.get("/analytics", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_full_analytics(db)
