from fastapi import APIRouter
from app.api.auth_routes import router as auth_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.incident_routes import router as incident_router
from app.api.request_routes import router as request_router
from app.api.ai_routes import router as ai_router
from app.api.knowledge_routes import router as knowledge_router
from app.api.banking_routes import router as banking_router
from app.api.prediction_routes import router as prediction_router
from app.api.workflow_routes import router as workflow_router
from app.api.notification_routes import router as notification_router
from app.api.audit_routes import router as audit_router
from app.api.user_routes import router as user_router
from app.api.customer_routes import router as customer_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(incident_router)
api_router.include_router(request_router)
api_router.include_router(ai_router)
api_router.include_router(knowledge_router)
api_router.include_router(banking_router)
api_router.include_router(prediction_router)
api_router.include_router(workflow_router)
api_router.include_router(notification_router)
api_router.include_router(audit_router)
api_router.include_router(user_router)
api_router.include_router(customer_router)
