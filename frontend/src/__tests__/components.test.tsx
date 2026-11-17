import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge';
import { MetricsCard } from '../components/MetricsCard';
import { AgentPipelineViewer } from '../components/AgentPipelineViewer';
import { AlertTriangle } from 'lucide-react';

describe('StatusBadge Component', () => {
  it('renders critical priority badge correctly', () => {
    render(<StatusBadge status="P1 – Critical" type="priority" />);
    expect(screen.getByText('P1 – Critical')).toBeInTheDocument();
  });

  it('renders operational status badge correctly', () => {
    render(<StatusBadge status="Operational" />);
    expect(screen.getByText('Operational')).toBeInTheDocument();
  });
});

describe('MetricsCard Component', () => {
  it('renders title and metric value', () => {
    render(
      <MetricsCard
        title="Open Incidents"
        value={14}
        subtext="Active cases"
        icon={AlertTriangle}
        variant="warning"
      />
    );
    expect(screen.getByText('Open Incidents')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Active cases')).toBeInTheDocument();
  });
});

describe('AgentPipelineViewer Component', () => {
  it('renders multi-agent step trace properly', () => {
    const mockSteps = [
      {
        step_order: 1,
        agent_name: 'Customer Request Understanding Agent',
        agent_role: 'Intent Classification',
        status: 'SUCCESS',
        input_summary: 'Customer natural language query',
        output_data: { intent: 'PAYMENT_FAILURE' },
        execution_time_ms: 12.4
      },
      {
        step_order: 2,
        agent_name: 'Incident Classification Agent',
        agent_role: 'Severity Assessment',
        status: 'SUCCESS',
        input_summary: 'Routing rules',
        output_data: { priority: 'P2 – High' },
        execution_time_ms: 8.1
      }
    ];

    render(<AgentPipelineViewer steps={mockSteps} totalDurationMs={20.5} />);
    expect(screen.getByText('Customer Request Understanding Agent')).toBeInTheDocument();
    expect(screen.getByText('Incident Classification Agent')).toBeInTheDocument();
    expect(screen.getByText(/2 Specialized Agents/)).toBeInTheDocument();
  });
});
