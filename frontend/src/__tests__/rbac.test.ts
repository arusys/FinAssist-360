import { describe, it, expect } from 'vitest';
import {
  hasModuleAccess,
  canApproveWorkflows,
  canManageUsers,
  canAssignIncidents,
  canResolveIncidents,
  normalizeRole,
  getRoleTheme,
  isCustomerUser
} from '../utils/rbac';

describe('Role-Based Access Control (RBAC) System', () => {
  describe('normalizeRole', () => {
    it('normalizes legacy or aliased roles correctly', () => {
      expect(normalizeRole('Admin')).toBe('Super Admin');
      expect(normalizeRole('Service Manager')).toBe('Banking Operations Manager');
      expect(normalizeRole('Banking Support Agent')).toBe('Service Desk Agent');
      expect(normalizeRole('Technical Support Engineer')).toBe('Technical Support Engineer');
      expect(normalizeRole('Operations Analyst')).toBe('Operations Analyst');
      expect(normalizeRole('Customer')).toBe('User');
      expect(normalizeRole('User')).toBe('User');
    });
  });

  describe('Super Admin Permissions', () => {
    const role = 'Super Admin';
    it('has full access to all system modules', () => {
      expect(hasModuleAccess(role, '/')).toBe(true);
      expect(hasModuleAccess(role, '/service-desk')).toBe(true);
      expect(hasModuleAccess(role, '/incidents')).toBe(true);
      expect(hasModuleAccess(role, '/requests')).toBe(true);
      expect(hasModuleAccess(role, '/agents')).toBe(true);
      expect(hasModuleAccess(role, '/knowledge')).toBe(true);
      expect(hasModuleAccess(role, '/operations')).toBe(true);
      expect(hasModuleAccess(role, '/predictions')).toBe(true);
      expect(hasModuleAccess(role, '/workflows')).toBe(true);
      expect(hasModuleAccess(role, '/analytics')).toBe(true);
      expect(hasModuleAccess(role, '/audit-logs')).toBe(true);
      expect(hasModuleAccess(role, '/users')).toBe(true);
      expect(hasModuleAccess(role, '/settings')).toBe(true);
    });

    it('can manage users and assign/resolve incidents and approve workflows', () => {
      expect(canManageUsers(role)).toBe(true);
      expect(canApproveWorkflows(role)).toBe(true);
      expect(canAssignIncidents(role)).toBe(true);
      expect(canResolveIncidents(role)).toBe(true);
    });
  });

  describe('Service Desk Agent Permissions', () => {
    const role = 'Service Desk Agent';
    it('has frontline service desk and incident access', () => {
      expect(hasModuleAccess(role, '/service-desk')).toBe(true);
      expect(hasModuleAccess(role, '/incidents')).toBe(true);
      expect(hasModuleAccess(role, '/requests')).toBe(true);
      expect(hasModuleAccess(role, '/agents')).toBe(true);
      expect(hasModuleAccess(role, '/knowledge')).toBe(true);
    });

    it('does NOT have access to user management or system settings', () => {
      expect(hasModuleAccess(role, '/users')).toBe(false);
      expect(hasModuleAccess(role, '/settings')).toBe(false);
      expect(canManageUsers(role)).toBe(false);
      expect(canApproveWorkflows(role)).toBe(false);
    });

    it('can assign incidents but cannot directly close without technical verification', () => {
      expect(canAssignIncidents(role)).toBe(true);
      expect(canResolveIncidents(role)).toBe(false);
    });
  });

  describe('Banking Operations Manager Permissions', () => {
    const role = 'Banking Operations Manager';
    it('has operations, incident monitoring, and workflow approval permissions', () => {
      expect(hasModuleAccess(role, '/operations')).toBe(true);
      expect(hasModuleAccess(role, '/workflows')).toBe(true);
      expect(hasModuleAccess(role, '/analytics')).toBe(true);
      expect(canApproveWorkflows(role)).toBe(true);
      expect(canAssignIncidents(role)).toBe(true);
      expect(canResolveIncidents(role)).toBe(true);
    });

    it('does NOT have Super Admin user account provisioning access', () => {
      expect(hasModuleAccess(role, '/users')).toBe(false);
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('Technical Support Engineer Permissions', () => {
    const role = 'Technical Support Engineer';
    it('has incident investigation, diagnostics, and resolution permissions', () => {
      expect(hasModuleAccess(role, '/incidents')).toBe(true);
      expect(hasModuleAccess(role, '/knowledge')).toBe(true);
      expect(canResolveIncidents(role)).toBe(true);
    });

    it('does NOT have workflow approval or user management privileges', () => {
      expect(canApproveWorkflows(role)).toBe(false);
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('Operations Analyst Permissions', () => {
    const role = 'Operations Analyst';
    it('has telemetry, ML predictions, and audit log access', () => {
      expect(hasModuleAccess(role, '/predictions')).toBe(true);
      expect(hasModuleAccess(role, '/analytics')).toBe(true);
      expect(hasModuleAccess(role, '/audit-logs')).toBe(true);
      expect(hasModuleAccess(role, '/knowledge')).toBe(true);
    });

    it('does NOT have frontline incident alteration or approval access', () => {
      expect(canApproveWorkflows(role)).toBe(false);
      expect(canManageUsers(role)).toBe(false);
      expect(canResolveIncidents(role)).toBe(false);
    });
  });

  describe('Customer / User Role Permissions', () => {
    const role = 'User';
    it('is recognized as customer user', () => {
      expect(isCustomerUser(role)).toBe(true);
      expect(isCustomerUser('Customer')).toBe(true);
      expect(isCustomerUser('Super Admin')).toBe(false);
    });

    it('has access only to customer self-service modules', () => {
      expect(hasModuleAccess(role, '/')).toBe(true);
      expect(hasModuleAccess(role, '/raise-complaint')).toBe(true);
      expect(hasModuleAccess(role, '/my-complaints')).toBe(true);
      expect(hasModuleAccess(role, '/service-requests')).toBe(true);
      expect(hasModuleAccess(role, '/ai-assistant')).toBe(true);
      expect(hasModuleAccess(role, '/service-status')).toBe(true);
      expect(hasModuleAccess(role, '/notifications')).toBe(true);
      expect(hasModuleAccess(role, '/profile')).toBe(true);
    });

    it('is strictly blocked from internal enterprise operations and admin modules', () => {
      expect(hasModuleAccess(role, '/users')).toBe(false);
      expect(hasModuleAccess(role, '/settings')).toBe(false);
      expect(hasModuleAccess(role, '/workflows')).toBe(false);
      expect(hasModuleAccess(role, '/audit-logs')).toBe(false);
      expect(hasModuleAccess(role, '/analytics')).toBe(false);
      expect(hasModuleAccess(role, '/predictions')).toBe(false);
      expect(hasModuleAccess(role, '/agents')).toBe(false);
    });

    it('cannot manage users, approve workflows, assign incidents, or resolve incidents', () => {
      expect(canManageUsers(role)).toBe(false);
      expect(canApproveWorkflows(role)).toBe(false);
      expect(canAssignIncidents(role)).toBe(false);
      expect(canResolveIncidents(role)).toBe(false);
    });
  });

  describe('Role Themes and Badges', () => {
    it('provides distinctive visual badges for all roles including User', () => {
      expect(getRoleTheme('Super Admin').tag).toBe('Full Governance');
      expect(getRoleTheme('Banking Operations Manager').tag).toBe('Service & Approvals');
      expect(getRoleTheme('Service Desk Agent').tag).toBe('Customer Frontline');
      expect(getRoleTheme('Technical Support Engineer').tag).toBe('Diagnostic & Resolution');
      expect(getRoleTheme('Operations Analyst').tag).toBe('Telemetry & ML');
      expect(getRoleTheme('User').tag).toBe('Customer Portal');
    });
  });
});
