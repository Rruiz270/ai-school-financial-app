import React, { useState, useMemo } from 'react';
import { Building2, Users, TrendingUp, DollarSign, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

// Public Sector Scenario Presets
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
    performanceBonusRate: 0.15,
    marginsPublic: 0.75
  },
  realistic: {
    name: 'Realistic',
    description: 'Moderate government support, steady growth',
    year1Students: 42500, // -15%
    year5Students: 518500, // -15%
    year10Students: 1870000, // -15%
    pilotMunicipalities: 4,
    year5Municipalities: 21, // -15%
    year10Municipalities: 102, // -15%
    revenuePerStudentMonth: 212, // -15%
    performanceBonusRate: 0.13, // -15%
    marginsPublic: 0.64 // -15%
  },
  pessimistic: {
    name: 'Pessimistic',
    description: 'Slow adoption, regulatory challenges',
    year1Students: 35000, // -30%
    year5Students: 427000, // -30%
    year10Students: 1540000, // -30%
    pilotMunicipalities: 3,
    year5Municipalities: 17, // -30%
    year10Municipalities: 84, // -30%
    revenuePerStudentMonth: 175, // -30%
    performanceBonusRate: 0.11, // -30%
    marginsPublic: 0.53 // -30%
  }
};

const PublicPartnerships = ({ onPublicModelChange, initialScenario = 'optimistic' }) => {
  const [currentScenario, setCurrentScenario] = useState(initialScenario);
  
  // Initialize parameters based on the initial scenario
  const getInitialParameters = () => {
    const baseParams = {
      // Infrastructure & setup fees
      setupFeePerSchool: 50000, // R$50k per school setup
      technologyLicenseFee: 25000, // R$25k annual tech license per municipality
      
      // Teacher training revenue
      teacherTrainingFee: 2000, // R$2k per teacher trained
      teachersPerSchool: 25,
    };
    
    return {
      ...baseParams,
      ...PUBLIC_SCENARIO_PRESETS[initialScenario]
    };
  };
  
  const [publicParameters, setPublicParameters] = useState(getInitialParameters());

  const publicFinancialData = useMemo(() => {
    const years = [];
    
    for (let year = 1; year <= 10; year++) {
      // Student growth curve
      const studentGrowth = Math.min(
        publicParameters.year1Students * Math.pow(year / 1, 1.8),
        publicParameters.year10Students
      );
      
      const students = Math.floor(studentGrowth);
      
      // Municipality expansion
      const municipalities = Math.min(
        publicParameters.pilotMunicipalities * Math.pow(year / 1, 1.5),
        publicParameters.year10Municipalities
      );
      
      // Core revenue streams
      const monthlyRevenue = students * publicParameters.revenuePerStudentMonth * 12;
      const performanceBonus = monthlyRevenue * publicParameters.performanceBonusRate;
      const setupRevenue = Math.floor(municipalities * 50) * publicParameters.setupFeePerSchool; // 50 schools per municipality avg
      const technologyRevenue = Math.floor(municipalities) * publicParameters.technologyLicenseFee;
      const trainingRevenue = Math.floor(municipalities * 50 * publicParameters.teachersPerSchool) * publicParameters.teacherTrainingFee;
      
      const totalRevenue = monthlyRevenue + performanceBonus + setupRevenue + technologyRevenue + trainingRevenue;
      const costs = totalRevenue * (1 - publicParameters.marginsPublic);
      const ebitda = totalRevenue - costs;
      
      years.push({
        year,
        students,
        municipalities: Math.floor(municipalities),
        revenue: {
          monthly: monthlyRevenue,
          performance: performanceBonus,
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
  }, [publicParameters]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const handleParameterChange = (key, value) => {
    // Handle empty values
    const processedValue = value === '' ? 0 : value;
    const newParams = { ...publicParameters, [key]: processedValue };
    setPublicParameters(newParams);
  };

  const handleScenarioChange = (scenarioKey) => {
    setCurrentScenario(scenarioKey);
    const scenarioParams = {
      ...publicParameters,
      ...PUBLIC_SCENARIO_PRESETS[scenarioKey]
    };
    setPublicParameters(scenarioParams);
  };

  // Update parent component with data changes
  React.useEffect(() => {
    if (onPublicModelChange) {
      console.log('PublicPartnerships sending data:', { publicParameters, dataLength: publicFinancialData?.length, currentScenario });
      onPublicModelChange(publicParameters, publicFinancialData, currentScenario);
    }
  }, [publicFinancialData, publicParameters, currentScenario, onPublicModelChange]);

  // Initialize data on mount
  React.useEffect(() => {
    if (onPublicModelChange && publicFinancialData?.length > 0) {
      console.log('Initial public data send');
      onPublicModelChange(publicParameters, publicFinancialData, currentScenario);
    }
  }, [onPublicModelChange]); // Only run on mount and when callback changes

  const year10Data = publicFinancialData[9];
  const year5Data = publicFinancialData[4];
  const year1Data = publicFinancialData[0];

  return (
    <div className="space-y-6">
      {/* Professional Header Stamp */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 border-2 border-red-400 px-4 py-2 rounded-lg">
              <div className="text-red-700 font-bold text-sm">CONFIDENTIAL</div>
            </div>
            <div className="text-gray-700">
              <div className="font-semibold text-sm">Project Owner: Raphael Ruiz</div>
              <div className="text-xs text-gray-500">AI School Brazil - Public Sector Partnerships</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Public Sector Partnerships</h2>
            <p className="mt-2 opacity-90">
              AI Education for Brazil's 46.7M Public K-12 Students through Municipal & State Partnerships
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatNumber(year10Data.students)}</div>
            <div className="text-sm opacity-90">Students by Year 10</div>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Public Sector Scenarios</h3>
            <p className="text-sm text-gray-600">Select different market penetration and partnership scenarios</p>
          </div>
          <div className="flex space-x-3">
            {Object.entries(PUBLIC_SCENARIO_PRESETS).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => handleScenarioChange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentScenario === key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{scenario.name}</div>
                  <div className="text-xs opacity-90">{scenario.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-emerald-900">
                Current Scenario: {PUBLIC_SCENARIO_PRESETS[currentScenario].name}
              </div>
              <div className="text-sm text-emerald-700 mt-1">
                {PUBLIC_SCENARIO_PRESETS[currentScenario].description}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-600">
                {formatNumber(publicParameters.year10Students)} students
              </div>
              <div className="text-sm text-emerald-600">by Year 10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Year 10 Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(year10Data.revenue.total)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {((year10Data.revenue.total / year1Data.revenue.total - 1) * 100).toFixed(0)}x growth from Year 1
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Year 10 EBITDA</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(year10Data.ebitda)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {(year10Data.margin * 100).toFixed(1)}% EBITDA Margin
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Municipalities</p>
              <p className="text-2xl font-bold text-blue-600">{year10Data.municipalities}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Covering major cities across Brazil
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Penetration</p>
              <p className="text-2xl font-bold text-purple-600">
                {((year10Data.students / 46700000) * 100).toFixed(1)}%
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Of Brazil's 46.7M public students
          </div>
        </div>
      </div>

      {/* Revenue Model Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams (Year 10)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Monthly License Fees</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(year10Data.revenue.monthly)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Performance Bonuses</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(year10Data.revenue.performance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">School Setup Fees</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(year10Data.revenue.setup)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Technology Licenses</span>
              <span className="font-semibold text-indigo-600">
                {formatCurrency(year10Data.revenue.technology)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Teacher Training</span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(year10Data.revenue.training)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
              <span className="font-semibold text-gray-900">Total Revenue</span>
              <span className="font-bold text-xl text-emerald-600">
                {formatCurrency(year10Data.revenue.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Parameters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue per Student/Month (R$)
              </label>
              <input
                type="number"
                value={publicParameters.revenuePerStudentMonth || ''}
                onChange={(e) => handleParameterChange('revenuePerStudentMonth', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="250"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year 10 Student Target
              </label>
              <input
                type="number"
                value={publicParameters.year10Students || ''}
                onChange={(e) => handleParameterChange('year10Students', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2200000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year 10 Municipalities
              </label>
              <input
                type="number"
                value={publicParameters.year10Municipalities || ''}
                onChange={(e) => handleParameterChange('year10Municipalities', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Bonus Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={publicParameters.performanceBonusRate ? (publicParameters.performanceBonusRate * 100) : ''}
                onChange={(e) => handleParameterChange('performanceBonusRate', e.target.value === '' ? '' : Number(e.target.value) / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EBITDA Margin (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={publicParameters.marginsPublic ? (publicParameters.marginsPublic * 100) : ''}
                onChange={(e) => handleParameterChange('marginsPublic', e.target.value === '' ? '' : Number(e.target.value) / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="75"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10-Year Growth Projection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipalities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EBITDA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {publicFinancialData.slice(0, 10).map((yearData) => (
                <tr key={yearData.year} className={yearData.year % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Year {yearData.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(yearData.students)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {yearData.municipalities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                    {formatCurrency(yearData.revenue.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {formatCurrency(yearData.ebitda)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(yearData.margin * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Public Sector Strategy Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Partnership model: Use existing public schools and teachers with our AI methodology</li>
              <li>• Revenue sharing: Government pays per student per month based on performance</li>
              <li>• Teacher retention: Existing teachers trained on our system, maintaining employment</li>
              <li>• Infrastructure: Leverage existing buildings, add technology and training</li>
              <li>• Scalability: Can reach Brazil's 46.7M public students vs 9M private students</li>
              <li>• Political stability: Performance-based contracts reduce political risk</li>
              <li>• Social impact: Democratizes AI education access across socioeconomic levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPartnerships;