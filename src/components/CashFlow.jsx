import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CashFlow = ({ financialData, parameters, currentScenario }) => {
  const [selectedYear, setSelectedYear] = useState(null); // null for yearly view, 0-10 for monthly drill-down
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
    let cumulativeCash = INITIAL_INVESTMENT - PRE_LAUNCH_TECH_INVESTMENT;
    
    // Year 0 - Pre-launch
    yearlyData.push({
      year: 0,
      yearLabel: 'Pre-Launch',
      openingCash: INITIAL_INVESTMENT,
      investments: -PRE_LAUNCH_TECH_INVESTMENT,
      revenue: 0,
      operatingExpenses: 0,
      capex: -projection[0].capex,
      taxes: 0,
      netCashFlow: -PRE_LAUNCH_TECH_INVESTMENT - projection[0].capex,
      closingCash: cumulativeCash - projection[0].capex,
      burnRate: (PRE_LAUNCH_TECH_INVESTMENT + projection[0].capex) / 12,
      runwayMonths: cumulativeCash > 0 ? Math.floor((cumulativeCash - projection[0].capex) / ((PRE_LAUNCH_TECH_INVESTMENT + projection[0].capex) / 12)) : 0
    });
    
    cumulativeCash = yearlyData[0].closingCash;
    
    // Years 1-10
    for (let year = 1; year <= 10; year++) {
      const yearProjection = projection[year];
      const revenue = yearProjection.revenue.total;
      const operatingExpenses = yearProjection.costs.total;
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

  // Calculate monthly cash flow for a specific year
  const getMonthlyData = (year) => {
    if (!showMonthly || selectedYear === null) return [];
    
    const yearData = cashFlowData[year];
    const monthlyData = [];
    const yearProjection = financialData.projection[year];
    
    // For Year 0, it's just the initial investments
    if (year === 0) {
      for (let month = 1; month <= 12; month++) {
        monthlyData.push({
          month,
          monthLabel: `Month ${month}`,
          revenue: 0,
          expenses: month <= 6 ? -PRE_LAUNCH_TECH_INVESTMENT / 6 : 0,
          capex: month === 12 ? -yearProjection.capex : 0,
          netCashFlow: month <= 6 ? -PRE_LAUNCH_TECH_INVESTMENT / 6 : (month === 12 ? -yearProjection.capex : 0),
          closingCash: INITIAL_INVESTMENT - (PRE_LAUNCH_TECH_INVESTMENT * Math.min(month, 6) / 6) - (month === 12 ? yearProjection.capex : 0)
        });
      }
      return monthlyData;
    }
    
    // For operational years, we need to consider ramp-up
    const monthlyRevenue = yearData.revenue / 12;
    const monthlyExpenses = Math.abs(yearData.operatingExpenses) / 12;
    const monthlyTaxes = Math.abs(yearData.taxes) / 12;
    let runningCash = yearData.openingCash;
    
    // Apply ramp-up factors for early years
    const rampFactors = year === 1 ? 
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1, 1, 1] :
      year === 2 ?
      [0.8, 0.85, 0.9, 0.95, 1, 1, 1, 1, 1, 1, 1, 1] :
      Array(12).fill(1);
    
    for (let month = 1; month <= 12; month++) {
      const rampFactor = rampFactors[month - 1];
      const revenue = monthlyRevenue * rampFactor;
      const expenses = -monthlyExpenses; // Always full expenses
      const taxes = revenue > monthlyExpenses ? -monthlyTaxes * rampFactor : 0;
      const capex = month === 6 && yearData.capex ? yearData.capex : 0;
      
      const netCashFlow = revenue + expenses + taxes + capex;
      runningCash += netCashFlow;
      
      monthlyData.push({
        month,
        monthLabel: `Month ${month}`,
        revenue,
        expenses,
        taxes,
        capex,
        netCashFlow,
        closingCash: runningCash
      });
    }
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData(selectedYear);
  
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
            {cashFlowData.map((yearData, index) => (
              <tr key={yearData.year} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {yearData.yearLabel}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(yearData.openingCash)}
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
                  {yearData.year > 0 && (
                    <button
                      onClick={() => {
                        setSelectedYear(yearData.year);
                        setShowMonthly(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Detail (if selected) */}
      {showMonthly && selectedYear !== null && monthlyData.length > 0 && (
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
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CAPEX
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Flow
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cash Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.monthLabel}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      {month.revenue > 0 ? formatCurrency(month.revenue) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      {month.expenses ? formatCurrency(month.expenses) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                      {month.taxes ? formatCurrency(month.taxes) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                      {month.capex ? formatCurrency(month.capex) : '-'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.netCashFlow)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${
                      month.closingCash >= 0 ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.closingCash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Investment Analysis</h4>
              <p className="text-sm text-blue-700 mt-1">
                Initial investment of {formatCurrency(INITIAL_INVESTMENT)} reaches cash flow positive in 
                {cashPositive ? ` Year ${cashPositive.year}` : ' the projection period'}.
                Peak funding requirement is {formatCurrency(peakFunding)}.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Return Profile</h4>
              <p className="text-sm text-green-700 mt-1">
                By Year 10, cash balance of {formatCurrency(finalYearData.closingCash)} represents a 
                {finalYearData.closingCash > INITIAL_INVESTMENT 
                  ? ` ${((finalYearData.closingCash / INITIAL_INVESTMENT - 1) * 100).toFixed(0)}% cash return` 
                  : ' strong value creation opportunity'}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;