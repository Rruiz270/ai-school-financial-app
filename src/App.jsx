import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Settings, Presentation, Calculator, TrendingUp, Users, Calendar, School, Building2, GitMerge, RotateCcw, Wallet } from 'lucide-react';
import { FinancialModel, DEFAULT_PARAMETERS, SCENARIO_PRESETS } from './utils/financialModel';
import Dashboard from './components/Dashboard';
import ParameterControl from './components/ParameterControl';
import PresentationMode from './components/PresentationMode';
import YearByYearEditor from './components/YearByYearEditor';
import PublicPartnerships from './components/PublicPartnerships';
import ConsolidatedView from './components/ConsolidatedView';
import CashFlow from './components/CashFlow';

// Public Sector Scenario Presets (copied from PublicPartnerships)
const PUBLIC_SCENARIO_PRESETS = {
  optimistic: {
    name: 'Optimistic',
    description: 'Strong government partnerships, rapid adoption',
    year1Students: 50000,
    year5Students: 610000,
    year10Students: 2200000,
    pilotMunicipalities: 5,
    year5Municipalities: 25,
    year10Municipalities: 120,
    revenuePerStudentMonth: 250,
    marginsPublic: 0.75
  },
  realistic: {
    name: 'Realistic',
    description: 'Moderate government support, steady growth',
    year1Students: 42500,
    year5Students: 518500,
    year10Students: 1870000,
    pilotMunicipalities: 4,
    year5Municipalities: 21,
    year10Municipalities: 102,
    revenuePerStudentMonth: 212,
    marginsPublic: 0.64
  },
  pessimistic: {
    name: 'Pessimistic',
    description: 'Slow adoption, regulatory challenges',
    year1Students: 35000,
    year5Students: 427000,
    year10Students: 1540000,
    pilotMunicipalities: 3,
    year5Municipalities: 17,
    year10Municipalities: 84,
    revenuePerStudentMonth: 175,
    marginsPublic: 0.53
  }
};

// Function to generate initial public financial data
const generatePublicFinancialData = (scenario = 'optimistic') => {
  const publicParams = {
    setupFeePerSchool: 50000,
    technologyLicenseFee: 25000,
    teacherTrainingFee: 2000,
    teachersPerSchool: 25,
    ...PUBLIC_SCENARIO_PRESETS[scenario]
  };
  
  const years = [];
  
  for (let year = 1; year <= 10; year++) {
    const studentGrowth = Math.min(
      publicParams.year1Students * Math.pow(year / 1, 1.8),
      publicParams.year10Students
    );
    
    const students = Math.floor(studentGrowth);
    
    const municipalities = Math.min(
      publicParams.pilotMunicipalities * Math.pow(year / 1, 1.5),
      publicParams.year10Municipalities
    );
    
    const monthlyRevenue = students * publicParams.revenuePerStudentMonth * 12;
    const setupRevenue = Math.floor(municipalities * 50) * publicParams.setupFeePerSchool;
    const technologyRevenue = Math.floor(municipalities) * publicParams.technologyLicenseFee;
    const trainingRevenue = Math.floor(municipalities * 50 * publicParams.teachersPerSchool) * publicParams.teacherTrainingFee;
    
    const totalRevenue = monthlyRevenue + setupRevenue + technologyRevenue + trainingRevenue;
    const costs = totalRevenue * (1 - publicParams.marginsPublic);
    const ebitda = totalRevenue - costs;
    
    years.push({
      year,
      students,
      municipalities: Math.floor(municipalities),
      revenue: {
        monthly: monthlyRevenue,
        setup: setupRevenue,
        technology: technologyRevenue,
        training: trainingRevenue,
        total: totalRevenue
      },
      costs,
      ebitda,
      margin: ebitda / totalRevenue
    });
  }
  
  return years;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [currentScenario, setCurrentScenario] = useState('realistic');
  const [currentPublicScenario, setCurrentPublicScenario] = useState('optimistic');
  const [publicModelData, setPublicModelData] = useState(() => generatePublicFinancialData('optimistic'));
  
  // Create financial model instance and calculations
  const model = useMemo(() => new FinancialModel(parameters), [parameters]);
  const financialData = useMemo(() => model.getFinancialSummary(), [model]);

  // Update public data when scenario changes but tab hasn't been visited
  useEffect(() => {
    if (!publicModelData || publicModelData.length === 0) {
      setPublicModelData(generatePublicFinancialData(currentPublicScenario));
    }
  }, [currentPublicScenario]);

  const handleParameterChange = (newParams) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  const handleScenarioChange = (scenarioKey, scenarioParams) => {
    setCurrentScenario(scenarioKey);
    setParameters(scenarioParams);
  };

  const handlePublicModelChange = (publicParams, publicData, publicScenario) => {
    console.log('App received public data:', { publicParams, publicData, publicScenario });
    setPublicModelData(publicData);
    if (publicScenario) {
      setCurrentPublicScenario(publicScenario);
    }
  };

  const resetAllToDefault = () => {
    // Reset private sector to realistic scenario and clear year-by-year overrides
    const realisticParams = {
      ...SCENARIO_PRESETS.realistic.parameters,
      yearlyOverrides: {} // Clear all year-by-year customizations
    };
    setCurrentScenario('realistic');
    setParameters(realisticParams);
    
    // Reset public sector to optimistic scenario (default for public)
    setCurrentPublicScenario('optimistic');
    setPublicModelData(generatePublicFinancialData('optimistic'));
    
    // The public sector will reset itself when it receives the new initialScenario prop
    // This will trigger a re-render and the PublicPartnerships component will initialize with optimistic
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Private Sector',
      icon: <School className="w-5 h-5" />,
      component: <Dashboard 
        financialData={financialData} 
        onScenarioChange={handleScenarioChange}
        currentScenario={currentScenario}
      />
    },
    {
      id: 'public',
      name: 'Public Partnerships',
      icon: <Building2 className="w-5 h-5" />,
      component: <PublicPartnerships 
        onPublicModelChange={handlePublicModelChange}
        initialScenario={currentPublicScenario}
      />
    },
    {
      id: 'consolidated',
      name: 'Consolidated View',
      icon: <GitMerge className="w-5 h-5" />,
      component: <ConsolidatedView 
        privateFinancialData={financialData}
        publicModelData={publicModelData}
        currentPrivateScenario={currentScenario}
        currentPublicScenario={currentPublicScenario}
      />
    },
    {
      id: 'yearly',
      name: 'Private Year-by-Year',
      icon: <Calendar className="w-5 h-5" />,
      component: (
        <YearByYearEditor 
          parameters={parameters} 
          onParameterChange={handleParameterChange}
          financialData={financialData}
          currentScenario={currentScenario}
        />
      )
    },
    {
      id: 'cashflow',
      name: 'Cash Flow',
      icon: <Wallet className="w-5 h-5" />,
      component: (
        <CashFlow 
          financialData={financialData}
          parameters={parameters}
          currentScenario={currentScenario}
          publicModelData={publicModelData}
          currentPublicScenario={currentPublicScenario}
        />
      )
    },
    {
      id: 'parameters',
      name: 'Model Parameters',
      icon: <Settings className="w-5 h-5" />,
      component: (
        <ParameterControl 
          parameters={parameters} 
          onParameterChange={handleParameterChange}
        />
      )
    },
    {
      id: 'presentation',
      name: 'Investor Presentation',
      icon: <Presentation className="w-5 h-5" />,
      component: <PresentationMode 
        financialData={financialData} 
        publicModelData={publicModelData}
        currentPrivateScenario={currentScenario}
        currentPublicScenario={currentPublicScenario}
      />
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI School Brazil</h1>
                  <p className="text-sm text-gray-600">Financial Model & Business Plan</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="font-semibold text-gray-700 text-xs">Active Scenario</div>
                  <div className="text-primary-600 font-bold capitalize">{currentScenario}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{formatCurrency(financialData.summary.year10Revenue)}</div>
                  <div className="text-gray-600">Year 10 Revenue</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{formatPercentage(financialData.summary.irr)}</div>
                  <div className="text-gray-600">IRR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{new Intl.NumberFormat('pt-BR').format(financialData.summary.year10Students)}</div>
                  <div className="text-gray-600">Students</div>
                </div>
              </div>
              
              {/* Reset All Button */}
              <button
                onClick={resetAllToDefault}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Reset all tabs to default scenarios (Private: Realistic, Public: Optimistic)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset All to Default</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {activeTab !== 'presentation' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={activeTab === 'presentation' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Dashboard 
                financialData={financialData} 
                onScenarioChange={handleScenarioChange}
                currentScenario={currentScenario}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ParameterControl 
                  parameters={parameters} 
                  onParameterChange={handleParameterChange}
                  className="max-h-screen overflow-y-auto"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'public' && (
          <PublicPartnerships 
            onPublicModelChange={handlePublicModelChange}
            initialScenario={currentPublicScenario}
          />
        )}

        {activeTab === 'consolidated' && (
          <ConsolidatedView 
            privateFinancialData={financialData}
            publicModelData={publicModelData}
            currentPrivateScenario={currentScenario}
            currentPublicScenario={currentPublicScenario}
          />
        )}

        {activeTab === 'yearly' && (
          <YearByYearEditor 
            parameters={parameters} 
            onParameterChange={handleParameterChange}
            financialData={financialData}
            currentScenario={currentScenario}
          />
        )}
        
        {activeTab === 'cashflow' && (
          <CashFlow 
            financialData={financialData}
            parameters={parameters}
            currentScenario={currentScenario}
            publicModelData={publicModelData}
            currentPublicScenario={currentPublicScenario}
          />
        )}
        
        {activeTab === 'parameters' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ParameterControl 
                parameters={parameters} 
                onParameterChange={handleParameterChange}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Year 10 Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(financialData.summary.year10Revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Year 10 EBITDA</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(financialData.summary.year10Ebitda)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">IRR</span>
                    <span className="font-semibold text-purple-600">
                      {formatPercentage(financialData.summary.irr)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">NPV</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(financialData.summary.npv)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Students</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR').format(financialData.summary.year10Students)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payback Period</span>
                    <span className="font-semibold text-gray-900">
                      {financialData.summary.paybackPeriod} years
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">CAPEX Scenario</h4>
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-primary-600">
                      {financialData.summary.capexScenario.name}
                    </div>
                    <div className="text-gray-600">
                      {financialData.summary.capexScenario.description}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(financialData.summary.capexScenario.initialCapex)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'presentation' && (
          <div>
            <PresentationMode 
              financialData={financialData} 
              publicModelData={publicModelData}
              currentPrivateScenario={currentScenario}
              currentPublicScenario={currentPublicScenario}
            />
            <div className="fixed top-4 left-4 z-50 no-print">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-white text-gray-700 rounded-md shadow-lg hover:bg-gray-50 border border-gray-200"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {activeTab !== 'presentation' && (
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>AI School Brazil - Financial Model &copy; 2024</p>
                <p>Interactive financial planning for AI-powered education</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-time calculations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Scenario modeling</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;