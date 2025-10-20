import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Calculator, Target, ArrowUpRight, ArrowDownRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UnitEconomics = ({ financialData, parameters, currentScenario, publicModelData }) => {
  const [selectedSegment, setSelectedSegment] = useState('flagship');
  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedYear, setSelectedYear] = useState(5); // Default to Year 5

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Calculate unit economics for each business segment
  const unitEconomicsData = useMemo(() => {
    const { projection } = financialData;
    const yearData = projection[selectedYear] || projection[5];
    
    // Flagship School Unit Economics
    const flagship = {
      students: yearData.students?.flagship || 0,
      monthlyTuition: 2300, // R$2,300/month
      annualRevenue: (yearData.students?.flagship || 0) * 2300 * 12,
      marketingCosts: (yearData.costs?.marketing || 0) * 0.4, // 40% allocated to flagship
      acquisitionCost: yearData.students?.flagship > 0 ? 
        ((yearData.costs?.marketing || 0) * 0.4) / (yearData.students?.flagship * 0.2) : 0, // Assume 20% new students
      lifetimeValue: 2300 * 12 * 3.5, // Average 3.5 years retention
      contributionMargin: 0.75, // 75% contribution margin
      paybackMonths: 0,
      churnRate: 0.15 // 15% annual churn
    };
    flagship.paybackMonths = flagship.acquisitionCost > 0 ? 
      flagship.acquisitionCost / (flagship.monthlyTuition * flagship.contributionMargin) : 0;

    // Franchise Unit Economics  
    const franchise = {
      locations: yearData.franchiseCount || 0,
      studentsPerLocation: yearData.students?.franchise > 0 ? 
        (yearData.students?.franchise / (yearData.franchiseCount || 1)) : 0,
      franchiseFee: 225000, // R$225,000 initial fee
      monthlyRoyalty: 606, // 5% of R$12,120 average monthly revenue per location
      marketingCosts: (yearData.costs?.marketing || 0) * 0.3, // 30% allocated to franchise
      acquisitionCost: yearData.franchiseCount > 0 ? 
        ((yearData.costs?.marketing || 0) * 0.3) / (yearData.franchiseCount * 0.15) : 0, // Assume 15% new franchises
      lifetimeValue: (225000 + (606 * 12 * 8)), // 8-year average franchise life
      contributionMargin: 0.85, // 85% contribution margin
      paybackMonths: 0,
      churnRate: 0.08 // 8% annual franchise churn
    };
    franchise.paybackMonths = franchise.acquisitionCost > 0 ? 
      franchise.acquisitionCost / (franchise.monthlyRoyalty * franchise.contributionMargin) : 0;

    // Adoption Licensing Unit Economics
    const adoption = {
      students: yearData.students?.adoption || 0,
      monthlyFee: 250, // R$250/student/month
      annualRevenue: (yearData.students?.adoption || 0) * 250 * 12,
      marketingCosts: (yearData.costs?.marketing || 0) * 0.2, // 20% allocated to adoption
      acquisitionCost: yearData.students?.adoption > 0 ? 
        ((yearData.costs?.marketing || 0) * 0.2) / (yearData.students?.adoption * 0.25) : 0, // Assume 25% new students
      lifetimeValue: 250 * 12 * 4, // Average 4 years retention
      contributionMargin: 0.90, // 90% contribution margin
      paybackMonths: 0,
      churnRate: 0.12 // 12% annual churn
    };
    adoption.paybackMonths = adoption.acquisitionCost > 0 ? 
      adoption.acquisitionCost / (adoption.monthlyFee * adoption.contributionMargin) : 0;

    // Public Partnerships (Year 2+)
    const publicPartnerships = {
      students: selectedYear >= 2 && publicModelData && publicModelData[selectedYear-2] ? 
        publicModelData[selectedYear-2].students : 0,
      monthlyFee: 250, // R$250/student/month
      annualRevenue: selectedYear >= 2 && publicModelData && publicModelData[selectedYear-2] ? 
        publicModelData[selectedYear-2].revenue.total : 0,
      marketingCosts: (yearData.costs?.marketing || 0) * 0.1, // 10% allocated to public
      acquisitionCost: 1500, // Lower acquisition cost for government partnerships
      lifetimeValue: 250 * 12 * 5, // 5-year government contracts
      contributionMargin: 0.75, // 75% contribution margin (higher support costs)
      paybackMonths: 1500 / (250 * 0.75),
      churnRate: 0.05 // 5% annual churn (government stability)
    };

    return { flagship, franchise, adoption, publicPartnerships };
  }, [financialData, selectedYear, publicModelData]);

  // Blended unit economics
  const blendedMetrics = useMemo(() => {
    const { flagship, franchise, adoption, publicPartnerships } = unitEconomicsData;
    
    const totalRevenue = flagship.annualRevenue + 
      (franchise.locations * franchise.monthlyRoyalty * 12) + 
      adoption.annualRevenue + 
      publicPartnerships.annualRevenue;
    
    const weightedCAC = (
      (flagship.acquisitionCost * flagship.annualRevenue) +
      (franchise.acquisitionCost * (franchise.locations * franchise.monthlyRoyalty * 12)) +
      (adoption.acquisitionCost * adoption.annualRevenue) +
      (publicPartnerships.acquisitionCost * publicPartnerships.annualRevenue)
    ) / totalRevenue || 0;

    const weightedLTV = (
      (flagship.lifetimeValue * flagship.annualRevenue) +
      (franchise.lifetimeValue * (franchise.locations * franchise.monthlyRoyalty * 12)) +
      (adoption.lifetimeValue * adoption.annualRevenue) +
      (publicPartnerships.lifetimeValue * publicPartnerships.annualRevenue)
    ) / totalRevenue || 0;

    const ltvCacRatio = weightedCAC > 0 ? weightedLTV / weightedCAC : 0;
    
    return {
      totalRevenue,
      weightedCAC,
      weightedLTV,
      ltvCacRatio,
      blendedMargin: 0.82, // Blended contribution margin
      paybackMonths: weightedCAC > 0 ? weightedCAC / ((weightedLTV / 48) * 0.82) : 0 // 48-month LTV assumption
    };
  }, [unitEconomicsData]);

  // Time series data for trends
  const timeSeriesData = useMemo(() => {
    return financialData.projection.slice(1, 11).map((year, index) => {
      const yearNum = index + 1;
      const students = year.students || {};
      const costs = year.costs || {};
      
      // Calculate blended CAC for this year
      const totalStudents = (students.flagship || 0) + (students.franchise || 0) + (students.adoption || 0);
      const marketingCost = costs.marketing || 0;
      const newStudentRate = 0.2; // Assume 20% of students are new each year
      const cac = totalStudents > 0 ? marketingCost / (totalStudents * newStudentRate) : 0;
      
      // Calculate blended LTV
      const avgRevPerStudent = totalStudents > 0 ? year.revenue.total / totalStudents : 0;
      const ltv = avgRevPerStudent * 3.5; // 3.5 year average retention

      return {
        year: yearNum,
        yearLabel: `Year ${yearNum}`,
        cac: cac,
        ltv: ltv,
        ltvCacRatio: cac > 0 ? ltv / cac : 0,
        totalStudents: totalStudents,
        revenue: year.revenue.total
      };
    });
  }, [financialData]);

  const segments = [
    { key: 'flagship', name: 'Flagship School', color: '#3b82f6', icon: <Users className="w-4 h-4" /> },
    { key: 'franchise', name: 'Franchise Network', color: '#10b981', icon: <Target className="w-4 h-4" /> },
    { key: 'adoption', name: 'Adoption Licensing', color: '#f59e0b', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'publicPartnerships', name: 'Public Partnerships', color: '#8b5cf6', icon: <DollarSign className="w-4 h-4" /> }
  ];

  const selectedSegmentData = unitEconomicsData[selectedSegment];

  // Health score calculation
  const getHealthScore = (ltvCacRatio, paybackMonths, contributionMargin) => {
    let score = 0;
    let status = 'poor';
    let color = 'text-red-600';
    
    // LTV:CAC ratio scoring (40% weight)
    if (ltvCacRatio >= 4) score += 40;
    else if (ltvCacRatio >= 3) score += 30;
    else if (ltvCacRatio >= 2) score += 20;
    else score += 10;
    
    // Payback period scoring (35% weight)
    if (paybackMonths <= 12) score += 35;
    else if (paybackMonths <= 18) score += 25;
    else if (paybackMonths <= 24) score += 15;
    else score += 5;
    
    // Contribution margin scoring (25% weight)
    if (contributionMargin >= 0.8) score += 25;
    else if (contributionMargin >= 0.7) score += 20;
    else if (contributionMargin >= 0.6) score += 15;
    else score += 10;
    
    if (score >= 85) { status = 'excellent'; color = 'text-green-600'; }
    else if (score >= 70) { status = 'good'; color = 'text-blue-600'; }
    else if (score >= 55) { status = 'fair'; color = 'text-yellow-600'; }
    else if (score >= 40) { status = 'poor'; color = 'text-orange-600'; }
    else { status = 'critical'; color = 'text-red-600'; }
    
    return { score, status, color };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Unit Economics Dashboard</h2>
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {currentScenario} Scenario
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Analysis Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Blended CAC</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(blendedMetrics.weightedCAC)}</div>
                <div className="text-xs text-blue-600 mt-1">Customer Acquisition Cost</div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Blended LTV</div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(blendedMetrics.weightedLTV)}</div>
                <div className="text-xs text-green-600 mt-1">Customer Lifetime Value</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">LTV:CAC Ratio</div>
                <div className="text-2xl font-bold text-purple-900">{blendedMetrics.ltvCacRatio.toFixed(1)}:1</div>
                <div className="text-xs text-purple-600 mt-1">
                  {blendedMetrics.ltvCacRatio >= 3 ? 'Excellent' : blendedMetrics.ltvCacRatio >= 2 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium">Payback Period</div>
                <div className="text-2xl font-bold text-orange-900">{blendedMetrics.paybackMonths.toFixed(1)}mo</div>
                <div className="text-xs text-orange-600 mt-1">
                  {blendedMetrics.paybackMonths <= 12 ? 'Excellent' : blendedMetrics.paybackMonths <= 18 ? 'Good' : 'High Risk'}
                </div>
              </div>
              <ArrowUpRight className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Segment Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Segment Analysis</h3>
        <div className="flex flex-wrap gap-2">
          {segments.map((segment) => (
            <button
              key={segment.key}
              onClick={() => setSelectedSegment(segment.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedSegment === segment.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: selectedSegment === segment.key ? segment.color : undefined,
                borderColor: selectedSegment === segment.key ? segment.color : undefined
              }}
            >
              {segment.icon}
              {segment.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Segment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {segments.find(s => s.key === selectedSegment)?.name} Metrics
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Acquisition Cost</span>
              <span className="font-semibold">{formatCurrency(selectedSegmentData.acquisitionCost)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Lifetime Value</span>
              <span className="font-semibold">{formatCurrency(selectedSegmentData.lifetimeValue)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">LTV:CAC Ratio</span>
              <span className="font-semibold">
                {selectedSegmentData.acquisitionCost > 0 ? 
                  (selectedSegmentData.lifetimeValue / selectedSegmentData.acquisitionCost).toFixed(1) : '∞'}:1
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payback Period</span>
              <span className="font-semibold">{selectedSegmentData.paybackMonths.toFixed(1)} months</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contribution Margin</span>
              <span className="font-semibold">{formatPercent(selectedSegmentData.contributionMargin)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Annual Churn Rate</span>
              <span className="font-semibold">{formatPercent(selectedSegmentData.churnRate)}</span>
            </div>

            {/* Health Score */}
            {(() => {
              const ltvCac = selectedSegmentData.acquisitionCost > 0 ? 
                selectedSegmentData.lifetimeValue / selectedSegmentData.acquisitionCost : 0;
              const health = getHealthScore(ltvCac, selectedSegmentData.paybackMonths, selectedSegmentData.contributionMargin);
              
              return (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Health Score</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${health.color}`}>{health.score}/100</span>
                      {health.status === 'excellent' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {health.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          health.status === 'excellent' ? 'bg-green-500' :
                          health.status === 'good' ? 'bg-blue-500' :
                          health.status === 'fair' ? 'bg-yellow-500' :
                          health.status === 'poor' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${health.score}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-1 ${health.color} capitalize font-medium`}>
                      {health.status}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Segment Performance Chart */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Unit Economics Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearLabel" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'ltvCacRatio' ? `${value.toFixed(1)}:1` : formatCurrency(value),
                    name === 'cac' ? 'CAC' : name === 'ltv' ? 'LTV' : 'LTV:CAC Ratio'
                  ]}
                />
                <Line type="monotone" dataKey="cac" stroke="#ef4444" strokeWidth={2} name="CAC" />
                <Line type="monotone" dataKey="ltv" stroke="#10b981" strokeWidth={2} name="LTV" />
                <Line type="monotone" dataKey="ltvCacRatio" stroke="#3b82f6" strokeWidth={2} name="LTV:CAC Ratio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Intelligence Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Business Intelligence Insights
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium text-blue-800">Strengths</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              {blendedMetrics.ltvCacRatio >= 3 && <li>• Excellent LTV:CAC ratio indicates strong unit economics</li>}
              {blendedMetrics.paybackMonths <= 18 && <li>• Fast payback period reduces cash flow risk</li>}
              <li>• Diversified revenue streams reduce customer concentration risk</li>
              <li>• High contribution margins enable rapid scaling</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium text-blue-800">Optimization Opportunities</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              {blendedMetrics.ltvCacRatio < 3 && <li>• Focus on reducing customer acquisition costs</li>}
              {blendedMetrics.paybackMonths > 18 && <li>• Accelerate customer onboarding and activation</li>}
              <li>• Increase customer lifetime value through upselling</li>
              <li>• Optimize marketing channel allocation for better CAC</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Recommendation:</strong> {
              blendedMetrics.ltvCacRatio >= 3 && blendedMetrics.paybackMonths <= 18 
                ? 'Unit economics are strong - focus on scaling customer acquisition.'
                : blendedMetrics.ltvCacRatio >= 2
                ? 'Good foundation - optimize conversion rates and reduce churn.'
                : 'Critical: Review pricing strategy and acquisition channels immediately.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitEconomics;