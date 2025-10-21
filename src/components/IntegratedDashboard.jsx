import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Users, DollarSign, AlertTriangle, 
  CheckCircle, Clock, Target, GitMerge, Zap, BarChart3,
  ArrowRight, Activity, Database, RefreshCw
} from 'lucide-react';
import { integrationService } from '../utils/integrationService';
import { createConnectionBridge, getDemoLaunchControlData } from '../utils/connectionBridge';

const IntegratedDashboard = ({ financialData, parameters, currentScenario, publicModelData }) => {
  const [launchControlData, setLaunchControlData] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('connected');

  // Initialize integration service and load data
  useEffect(() => {
    // Set financial data in integration service
    integrationService.setFinancialData(financialData);
    
    // Subscribe to integration updates
    const unsubscribe = integrationService.subscribe(({ launchControlData: lcData }) => {
      if (lcData) {
        setLaunchControlData(lcData);
        setLastSync(new Date());
        setSyncStatus('connected');
      }
    });

    // Initial data load with connection bridge
    const loadData = async () => {
      try {
        const bridge = createConnectionBridge();
        const lcData = await bridge.attemptConnection();
        
        if (lcData) {
          setLaunchControlData(lcData);
          setSyncStatus('connected');
        } else {
          // Fallback to demo data
          setLaunchControlData(getDemoLaunchControlData());
          setSyncStatus('demo');
        }
      } catch (error) {
        console.error('Error loading launch control data:', error);
        // Final fallback
        setLaunchControlData(getDemoLaunchControlData());
        setSyncStatus('error');
      }
    };

    loadData();
    
    // Manual sync trigger
    integrationService.syncData();

    return unsubscribe;
  }, [financialData]);

  // Calculate integrated metrics using integration service
  const integratedMetrics = useMemo(() => {
    if (!launchControlData || !financialData) return {};
    
    return integrationService.calculateIntegrationMetrics(launchControlData, financialData);
  }, [launchControlData, financialData]);

  const syncStatusConfig = {
    connected: { color: 'green', icon: CheckCircle, text: 'Connected' },
    demo: { color: 'blue', icon: Activity, text: 'Demo Mode' },
    error: { color: 'red', icon: AlertTriangle, text: 'Disconnected' },
    syncing: { color: 'yellow', icon: RefreshCw, text: 'Syncing...' }
  };

  const currentSyncConfig = syncStatusConfig[syncStatus];
  const SyncIcon = currentSyncConfig.icon;

  if (!integratedMetrics || !integratedMetrics.operational) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading integrated dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">
          Status: {syncStatus} | Data: {launchControlData ? 'Available' : 'Loading'} | Financial: {financialData ? 'Available' : 'Loading'}
        </p>
      </div>
    );
  }

  const { operational, financial, integration } = integratedMetrics;

  return (
    <div className="space-y-6">
      {/* Header with Sync Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <GitMerge className="w-7 h-7 mr-3 text-blue-600" />
              Integrated Command Center
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time sync between Financial Model and Launch Control
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SyncIcon className={`w-5 h-5 text-${currentSyncConfig.color}-600`} />
              <span className={`text-sm font-medium text-${currentSyncConfig.color}-600`}>
                {currentSyncConfig.text}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last sync: {lastSync.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Key Integration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Launch Readiness</p>
              <p className="text-3xl font-bold">{integration.launchReadiness}%</p>
              <p className="text-blue-100 text-sm mt-1">
                {operational.daysToLaunch} days remaining
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4 bg-blue-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${integration.launchReadiness}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Financial Projections</p>
              <p className="text-3xl font-bold">R$ {(financial.year1Revenue / 1000000).toFixed(0)}M</p>
              <p className="text-green-100 text-sm mt-1">
                Year 1 Revenue
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-2 text-green-100 text-sm">
            → R$ {(financial.year10Revenue / 1000000000).toFixed(1)}B Year 10
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Operational Progress</p>
              <p className="text-3xl font-bold">{operational.overallProgress}%</p>
              <p className="text-purple-100 text-sm mt-1">
                {operational.completedTasks}/{operational.totalTasks} tasks
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 bg-purple-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${operational.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold">{operational.criticalTasks + operational.urgentTasks}</p>
              <p className="text-orange-100 text-sm mt-1">
                {operational.urgentTasks} urgent actions
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Detailed Integration Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial vs Operational Alignment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Financial vs Operational Alignment
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Funding Status</h4>
                <p className="text-sm text-gray-600">
                  R$ {(operational.fundingProgress / 1000000).toFixed(1)}M secured of R$ 20M target
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((operational.fundingProgress / 20000000) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Series A Progress</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Team vs Students</h4>
                <p className="text-sm text-gray-600">
                  {operational.teamProgress} team members for {financial.projectedStudents} projected students
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {integration.teamToStudents > 0 ? Math.round(integration.teamToStudents) : 0}:1
                </div>
                <div className="text-sm text-gray-500">Student:Staff Ratio</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Platform Readiness</h4>
                <p className="text-sm text-gray-600">
                  INCEPT/TIMEBACK development progress
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {operational.platformProgress}%
                </div>
                <div className="text-sm text-gray-500">Technology Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Control Workstream Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Workstream Progress
          </h3>
          
          {launchControlData?.workstreams?.map((workstream) => {
            const completedTasks = workstream.tasks.filter(t => t.status === 'completed').length;
            const totalTasks = workstream.tasks.length;
            const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            return (
              <div key={workstream.id} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: workstream.color }}
                    />
                    <span className="font-medium text-gray-900">{workstream.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: workstream.color 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{workstream.lead}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Model Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Financial Model Integration Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              R$ {(financial.year1Revenue / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm font-medium text-blue-800 mt-1">Year 1 Revenue</div>
            <div className="text-xs text-blue-600 mt-2">
              Private sector launch revenue
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {financial.revenueGrowthRate}%
            </div>
            <div className="text-sm font-medium text-green-800 mt-1">CAGR</div>
            <div className="text-xs text-green-600 mt-2">
              10-year compound growth
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((financial.year1EBITDA / financial.year1Revenue) * 100)}%
            </div>
            <div className="text-sm font-medium text-purple-800 mt-1">EBITDA Margin</div>
            <div className="text-xs text-purple-600 mt-2">
              Year 1 profitability
            </div>
          </div>
        </div>
      </div>

      {/* Data Sync Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-gray-600" />
          Integration Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Financial Model</span>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Launch Control</span>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {syncStatus === 'demo' ? 'Demo' : 'Connected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Public Partnerships</span>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Integrated
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sync Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Update</span>
                <span className="text-gray-900">{lastSync.toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sync Frequency</span>
                <span className="text-gray-900">Real-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Quality</span>
                <span className="text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedDashboard;