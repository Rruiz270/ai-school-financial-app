import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Wallet, Users, Building, GraduationCap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CashFlow = ({ financialData, parameters, currentScenario, publicModelData, currentPublicScenario }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthly, setShowMonthly] = useState(false);
  
  const INITIAL_INVESTMENT = 30000000; // R$30M initial cash
  const PRE_LAUNCH_TECH_INVESTMENT = 3000000; // R$3M tech investment before Year 1
  
  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absValue);
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatCompactCurrency = (value) => {
    const absValue = Math.abs(value);
    const millions = absValue / 1000000;
    const formatted = millions >= 1 
      ? `R$${millions.toFixed(1)}M` 
      : `R$${(absValue / 1000).toFixed(0)}K`;
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  // Calculate cash flow data
  const cashFlowData = useMemo(() => {
    const { projection } = financialData;
    const yearlyData = [];
    
    // Calculate pre-launch year expenses
    const preLaunchExpenses = PRE_LAUNCH_TECH_INVESTMENT + // Tech: R$3M
                              (100000 * 12) + // Founder salaries: R$1.2M
                              (200000 * 10) + // Curriculum: R$2M (months 3-12)
                              50000 + // Legal setup
                              150000 + // Market research (2 months)
                              200000 + // Branding (2 months)
                              150000; // Office setup
    
    // Year 0 - Pre-launch
    const year0NetCashFlow = -preLaunchExpenses - projection[0].capex;
    const year0ClosingCash = INITIAL_INVESTMENT + year0NetCashFlow;
    
    yearlyData.push({
      year: 0,
      yearLabel: 'Pre-Launch',
      openingCash: 0, // Start with zero, investment is shown separately
      investments: INITIAL_INVESTMENT,
      revenue: 0,
      operatingExpenses: -preLaunchExpenses,
      capex: -projection[0].capex,
      taxes: 0,
      netCashFlow: INITIAL_INVESTMENT + year0NetCashFlow, // Include investment in net cash flow
      closingCash: year0ClosingCash,
      burnRate: Math.abs(preLaunchExpenses + projection[0].capex) / 12,
      runwayMonths: year0ClosingCash > 0 ? Math.floor(year0ClosingCash / (Math.abs(preLaunchExpenses + projection[0].capex) / 12)) : 0
    });
    
    let cumulativeCash = year0ClosingCash;
    
    // Years 1-10
    for (let year = 1; year <= 10; year++) {
      const yearProjection = projection[year];
      // Add government revenue if applicable
      const privateRevenue = yearProjection.revenue.total;
      // Add public adoption revenue if applicable (year 2 onwards)
      // Use the government payment per student per month from scenario
      const publicAdoptionRevenue = year >= 2 && publicModelData && publicModelData[year-1] ? 
        (publicModelData[year-1].students || 0) * 
        (currentPublicScenario === 'optimistic' ? 250 : 
         currentPublicScenario === 'pessimistic' ? 175 : 212) * 12 : 0;
      const revenue = privateRevenue + publicAdoptionRevenue;
      // Add public sector costs if applicable (36% of public revenue for realistic scenario)
      const publicCosts = year >= 2 && publicModelData && publicModelData[year-1] ? 
        publicAdoptionRevenue * (currentPublicScenario === 'optimistic' ? 0.25 : 
                                 currentPublicScenario === 'pessimistic' ? 0.47 : 0.36) : 0;
      const operatingExpenses = yearProjection.costs.total + publicCosts;
      const capex = yearProjection.capex || 0;
      const taxes = yearProjection.taxes || 0;
      
      const operatingCashFlow = revenue - operatingExpenses;
      const netCashFlow = operatingCashFlow - capex - taxes;
      const closingCash = cumulativeCash + netCashFlow;
      
      const monthlyBurn = netCashFlow < 0 ? Math.abs(netCashFlow) / 12 : 0;
      const runwayMonths = closingCash > 0 && monthlyBurn > 0 
        ? Math.floor(closingCash / monthlyBurn)
        : closingCash > 0 ? 999 : 0;
      
      yearlyData.push({
        year,
        yearLabel: `Year ${year}`,
        openingCash: cumulativeCash,
        revenue,
        operatingExpenses: -operatingExpenses,
        capex: -capex,
        taxes: -taxes,
        operatingCashFlow,
        netCashFlow,
        closingCash,
        burnRate: monthlyBurn,
        runwayMonths
      });
      
      cumulativeCash = closingCash;
    }
    
    return yearlyData;
  }, [financialData]);

  // Calculate detailed monthly cash flow
  const getMonthlyDetailedData = (year) => {
    if (!showMonthly || selectedYear === null) return [];
    
    const yearData = cashFlowData[year];
    const monthlyData = [];
    const yearProjection = financialData.projection[year];
    // For Year 0, start with 0 and add investment in month 1
    let runningCash = year === 0 ? 0 : yearData.openingCash;
    
    // For Year 0, it's pre-launch investments
    if (year === 0) {
      for (let month = 1; month <= 12; month++) {
        const details = {
          month,
          monthLabel: `Month ${month}`,
          inflows: {
            investorFunding: month === 1 ? INITIAL_INVESTMENT : 0,
            total: month === 1 ? INITIAL_INVESTMENT : 0
          },
          outflows: {
            techDevelopment: PRE_LAUNCH_TECH_INVESTMENT / 12, // Spread over 12 months
            founderSalaries: 100000, // R$100k/month throughout
            curriculumDevelopment: month >= 3 ? 200000 : 0, // R$200k/month starting month 3
            legalSetup: month === 2 ? 50000 : 0,
            marketResearch: month >= 3 && month <= 4 ? 75000 : 0,
            brandingDesign: month >= 5 && month <= 6 ? 100000 : 0,
            officeSetup: month === 9 ? 150000 : 0,
            capex: month === 12 ? yearProjection.capex : 0,
            total: 0
          }
        };
        
        details.outflows.total = Object.values(details.outflows).reduce((sum, val) => sum + val, 0) - details.outflows.total;
        const netFlow = details.inflows.total - details.outflows.total;
        runningCash += netFlow;
        
        details.netCashFlow = netFlow;
        details.closingCash = runningCash;
        monthlyData.push(details);
      }
      return monthlyData;
    }
    
    // For operational years - use actual cost breakdown from model
    const students = yearProjection?.students || {};
    const revenue = yearProjection?.revenue || {};
    const costs = yearProjection?.costs || {};
    
    // Apply ramp-up for early years
    const revenueRampFactors = year === 1 ? 
      [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1] :
      year === 2 ?
      [0.8, 0.85, 0.9, 0.95, 0.95, 1, 1, 1, 1, 1, 1, 1] :
      Array(12).fill(1);
    
    for (let month = 1; month <= 12; month++) {
      const rampFactor = revenueRampFactors[month - 1];
      
      const details = {
        month,
        monthLabel: `Month ${month}`,
        inflows: {
          flagshipTuition: (revenue.flagship || 0) / 12 * rampFactor,
          franchiseFees: month === 1 || month === 7 ? (revenue.franchiseFees || 0) / 2 : 0,
          franchiseRoyalties: (revenue.franchiseRoyalty || 0) / 12,
          franchiseMarketing: (revenue.franchiseMarketing || 0) / 12,
          // Private adoption fees (monthly)
          adoptionFeesPrivate: (revenue.adoption || 0) / 12 * rampFactor,
          // Public adoption fees (monthly) - starts year 2
          // Government pays per student per month based on scenario
          adoptionFeesPublic: year >= 2 && publicModelData && publicModelData[year-1] ? 
            (publicModelData[year-1].students || 0) * 
            (currentPublicScenario === 'optimistic' ? 250 : 
             currentPublicScenario === 'pessimistic' ? 175 : 212) * rampFactor : 0,
          // Kit sales - ONLY flagship and franchise, ALL in January
          kitSales: month === 1 ? 
            ((students.flagship || 0) + (students.franchise || 0)) * 
            (yearProjection.pricing?.kitCost || parameters.kitCostPerStudent) : 0,
          total: 0
        },
        outflows: {
          // Staff costs from model
          corporateStaff: (costs.staffCorporate || 0) / 12,
          flagshipStaff: (costs.staffFlagship || 0) / 12,
          franchiseSupport: (costs.staffFranchiseSupport || 0) / 12,
          adoptionSupport: (costs.staffAdoptionSupport || 0) / 12,
          
          // Operating expenses
          technology: (costs.technologyOpex || 0) / 12,
          marketing: (costs.marketing || 0) / 12 * (month <= 6 && year === 1 ? 1.5 : 1),
          facilities: (costs.facilities || 0) / 12,
          
          // Educational costs
          curriculum: (costs.curriculum || 0) / 12,
          studentSupport: (costs.studentSupport || 0) / 12,
          parentEngagement: (costs.parentEngagement || 0) / 12,
          teacherTraining: (costs.teacherTraining || 0) / 12,
          
          // Compliance & Quality
          qualityAssurance: (costs.qualityAssurance || 0) / 12,
          regulatory: (costs.regulatoryCompliance || 0) / 12,
          dataManagement: (costs.dataManagement || 0) / 12,
          legal: (costs.legal || 0) / 12,
          
          // Other
          insurance: month === 1 ? (costs.insurance || 0) : 0,
          travel: (costs.travel || 0) / 12,
          workingCapital: (costs.workingCapital || 0) / 12,
          contingency: (costs.contingency || 0) / 12,
          
          // Taxes and CAPEX
          taxes: (yearProjection.taxes || 0) / 12 * rampFactor,
          capex: month === 6 && yearProjection.capex ? yearProjection.capex : 0,
          
          total: 0
        },
        
        // Headcount estimates (scenario-adjusted)
        headcount: {
          flagship: {
            // Teacher ratio varies by scenario: pessimistic 1:30, realistic 1:25, optimistic 1:20
            teachers: students.flagship ? Math.ceil(students.flagship * rampFactor / 
              (currentScenario === 'pessimistic' ? 30 : currentScenario === 'optimistic' ? 20 : 25)) : 0,
            support: students.flagship ? Math.ceil(students.flagship * rampFactor / 200) : 0
          },
          corporate: {
            executives: year === 1 ? 3 : Math.min(5, 3 + Math.floor(year / 3)),
            tech: Math.min(20, 5 + year * 1.5),
            sales: Math.min(15, 3 + yearProjection.franchiseCount * 0.2),
            operations: Math.min(10, 3 + year)
          },
          franchiseTeam: yearProjection.franchiseCount ? Math.max(2, Math.ceil(yearProjection.franchiseCount / 10)) : 0,
          adoptionTeam: students.adoption ? Math.max(3, Math.ceil(students.adoption / 25000)) : 0
        },
        
        // Student numbers
        students: {
          flagship: students.flagship || 0,
          franchise: (students.franchise || 0),
          adoption: students.adoption || 0,
          total: students.total || 0
        }
      };
      
      // Calculate totals
      details.inflows.total = Object.values(details.inflows).reduce((sum, val) => sum + val, 0) - details.inflows.total;
      details.outflows.total = Object.values(details.outflows).reduce((sum, val) => sum + val, 0) - details.outflows.total;
      
      const netFlow = details.inflows.total - details.outflows.total;
      runningCash += netFlow;
      
      details.netCashFlow = netFlow;
      details.closingCash = runningCash;
      monthlyData.push(details);
    }
    
    return monthlyData;
  };
  
  const monthlyData = useMemo(() => {
    const detailed = getMonthlyDetailedData(selectedYear);
    if (!detailed || detailed.length === 0) return [];
    
    return detailed.map(month => ({
      month: month.month,
      monthLabel: month.monthLabel,
      revenue: month.inflows.total,
      expenses: -month.outflows.total + (month.outflows.taxes || 0) + (month.outflows.capex || 0),
      taxes: month.outflows.taxes ? -month.outflows.taxes : 0,
      capex: month.outflows.capex ? -month.outflows.capex : 0,
      netCashFlow: month.netCashFlow,
      closingCash: month.closingCash
    }));
  }, [selectedYear, showMonthly]);
  
  // Key metrics
  const finalYearData = cashFlowData[cashFlowData.length - 1];
  const cashPositive = cashFlowData.find(d => d.netCashFlow > 0);
  const lowestCash = Math.min(...cashFlowData.map(d => d.closingCash));
  const peakFunding = INITIAL_INVESTMENT - lowestCash;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Cash Flow Analysis</h2>
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {currentScenario} Scenario
            </span>
          </div>
          <button
            onClick={() => {
              setShowMonthly(false);
              setSelectedYear(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              !showMonthly 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yearly View
          </button>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Initial Investment</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(INITIAL_INVESTMENT)}</div>
            <div className="text-xs text-gray-500 mt-1">Including R$3M pre-launch tech</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Cash Positive From</div>
            <div className="text-lg font-bold text-blue-900">
              {cashPositive ? `Year ${cashPositive.year}` : 'Not in projection'}
            </div>
            <div className="text-xs text-blue-500 mt-1">Operating cash flow positive</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Year 10 Cash Balance</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(finalYearData.closingCash)}</div>
            <div className="text-xs text-green-500 mt-1">
              {finalYearData.closingCash > INITIAL_INVESTMENT ? 'Above initial investment' : 'Building value'}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600">Peak Funding Need</div>
            <div className="text-lg font-bold text-orange-900">{formatCurrency(peakFunding)}</div>
            <div className="text-xs text-orange-500 mt-1">Maximum capital deployed</div>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {showMonthly && selectedYear !== null 
            ? `Year ${selectedYear} Monthly Cash Flow` 
            : 'Yearly Cash Position'}
        </h3>
        <div className="h-80">
          {!showMonthly ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearLabel" />
                <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={INITIAL_INVESTMENT} stroke="#3b82f6" strokeDasharray="3 3" label="Initial Investment" />
                <Line 
                  type="monotone" 
                  dataKey="closingCash" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Cash Balance"
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" stackId="a" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" stackId="a" />
                <Bar dataKey="taxes" fill="#f59e0b" name="Taxes" stackId="a" />
                <Bar dataKey="capex" fill="#6366f1" name="CAPEX" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Yearly Cash Flow Table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Details</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opening Cash
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operating Exp
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CAPEX
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taxes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Cash Flow
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closing Cash
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cashFlowData.map((yearData) => (
              <tr key={yearData.year} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {yearData.yearLabel}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(yearData.openingCash)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                  {yearData.investments > 0 ? formatCurrency(yearData.investments) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  {yearData.revenue > 0 ? formatCurrency(yearData.revenue) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  {yearData.operatingExpenses ? formatCurrency(yearData.operatingExpenses) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                  {yearData.capex ? formatCurrency(yearData.capex) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                  {yearData.taxes ? formatCurrency(yearData.taxes) : '-'}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                  yearData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(yearData.netCashFlow)}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${
                  yearData.closingCash >= 0 ? 'text-gray-900' : 'text-red-600'
                }`}>
                  {formatCurrency(yearData.closingCash)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => {
                      setSelectedYear(yearData.year);
                      setShowMonthly(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Detail */}
      {showMonthly && selectedYear !== null && getMonthlyDetailedData(selectedYear).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Year {selectedYear} Monthly Breakdown
            </h3>
            <button
              onClick={() => {
                setShowMonthly(false);
                setSelectedYear(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              ← Back to Yearly View
            </button>
          </div>
          
          <div className="space-y-6">
            {getMonthlyDetailedData(selectedYear).map((month) => (
              <div key={month.month} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{month.monthLabel}</h4>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${
                      month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Net: {formatCurrency(month.netCashFlow)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      Balance: {formatCurrency(month.closingCash)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inflows */}
                  <div>
                    <h5 className="font-semibold text-green-700 mb-3 flex items-center justify-between">
                      <span>💰 Inflows</span>
                      <span className="text-green-600">{formatCurrency(month.inflows.total)}</span>
                    </h5>
                    <div className="space-y-2">
                      {selectedYear === 0 && month.month === 1 && month.inflows.investorFunding > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Investor Funding</span>
                          <span className="text-green-600 font-medium">{formatCurrency(month.inflows.investorFunding)}</span>
                        </div>
                      )}
                      {month.inflows.flagshipTuition > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Flagship Tuition</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.flagshipTuition)}</span>
                        </div>
                      )}
                      {month.inflows.franchiseFees > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Franchise Fees</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.franchiseFees)}</span>
                        </div>
                      )}
                      {(month.inflows.franchiseRoyalties > 0 || month.inflows.franchiseMarketing > 0) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Franchise Royalties & Marketing</span>
                          <span className="text-green-600">
                            {formatCurrency((month.inflows.franchiseRoyalties || 0) + (month.inflows.franchiseMarketing || 0))}
                          </span>
                        </div>
                      )}
                      {month.inflows.adoptionFeesPrivate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Adoption License Fees (Private)</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.adoptionFeesPrivate)}</span>
                        </div>
                      )}
                      {month.inflows.adoptionFeesPublic > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Adoption License Fees (Public)</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.adoptionFeesPublic)}</span>
                        </div>
                      )}
                      {month.inflows.kitSales > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kit Sales (Flagship & Franchise)</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.kitSales)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Outflows */}
                  <div>
                    <h5 className="font-semibold text-red-700 mb-3 flex items-center justify-between">
                      <span>💸 Outflows</span>
                      <span className="text-red-600">{formatCurrency(month.outflows.total)}</span>
                    </h5>
                    <div className="space-y-2">
                      {/* Staff Costs */}
                      {selectedYear > 0 && (month.outflows.corporateStaff > 0 || month.outflows.flagshipStaff > 0) && (
                        <div className="border-t border-gray-100 pt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">Staff Costs:</div>
                          {month.outflows.corporateStaff > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Corporate Team</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.corporateStaff)}</span>
                            </div>
                          )}
                          {month.outflows.flagshipStaff > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Flagship Staff</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.flagshipStaff)}</span>
                            </div>
                          )}
                          {month.outflows.franchiseSupport > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Franchise Support</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.franchiseSupport)}</span>
                            </div>
                          )}
                          {month.outflows.adoptionSupport > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Adoption Support</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.adoptionSupport)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pre-launch expenses */}
                      {selectedYear === 0 && (
                        <>
                          {month.outflows.techDevelopment > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tech Development</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.techDevelopment)}</span>
                            </div>
                          )}
                          {month.outflows.founderSalaries > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Founder Salaries</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.founderSalaries)}</span>
                            </div>
                          )}
                          {month.outflows.legalSetup > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Legal Setup</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.legalSetup)}</span>
                            </div>
                          )}
                          {month.outflows.marketResearch > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Market Research</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.marketResearch)}</span>
                            </div>
                          )}
                          {month.outflows.brandingDesign > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Branding & Design</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.brandingDesign)}</span>
                            </div>
                          )}
                          {month.outflows.officeSetup > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Office Setup</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.officeSetup)}</span>
                            </div>
                          )}
                          {month.outflows.curriculumDevelopment > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Curriculum Development</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.curriculumDevelopment)}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Operating Expenses */}
                      {selectedYear > 0 && (
                        <div className="border-t border-gray-100 pt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">Operating:</div>
                          {month.outflows.technology > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Technology (10%)</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.technology)}</span>
                            </div>
                          )}
                          {month.outflows.marketing > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Marketing (8%)</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.marketing)}</span>
                            </div>
                          )}
                          {month.outflows.facilities > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Facilities</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.facilities)}</span>
                            </div>
                          )}
                          {month.outflows.curriculum > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Curriculum</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.curriculum)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Taxes & CAPEX */}
                      {month.outflows.taxes > 0 && (
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                          <span className="text-gray-600">Corporate Taxes</span>
                          <span className="text-orange-600">{formatCurrency(month.outflows.taxes)}</span>
                        </div>
                      )}
                      {month.outflows.capex > 0 && (
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                          <span className="text-gray-600 font-medium">CAPEX</span>
                          <span className="text-blue-600 font-medium">{formatCurrency(month.outflows.capex)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                {selectedYear > 0 && month.students && (
                  <div className="bg-blue-50 px-4 py-2 border-t border-blue-100">
                    <div className="flex justify-between text-xs text-blue-700">
                      <span>
                        <span className="font-medium">Students:</span> {month.students.flagship} flagship, 
                        {month.students.franchise} franchise, {month.students.adoption} adoption
                      </span>
                      <span>
                        <span className="font-medium">Staff:</span> ~{month.headcount.corporate.executives + 
                        month.headcount.corporate.tech + month.headcount.corporate.sales + 
                        month.headcount.corporate.operations} corporate, 
                        {month.headcount.flagship.teachers} teachers
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;