import React, { useState, useMemo } from 'react';
import { Building2, Users, TrendingUp, DollarSign, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

// Public Sector Scenario Presets - Updated with corrected projections
// NO PUBLIC in Year 1 (2027) - starts Year 2 (2028)
// Year 1 = 2027 (0), Year 2 = 2028 (10K), Year 10 = 2036 (1.2M)
// Realistic: 0 -> 10K -> 50K -> 100K -> 180K -> 300K -> 450K -> 650K -> 900K -> 1.2M
// Pessimistic: 20% lower per year
// Optimistic: 20% higher per year
const PUBLIC_SCENARIO_PRESETS = {
  realistic: {
    name: 'Realistic',
    description: 'No public in 2027, 10K in 2028, growing to 1.2M by 2036',
    yearlyStudents: {
      1: 0,        // 2027 - NO PUBLIC
      2: 10000,    // 2028 - First year
      3: 50000,    // 2029
      4: 100000,   // 2030
      5: 180000,   // 2031
      6: 300000,   // 2032
      7: 450000,   // 2033
      8: 650000,   // 2034
      9: 900000,   // 2035
      10: 1200000, // 2036
    },
    year1Students: 0,
    year2Students: 10000,
    year5Students: 180000,
    year10Students: 1200000,
    pilotMunicipalities: 0,
    year5Municipalities: 12,
    year10Municipalities: 80,
    revenuePerStudentMonth: 10, // R$10/student/month (R$120/year) for public sector
    marginsPublic: 0.35
  },
  pessimistic: {
    name: 'Pessimistic',
    description: '20% lower than realistic per year',
    yearlyStudents: {
      1: 0,        // NO PUBLIC
      2: 8000,     // 10K * 0.8
      3: 40000,    // 50K * 0.8
      4: 80000,    // 100K * 0.8
      5: 144000,   // 180K * 0.8
      6: 240000,   // 300K * 0.8
      7: 360000,   // 450K * 0.8
      8: 520000,   // 650K * 0.8
      9: 720000,   // 900K * 0.8
      10: 960000,  // 1.2M * 0.8
    },
    year1Students: 0,
    year2Students: 8000,
    year5Students: 144000,
    year10Students: 960000,
    pilotMunicipalities: 0,
    year5Municipalities: 10,
    year10Municipalities: 64,
    revenuePerStudentMonth: 7.5, // R$7.50/student/month (R$90/year)
    marginsPublic: 0.30
  },
  optimistic: {
    name: 'Optimistic',
    description: '20% higher than realistic per year',
    yearlyStudents: {
      1: 0,        // NO PUBLIC
      2: 12000,    // 10K * 1.2
      3: 60000,    // 50K * 1.2
      4: 120000,   // 100K * 1.2
      5: 216000,   // 180K * 1.2
      6: 360000,   // 300K * 1.2
      7: 540000,   // 450K * 1.2
      8: 780000,   // 650K * 1.2
      9: 1080000,  // 900K * 1.2
      10: 1440000, // 1.2M * 1.2
    },
    year1Students: 0,
    year2Students: 12000,
    year5Students: 216000,
    year10Students: 1440000,
    pilotMunicipalities: 0,
    year5Municipalities: 14,
    year10Municipalities: 96,
    revenuePerStudentMonth: 12.5, // R$12.50/student/month (R$150/year)
    marginsPublic: 0.40
  }
};

const PublicPartnerships = ({ onPublicModelChange, initialScenario = 'realistic' }) => {
  const [currentScenario, setCurrentScenario] = useState(initialScenario);
  
  // Initialize parameters based on the initial scenario
  const getInitialParameters = (scenario = initialScenario) => {
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
      ...PUBLIC_SCENARIO_PRESETS[scenario]
    };
  };
  
  const [publicParameters, setPublicParameters] = useState(getInitialParameters());

  // Reset when initialScenario prop changes (from parent reset button)
  React.useEffect(() => {
    setCurrentScenario(initialScenario);
    const resetParams = getInitialParameters(initialScenario);
    setPublicParameters(resetParams);
  }, [initialScenario]); // Only depend on initialScenario, not currentScenario

  const publicFinancialData = useMemo(() => {
    const years = [];
    const scenarioData = PUBLIC_SCENARIO_PRESETS[currentScenario];

    for (let year = 1; year <= 10; year++) {
      // Use the predefined yearly student projections
      const students = scenarioData.yearlyStudents?.[year] ||
        Math.floor(publicParameters.year1Students * Math.pow(year / 1, 1.8));

      // Municipality expansion based on student count
      // Roughly 15K students per municipality average
      const municipalities = Math.min(
        Math.max(publicParameters.pilotMunicipalities, Math.floor(students / 15000)),
        publicParameters.year10Municipalities
      );

      // Core revenue streams
      // Monthly license fee per student (R$15-18/month depending on scenario)
      const monthlyRevenue = students * publicParameters.revenuePerStudentMonth * 12;

      // Setup fees for new municipalities (only count new ones each year)
      const prevMunicipalities = year > 1 ?
        Math.min(Math.max(publicParameters.pilotMunicipalities, Math.floor((scenarioData.yearlyStudents?.[year-1] || 0) / 15000)), publicParameters.year10Municipalities) : 0;
      const newMunicipalities = municipalities - prevMunicipalities;
      const setupRevenue = Math.max(0, newMunicipalities) * 50 * publicParameters.setupFeePerSchool; // 50 schools per municipality avg

      const technologyRevenue = municipalities * publicParameters.technologyLicenseFee;
      const trainingRevenue = Math.max(0, newMunicipalities) * 50 * publicParameters.teachersPerSchool * publicParameters.teacherTrainingFee;

      const totalRevenue = monthlyRevenue + setupRevenue + technologyRevenue + trainingRevenue;
      const costs = totalRevenue * (1 - publicParameters.marginsPublic);
      const ebitda = totalRevenue - costs;

      years.push({
        year,
        calendarYear: 2026 + year, // Year 1 = 2027
        students,
        municipalities: Math.floor(municipalities),
        newMunicipalities: Math.max(0, newMunicipalities),
        revenue: {
          monthly: monthlyRevenue,
          setup: setupRevenue,
          technology: technologyRevenue,
          training: trainingRevenue,
          total: totalRevenue
        },
        costs,
        ebitda,
        margin: totalRevenue > 0 ? ebitda / totalRevenue : 0
      });
    }

    return years;
  }, [publicParameters, currentScenario]);

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
    if (onPublicModelChange && publicFinancialData?.length > 0) {
      console.log('PublicPartnerships sending data:', { publicParameters, dataLength: publicFinancialData?.length, currentScenario });
      onPublicModelChange(publicParameters, publicFinancialData, currentScenario);
    }
  }, [publicFinancialData, publicParameters, onPublicModelChange]); // Removed currentScenario to prevent flashing

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
            <p className="mt-1 text-sm opacity-75">
              {currentScenario.charAt(0).toUpperCase() + currentScenario.slice(1)} Scenario: No public in 2027 → {formatNumber(publicFinancialData[1]?.students || 0)} (2028) → {formatNumber(year10Data.students)} (2036)
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatNumber(year10Data.students)}</div>
            <div className="text-sm opacity-90">Students by 2036 (Year 10)</div>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
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
                Teacher Training per School (R$)
              </label>
              <input
                type="number"
                value={publicParameters.teacherTrainingFee || ''}
                onChange={(e) => handleParameterChange('teacherTrainingFee', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2000"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10-Year Growth Projection (2027-2036)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calendar</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Municipalities</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">EBITDA</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {publicFinancialData.slice(0, 10).map((yearData) => (
                <tr key={yearData.year} className={yearData.year % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Year {yearData.year}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {yearData.calendarYear}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                    {formatNumber(yearData.students)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {yearData.municipalities}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-semibold">
                    {formatCurrency(yearData.revenue.total)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                    {formatCurrency(yearData.ebitda)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500">
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