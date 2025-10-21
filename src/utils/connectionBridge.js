// Connection bridge to launch control app or demo data
export const createConnectionBridge = () => {
  // Try to connect to launch control app (if running locally)
  const attemptConnection = async () => {
    try {
      // Try to fetch from launch control app if it's running
      const response = await fetch('http://localhost:5173/api/project-data', {
        mode: 'cors'
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Launch control app not running, using localStorage or demo data');
    }
    
    // Fallback to localStorage
    try {
      const savedData = localStorage.getItem('ai-school-project-data');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.log('No localStorage data found, using demo data');
    }
    
    // Return demo data
    return getDemoLaunchControlData();
  };

  return { attemptConnection };
};

// Demo data for when launch control app is not available
export const getDemoLaunchControlData = () => ({
  workstreams: [
    {
      id: 'funding',
      name: 'Funding & Finance',
      color: '#10B981',
      lead: 'Raphael Ruiz',
      status: 'active',
      tasks: [
        { id: 'f1', title: 'Finalize investor pitch deck', status: 'in-progress', priority: 'critical', progress: 75, dueDate: '2025-08-30' },
        { id: 'f2', title: 'Series A roadshow', status: 'not-started', priority: 'critical', progress: 0, dueDate: '2025-10-15' },
        { id: 'f3', title: 'Close R$20M funding', status: 'not-started', priority: 'critical', progress: 0, dueDate: '2025-11-15' }
      ]
    },
    {
      id: 'construction',
      name: 'Construction & Infrastructure',
      color: '#F59E0B',
      lead: 'TBD - Head of Operations',
      status: 'planning',
      tasks: [
        { id: 'c1', title: 'Architect selection process', status: 'urgent', priority: 'critical', progress: 20, dueDate: '2025-09-15' },
        { id: 'c2', title: 'Finalize Rio government building', status: 'in-progress', priority: 'critical', progress: 60, dueDate: '2025-09-30' },
        { id: 'c3', title: 'Construction permits', status: 'not-started', priority: 'high', progress: 0, dueDate: '2025-11-15' },
        { id: 'c4', title: 'Begin renovation', status: 'not-started', priority: 'critical', progress: 0, dueDate: '2025-12-01' }
      ]
    },
    {
      id: 'technology',
      name: 'Technology & Platform',
      color: '#3B82F6',
      lead: 'Jay (Harvard)',
      status: 'active',
      tasks: [
        { id: 't1', title: 'Assemble tech team', status: 'in-progress', priority: 'critical', progress: 40, dueDate: '2025-09-30' },
        { id: 't2', title: 'Platform architecture design (INCEPT/TIMEBACK)', status: 'in-progress', priority: 'critical', progress: 25, dueDate: '2025-10-31' },
        { id: 't3', title: 'MVP development - Core AI Tutoring', status: 'not-started', priority: 'critical', progress: 0, dueDate: '2026-03-31' }
      ]
    },
    {
      id: 'education',
      name: 'Educational Model',
      color: '#8B5CF6',
      lead: 'Whitney + Harvard Team',
      status: 'planning',
      tasks: [
        { id: 'e1', title: 'Brazilian Life Skills Curriculum (24 Skills + Alpha Model)', status: 'in-progress', priority: 'high', progress: 15, dueDate: '2025-10-31' },
        { id: 'e2', title: 'BNCC compliance documentation', status: 'not-started', priority: 'critical', progress: 0, dueDate: '2025-11-30' }
      ]
    },
    {
      id: 'hiring',
      name: 'Hiring & Training',
      color: '#EC4899',
      lead: 'Head of School (TBH)',
      status: 'planning',
      tasks: [
        { id: 'h1', title: 'Hire Head of School', status: 'urgent', priority: 'critical', progress: 0, dueDate: '2025-10-31' },
        { id: 'h2', title: 'Core leadership team', status: 'not-started', priority: 'high', progress: 0, dueDate: '2025-12-31' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Enrollment',
      color: '#EF4444',
      lead: 'Marketing Director (TBH)',
      status: 'planning',
      tasks: [
        { id: 'm1', title: 'Brand identity finalization', status: 'urgent', priority: 'high', progress: 30, dueDate: '2025-09-30' },
        { id: 'm2', title: 'Marketing website launch', status: 'not-started', priority: 'high', progress: 0, dueDate: '2025-12-31' }
      ]
    }
  ],
  kpis: [
    { id: 'kpi1', name: 'Series A Funding Progress', current: 0, target: 20000000, unit: 'R$', description: 'R$20M for flagship + technology + public pilot' },
    { id: 'kpi2', name: 'Year 1 Students Enrolled', current: 0, target: 750, unit: 'students', description: '750 Year 1, 1,500 Year 2 target' },
    { id: 'kpi3', name: 'Core Team Hired', current: 3, target: 70, unit: 'people', description: 'Harvard team + 50 AI guides + specialists' },
    { id: 'kpi4', name: 'Construction Progress', current: 0, target: 100, unit: '%', description: 'São Paulo/Rio flagship school' },
    { id: 'kpi5', name: 'INCEPT Platform Development', current: 15, target: 100, unit: '%', description: 'AI tutoring + TIMEBACK system' },
    { id: 'kpi6', name: 'Premium Family Reach', current: 0, target: 50000, unit: 'families', description: 'R$10K+ income demographic' }
  ],
  milestones: [
    { id: 'm1', title: 'Series A Funding Secured (R$20M)', date: '2025-11-15', status: 'pending', critical: true },
    { id: 'm2', title: 'Government Building Partnership Finalized', date: '2025-12-01', status: 'pending', critical: true },
    { id: 'm3', title: 'Harvard Tech Team Complete (Jay + 4)', date: '2025-10-31', status: 'pending', critical: false },
    { id: 'm4', title: 'Head of School Hired', date: '2025-10-31', status: 'pending', critical: true },
    { id: 'm5', title: 'INCEPT MVP Platform Ready', date: '2026-03-31', status: 'pending', critical: true },
    { id: 'm6', title: 'Campus Tours Begin (750 target)', date: '2026-08-01', status: 'pending', critical: true },
    { id: 'm7', title: 'Construction Complete (São Paulo/Rio)', date: '2026-10-30', status: 'pending', critical: true },
    { id: 'm8', title: '750 Students Enrolled Year 1', date: '2026-12-31', status: 'pending', critical: true },
    { id: 'm9', title: 'AI School Brazil Opens! (2x Learning in 2 Hours)', date: '2027-01-15', status: 'pending', critical: true }
  ],
  risks: [
    {
      id: 'risk1',
      title: 'Funding Delay',
      probability: 'medium',
      impact: 'critical',
      mitigation: 'Multiple investor conversations, bridge funding options',
      owner: 'Raphael'
    },
    {
      id: 'risk2',
      title: 'Construction Delays',
      probability: 'medium',
      impact: 'high',
      mitigation: 'Penalty clauses, backup contractors, buffer time',
      owner: 'Operations Director'
    },
    {
      id: 'risk3',
      title: 'INCEPT/TIMEBACK Platform Not Ready',
      probability: 'low',
      impact: 'critical',
      mitigation: 'Harvard team expertise, Alpha School proven model, phased launch',
      owner: 'Jay'
    }
  ]
});

export default createConnectionBridge;