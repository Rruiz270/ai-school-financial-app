// Integration service to sync data between Financial App and Launch Control
export class IntegrationService {
  constructor() {
    this.listeners = [];
    this.lastSync = new Date();
    this.syncInterval = null;
    this.isInitialized = false;
  }

  // Initialize the integration service
  init() {
    if (this.isInitialized) return;
    
    this.startAutoSync();
    this.isInitialized = true;
    console.log('Integration Service initialized');
  }

  // Start automatic syncing every 30 seconds
  startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 30000); // 30 seconds
  }

  // Stop automatic syncing
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Manual sync trigger
  syncData() {
    const launchControlData = this.getLaunchControlData();
    const financialData = this.getFinancialData();
    
    if (launchControlData || financialData) {
      this.lastSync = new Date();
      this.notifyListeners({ launchControlData, financialData });
    }
  }

  // Get launch control data from localStorage or API
  getLaunchControlData() {
    try {
      const savedData = localStorage.getItem('ai-school-project-data');
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error loading launch control data:', error);
      return null;
    }
  }

  // Get financial data (passed from App component)
  getFinancialData() {
    // This would be set by the financial app
    return this.cachedFinancialData || null;
  }

  // Set financial data from the app
  setFinancialData(data) {
    this.cachedFinancialData = data;
  }

  // Register listeners for data updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of data updates
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in integration listener:', error);
      }
    });
  }

  // Calculate integration metrics
  calculateIntegrationMetrics(launchControlData, financialData) {
    if (!launchControlData || !financialData || !Array.isArray(financialData) || financialData.length === 0) {
      console.log('Integration metrics: Missing data', { 
        hasLaunchControl: !!launchControlData, 
        hasFinancial: !!financialData,
        financialDataLength: financialData ? financialData.length : 0 
      });
      return null;
    }

    const year1Data = financialData[0];
    const year10Data = financialData[9];

    // Launch control metrics
    const totalTasks = launchControlData.workstreams?.reduce((sum, ws) => sum + ws.tasks.length, 0) || 0;
    const completedTasks = launchControlData.workstreams?.reduce((sum, ws) => 
      sum + ws.tasks.filter(t => t.status === 'completed').length, 0) || 0;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Financial alignment metrics
    const fundingProgress = launchControlData.kpis?.find(k => k.id === 'kpi1')?.current || 0;
    const enrollmentProgress = launchControlData.kpis?.find(k => k.id === 'kpi2')?.current || 0;
    const teamProgress = launchControlData.kpis?.find(k => k.id === 'kpi3')?.current || 0;
    const platformProgress = launchControlData.kpis?.find(k => k.id === 'kpi5')?.current || 0;

    // Risk assessment
    const criticalTasks = launchControlData.workstreams?.reduce((sum, ws) => 
      sum + ws.tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length, 0) || 0;
    const urgentTasks = launchControlData.workstreams?.reduce((sum, ws) => 
      sum + ws.tasks.filter(t => t.status === 'urgent').length, 0) || 0;

    // Financial metrics
    const year1Revenue = year1Data?.revenue?.total || 0;
    const year10Revenue = year10Data?.revenue?.total || 0;
    const year1EBITDA = year1Data?.ebitda || 0;

    // Integration health score
    const fundingHealth = fundingProgress >= 15000000 ? 100 : (fundingProgress / 15000000) * 100;
    const teamHealth = teamProgress >= 20 ? 100 : (teamProgress / 20) * 100;
    const platformHealth = platformProgress;
    const taskHealth = overallProgress;
    
    const integrationHealth = Math.round((fundingHealth + teamHealth + platformHealth + taskHealth) / 4);

    return {
      operational: {
        overallProgress,
        totalTasks,
        completedTasks,
        criticalTasks,
        urgentTasks,
        fundingProgress,
        enrollmentProgress,
        teamProgress,
        platformProgress
      },
      financial: {
        year1Revenue,
        year10Revenue,
        year1EBITDA,
        projectedStudents: year1Data?.students?.total || 0,
        revenueGrowthRate: year10Revenue > 0 && year1Revenue > 0 ? 
          Math.round(((year10Revenue / year1Revenue) ** (1/9) - 1) * 100) : 0
      },
      integration: {
        healthScore: integrationHealth,
        fundingHealth,
        teamHealth,
        platformHealth,
        taskHealth,
        launchReadiness: Math.min(overallProgress, platformProgress, fundingHealth),
        riskLevel: criticalTasks + urgentTasks > 5 ? 'high' : urgentTasks > 2 ? 'medium' : 'low'
      },
      sync: {
        lastSync: this.lastSync,
        isConnected: true,
        dataQuality: integrationHealth > 70 ? 'excellent' : integrationHealth > 50 ? 'good' : 'poor'
      }
    };
  }

  // Update launch control KPIs based on financial projections
  updateLaunchControlKPIs(financialData) {
    const launchControlData = this.getLaunchControlData();
    if (!launchControlData || !financialData) return;

    try {
      const year1Data = financialData[0];
      const updatedKPIs = launchControlData.kpis.map(kpi => {
        switch (kpi.id) {
          case 'kpi2': // Year 1 Students Enrolled
            return {
              ...kpi,
              target: year1Data?.students?.flagship || 750
            };
          case 'kpi6': // Premium Family Reach
            return {
              ...kpi,
              target: (year1Data?.students?.flagship || 750) * 10 // 10x funnel
            };
          default:
            return kpi;
        }
      });

      const updatedData = {
        ...launchControlData,
        kpis: updatedKPIs
      };

      localStorage.setItem('ai-school-project-data', JSON.stringify(updatedData));
      this.notifyListeners({ launchControlData: updatedData, financialData });
      
    } catch (error) {
      console.error('Error updating launch control KPIs:', error);
    }
  }

  // Generate integration report
  generateIntegrationReport(launchControlData, financialData) {
    const metrics = this.calculateIntegrationMetrics(launchControlData, financialData);
    if (!metrics) return null;

    const daysToLaunch = Math.ceil((new Date('2027-01-15') - new Date()) / (1000 * 60 * 60 * 24));

    return {
      summary: {
        integrationHealth: metrics.integration.healthScore,
        launchReadiness: metrics.integration.launchReadiness,
        daysToLaunch,
        riskLevel: metrics.integration.riskLevel
      },
      financial: {
        year1RevenueProjection: metrics.financial.year1Revenue,
        growthRate: metrics.financial.revenueGrowthRate,
        profitabilityYear1: metrics.financial.year1EBITDA > 0
      },
      operational: {
        overallProgress: metrics.operational.overallProgress,
        criticalIssues: metrics.operational.criticalTasks + metrics.operational.urgentTasks,
        teamSize: metrics.operational.teamProgress,
        platformReadiness: metrics.operational.platformProgress
      },
      recommendations: this.generateRecommendations(metrics),
      lastUpdated: this.lastSync
    };
  }

  // Generate recommendations based on integration metrics
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.integration.fundingHealth < 50) {
      recommendations.push({
        priority: 'high',
        category: 'Funding',
        title: 'Accelerate Series A Funding',
        description: 'Focus on closing Series A to enable construction and team scaling'
      });
    }

    if (metrics.operational.platformProgress < 30) {
      recommendations.push({
        priority: 'high',
        category: 'Technology',
        title: 'Platform Development Priority',
        description: 'Increase development velocity on INCEPT/TIMEBACK platform'
      });
    }

    if (metrics.operational.teamProgress < 20) {
      recommendations.push({
        priority: 'medium',
        category: 'Team',
        title: 'Accelerate Hiring',
        description: 'Focus on hiring key positions: Head of School, Technology Team'
      });
    }

    if (metrics.operational.criticalTasks > 3) {
      recommendations.push({
        priority: 'high',
        category: 'Operations',
        title: 'Address Critical Tasks',
        description: `${metrics.operational.criticalTasks} critical tasks need immediate attention`
      });
    }

    if (metrics.integration.healthScore < 60) {
      recommendations.push({
        priority: 'medium',
        category: 'Integration',
        title: 'Improve Data Sync',
        description: 'Enhance integration between financial planning and operational execution'
      });
    }

    return recommendations;
  }

  // Clean up when service is destroyed
  destroy() {
    this.stopAutoSync();
    this.listeners = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
export const integrationService = new IntegrationService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  integrationService.init();
}

export default integrationService;