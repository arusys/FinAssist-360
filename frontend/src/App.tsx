import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AIServiceDesk } from './pages/AIServiceDesk';
import { IncidentManagement } from './pages/IncidentManagement';
import { IncidentDetail } from './pages/IncidentDetail';
import { ServiceRequests } from './pages/ServiceRequests';
import { AIAgentCenter } from './pages/AIAgentCenter';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { BankingOperations } from './pages/BankingOperations';
import { PredictiveIntelligence } from './pages/PredictiveIntelligence';
import { WorkflowManagement } from './pages/WorkflowManagement';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { AuditLogs } from './pages/AuditLogs';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RaiseComplaint } from './pages/RaiseComplaint';
import { MyComplaints } from './pages/MyComplaints';
import { CustomerServiceRequests } from './pages/CustomerServiceRequests';
import { AIBankingAssistant } from './pages/AIBankingAssistant';
import { BankingServiceStatus } from './pages/BankingServiceStatus';
import { CustomerNotifications } from './pages/CustomerNotifications';
import { CustomerProfile } from './pages/CustomerProfile';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="service-desk" element={<AIServiceDesk />} />
            <Route path="incidents" element={<IncidentManagement />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="requests" element={<ServiceRequests />} />
            <Route path="agents" element={<AIAgentCenter />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="operations" element={<BankingOperations />} />
            <Route path="predictions" element={<PredictiveIntelligence />} />
            <Route path="workflows" element={<WorkflowManagement />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />

            {/* Customer Portal Routes */}
            <Route path="raise-complaint" element={<RaiseComplaint />} />
            <Route path="my-complaints" element={<MyComplaints />} />
            <Route path="service-requests" element={<CustomerServiceRequests />} />
            <Route path="ai-assistant" element={<AIBankingAssistant />} />
            <Route path="service-status" element={<BankingServiceStatus />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
