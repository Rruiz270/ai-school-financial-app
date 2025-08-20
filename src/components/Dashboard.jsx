import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { SCENARIO_PRESETS } from '../utils/financialModel';

const Dashboard = ({ financialData, onScenarioChange, currentScenario = 'realistic', className = '' }) => {
  const [selectedYear, setSelectedYear] = useState(10);
  
  const { projection, summary } = financialData;
  
  // Chart data preparation
  const revenueChartData = useMemo(() => {
    return projection.slice(1).map(year => ({
      year: year.year,
      flagship: year.revenue.flagship / 1000000,
      franchise: (year.revenue.franchiseRoyalty + year.revenue.franchiseMarketing + year.revenue.franchiseFees) / 1000000,
      adoption: year.revenue.adoption / 1000000,
      kits: year.revenue.kits / 1000000,
      total: year.revenue.total / 1000000,
      ebitda: year.ebitda / 1000000,
      margin: year.ebitdaMargin * 100
    }));
  }, [projection]);

  const studentChartData = useMemo(() => {
    return projection.slice(1).map(year => ({
      year: year.year,
      flagship: year.students.flagship,
      franchise: year.students.franchise,
      adoption: year.students.adoption,
      total: year.students.total
    }));
  }, [projection]);

  const selectedYearData = projection[selectedYear];
  
  const revenueComposition = [
    { name: 'Adoption Licensing', value: selectedYearData.revenue.adoption, color: '#3b82f6' },
    { name: 'Kit Sales', value: selectedYearData.revenue.kits, color: '#10b981' },
    { name: 'Franchise Revenue', value: selectedYearData.revenue.franchiseRoyalty + selectedYearData.revenue.franchiseMarketing + selectedYearData.revenue.franchiseFees, color: '#f59e0b' },
    { name: 'Flagship Tuition', value: selectedYearData.revenue.flagship, color: '#ef4444' }
  ];

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

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const kpiCards = [
    {
      title: 'Year 10 Revenue',
      value: formatCurrency(summary.year10Revenue),
      change: '+1,580%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Year 10 EBITDA',
      value: formatCurrency(summary.year10Ebitda),
      change: `${formatPercentage(summary.year10Ebitda / summary.year10Revenue)} margin`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Students',
      value: formatNumber(summary.year10Students),
      change: `${((summary.year10Students / 9090909) * 100).toFixed(1)}% market share`,
      icon: <Users className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'IRR',
      value: formatPercentage(summary.irr),
      change: `${summary.paybackPeriod} year payback`,
      icon: <Target className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scenario Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Financial Scenarios</h2>
          </div>
          <div className="text-sm text-gray-600">
            Switch between different business projections
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SCENARIO_PRESETS).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => onScenarioChange && onScenarioChange(key, scenario.parameters)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentScenario === key
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${
                  currentScenario === key ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {scenario.name}
                </h3>
                {currentScenario === key && (
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <p className={`text-sm ${
                currentScenario === key ? 'text-primary-700' : 'text-gray-600'
              }`}>
                {scenario.description}
              </p>
              
              {/* Quick preview of key metrics */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Tuition:</span>
                    <div className="font-medium">R${scenario.parameters.flagshipTuition}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Franchises:</span>
                    <div className="font-medium">{scenario.parameters.franchiseCount}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            {/* Title and Icon at the top */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">{kpi.title}</h3>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <span className={kpi.color}>{kpi.icon}</span>
              </div>
            </div>
            
            {/* Main value prominently displayed */}
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
            </div>
            
            {/* Additional info */}
            <div>
              <p className="text-sm text-gray-600">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Growth Projection</h3>
          <div className="text-sm text-gray-600">Values in R$ millions</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toFixed(0)}M`, '']} />
              <Bar dataKey="flagship" stackId="a" fill="#ef4444" name="Flagship" />
              <Bar dataKey="franchise" stackId="a" fill="#f59e0b" name="Franchise" />
              <Bar dataKey="adoption" stackId="a" fill="#3b82f6" name="Adoption" />
              <Bar dataKey="kits" stackId="a" fill="#10b981" name="Kits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EBITDA and Margin Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">EBITDA & Margin Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="ebitda" fill="#3b82f6" name="EBITDA (R$ M)" />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} name="Margin %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Growth Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Growth by Channel</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(value), '']} />
              <Bar dataKey="flagship" stackId="a" fill="#ef4444" name="Flagship" />
              <Bar dataKey="franchise" stackId="a" fill="#f59e0b" name="Franchise" />
              <Bar dataKey="adoption" stackId="a" fill="#3b82f6" name="Adoption" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Composition and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Composition Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Composition</h3>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {[1, 3, 5, 7, 10].map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueComposition}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cumulative EBITDA (10 years)</span>
              <span className="font-semibold">{formatCurrency(summary.cumulativeEbitda)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cumulative Free Cash Flow</span>
              <span className="font-semibold">{formatCurrency(summary.cumulativeFcf)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Net Present Value</span>
              <span className="font-semibold">{formatCurrency(summary.npv)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">CAPEX Scenario</span>
              <span className="font-semibold">{summary.capexScenario.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Initial Investment</span>
              <span className="font-semibold">{formatCurrency(summary.capexScenario.initialCapex)}</span>
            </div>
            
            {/* Break-even indicator */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  Break-even: Year {summary.paybackPeriod}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Scenario Comparison - Year 10 Projections</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Metric</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Pessimistic</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Realistic</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Optimistic</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-700">Total Students</td>
                <td className="text-center py-3 px-4 text-sm">~55,000</td>
                <td className="text-center py-3 px-4 text-sm font-semibold">180,000</td>
                <td className="text-center py-3 px-4 text-sm">327,500</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-700">Revenue</td>
                <td className="text-center py-3 px-4 text-sm">~R$350M</td>
                <td className="text-center py-3 px-4 text-sm font-semibold">~R$1.0B</td>
                <td className="text-center py-3 px-4 text-sm">~R$1.7B</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-700">IRR</td>
                <td className="text-center py-3 px-4 text-sm">~35%</td>
                <td className="text-center py-3 px-4 text-sm font-semibold">~45%</td>
                <td className="text-center py-3 px-4 text-sm">~50%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-700">Flagship Break-even</td>
                <td className="text-center py-3 px-4 text-sm">18-20 months</td>
                <td className="text-center py-3 px-4 text-sm font-semibold">15-18 months</td>
                <td className="text-center py-3 px-4 text-sm">12-15 months</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Currently viewing {currentScenario} scenario. Switch scenarios using the buttons above to see different projections.
          </p>
        </div>
      </div>

      {/* CAPEX Scenario Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">CAPEX Scenario Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Scenario</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Initial CAPEX</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">IRR</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">NPV</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Payback</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">Government Partnership</td>
                <td className="text-right py-3 px-4">{formatCurrency(8000000)}</td>
                <td className="text-right py-3 px-4 text-green-600 font-semibold">48.7%</td>
                <td className="text-right py-3 px-4">{formatCurrency(5128000000)}</td>
                <td className="text-right py-3 px-4">14 months</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">Built-to-Suit</td>
                <td className="text-right py-3 px-4">{formatCurrency(5000000)}</td>
                <td className="text-right py-3 px-4 text-blue-600 font-semibold">45.2%</td>
                <td className="text-right py-3 px-4">{formatCurrency(5098000000)}</td>
                <td className="text-right py-3 px-4">16 months</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Direct Investment</td>
                <td className="text-right py-3 px-4">{formatCurrency(28000000)}</td>
                <td className="text-right py-3 px-4 text-orange-600 font-semibold">38.1%</td>
                <td className="text-right py-3 px-4">{formatCurrency(5078000000)}</td>
                <td className="text-right py-3 px-4">22 months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;