import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Users, Building2, School, GitMerge, Target, Globe } from 'lucide-react';

const ConsolidatedView = ({ privateFinancialData, publicModelData }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('ConsolidatedView received:', {
      privateFinancialData: privateFinancialData?.yearlyData?.length || 'missing',
      publicModelData: Array.isArray(publicModelData) ? publicModelData.length : typeof publicModelData
    });
  }, [privateFinancialData, publicModelData]);
  // Default public model data if not provided
  const defaultPublicData = useMemo(() => {
    const years = [];
    for (let year = 1; year <= 10; year++) {
      const students = Math.floor(50000 * Math.pow(year / 1, 1.8));
      const monthlyRevenue = students * 250 * 12; // R$250/month
      const performanceBonus = monthlyRevenue * 0.15;
      const revenue = monthlyRevenue + performanceBonus;
      const ebitda = revenue * 0.75;
      years.push({ 
        year, 
        students, 
        revenue: {
          total: revenue,
          monthly: monthlyRevenue,
          performance: performanceBonus
        },
        ebitda 
      });
    }
    return years;
  }, []);

  // Process public model data properly
  const publicData = useMemo(() => {
    if (publicModelData && Array.isArray(publicModelData) && publicModelData.length > 0) {
      return publicModelData.map(yearData => ({
        year: yearData.year,
        students: yearData.students,
        revenue: yearData.revenue?.total || yearData.revenue || 0,
        ebitda: yearData.ebitda || 0
      }));
    }
    return defaultPublicData;
  }, [publicModelData, defaultPublicData]);

  const consolidatedData = useMemo(() => {
    // Always try to use private data if available, otherwise create default structure
    const privateData = privateFinancialData?.yearlyData || [];
    
    if (privateData.length === 0) {
      console.warn('Private financial data not available, using defaults');
      // Create basic private data structure for demonstration
      const defaultPrivateData = [];
      for (let year = 1; year <= 10; year++) {
        defaultPrivateData.push({
          year,
          totalStudents: 750 + (year * 25000),
          totalRevenue: 179000000 * year * 1.5,
          ebitda: 179000000 * year * 1.5 * 0.82
        });
      }
      return defaultPrivateData.map((privateYear, index) => {
        const publicYear = publicData[index] || { students: 0, revenue: 0, ebitda: 0 };
        return {
          year: privateYear.year,
          private: {
            students: privateYear.totalStudents,
            revenue: privateYear.totalRevenue,
            ebitda: privateYear.ebitda
          },
          public: {
            students: publicYear.students,
            revenue: publicYear.revenue,
            ebitda: publicYear.ebitda
          },
          total: {
            students: privateYear.totalStudents + publicYear.students,
            revenue: privateYear.totalRevenue + publicYear.revenue,
            ebitda: privateYear.ebitda + publicYear.ebitda
          }
        };
      });
    }

    return privateData.map((privateYear, index) => {
      const publicYear = publicData[index] || { students: 0, revenue: 0, ebitda: 0 };
      
      return {
        year: privateYear.year,
        private: {
          students: privateYear.totalStudents,
          revenue: privateYear.totalRevenue,
          ebitda: privateYear.ebitda
        },
        public: {
          students: publicYear.students,
          revenue: publicYear.revenue,
          ebitda: publicYear.ebitda
        },
        total: {
          students: privateYear.totalStudents + publicYear.students,
          revenue: privateYear.totalRevenue + publicYear.revenue,
          ebitda: privateYear.ebitda + publicYear.ebitda
        }
      };
    });
  }, [privateFinancialData, publicData]);

  const year10Total = consolidatedData[9] || { total: { students: 0, revenue: 0, ebitda: 0 }, private: { students: 0, revenue: 0, ebitda: 0 }, public: { students: 0, revenue: 0, ebitda: 0 } };
  const year5Total = consolidatedData[4] || { total: { students: 0, revenue: 0, ebitda: 0 }, private: { students: 0, revenue: 0, ebitda: 0 }, public: { students: 0, revenue: 0, ebitda: 0 } };
  const year1Total = consolidatedData[0] || { total: { students: 0, revenue: 0, ebitda: 0 }, private: { students: 0, revenue: 0, ebitda: 0 }, public: { students: 0, revenue: 0, ebitda: 0 } };

  // Handle empty data - only show loading if we have no data at all
  if (!consolidatedData || consolidatedData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Consolidated Business Model</h2>
              <p className="mt-2 opacity-90">
                Loading consolidated data...
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">---</div>
              <div className="text-sm opacity-90">Calculating...</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <GitMerge className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Financial Data</h3>
          <p className="text-gray-500">
            Please wait while we process the private and public sector financial models...
          </p>
        </div>
      </div>
    );
  }

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

  const calculateCAGR = (endValue, startValue, years) => {
    if (!startValue || startValue <= 0) return '0.0';
    return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6 relative">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] select-none">
        <div className="transform -rotate-45 text-gray-500 text-6xl font-bold whitespace-nowrap">
          RAPHAEL RUIZ • PROJECT OWNER • CONFIDENTIAL • AI SCHOOL BRAZIL
        </div>
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Consolidated Business Model</h2>
            <p className="mt-2 opacity-90">
              Complete view: Private Sector + Public Partnerships across Brazil's 55.7M total K-12 students
            Including expanded coverage in Paraná and Santa Catarina states
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatNumber(year10Total.total.students)}</div>
            <div className="text-sm opacity-90">Total Students by Year 10</div>
            <div className="text-lg font-semibold mt-1">
              {((year10Total.total.students / 55700000) * 100).toFixed(1)}% Market Share
            </div>
          </div>
        </div>
      </div>

      {/* Master KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Year 10 Revenue</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(year10Total.total.revenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {calculateCAGR(year10Total.total.revenue, year1Total.total.revenue, 10)}% CAGR
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Year 10 EBITDA</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(year10Total.total.ebitda)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {((year10Total.total.ebitda / year10Total.total.revenue) * 100).toFixed(1)}% EBITDA Margin
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Penetration</p>
              <p className="text-2xl font-bold text-pink-600">
                {((year10Total.total.students / 55700000) * 100).toFixed(1)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-pink-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Of Brazil's total 55.7M K-12 students
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Multiple</p>
              <p className="text-2xl font-bold text-green-600">
                {year1Total.total.revenue > 0 ? (year10Total.total.revenue / year1Total.total.revenue).toFixed(1) : '0'}x
              </p>
            </div>
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Growth from Year 1 to Year 10
          </div>
        </div>
      </div>

      {/* Sector Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Private vs Public Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Sector (Year 10)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <School className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Private Sector</div>
                  <div className="text-sm text-gray-600">{formatNumber(year10Total.private.students)} students</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(year10Total.private.revenue)}
                </div>
                <div className="text-sm text-gray-500">
                  {((year10Total.private.revenue / year10Total.total.revenue) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="font-semibold text-gray-900">Public Partnerships</div>
                  <div className="text-sm text-gray-600">{formatNumber(year10Total.public.students)} students</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600">
                  {formatCurrency(year10Total.public.revenue)}
                </div>
                <div className="text-sm text-gray-500">
                  {((year10Total.public.revenue / year10Total.total.revenue) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center space-x-3">
                <GitMerge className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-bold text-gray-900">Total Business</div>
                  <div className="text-sm text-gray-600">{formatNumber(year10Total.total.students)} students</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(year10Total.total.revenue)}
                </div>
                <div className="text-sm text-purple-600 font-semibold">
                  Combined Revenue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trajectory Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Milestones</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold text-gray-900">Years 1-3: Private Sector Foundation</div>
              <div className="text-sm text-gray-600 mt-1">
                Flagship school validation, franchise development, early adoption model
              </div>
              <div className="text-sm font-semibold text-blue-600 mt-2">
                Year 3: {formatCurrency(consolidatedData[2].private.revenue)} private revenue
              </div>
            </div>

            <div className="border-l-4 border-emerald-500 pl-4">
              <div className="font-semibold text-gray-900">Years 3-6: Public Pilot Launch</div>
              <div className="text-sm text-gray-600 mt-1">
                Municipal partnerships, teacher training, proof-of-concept scaling
              </div>
              <div className="text-sm font-semibold text-emerald-600 mt-2">
                Year 6: {formatCurrency(consolidatedData[5].public.revenue)} public revenue
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <div className="font-semibold text-gray-900">Years 7-10: Market Dominance</div>
              <div className="text-sm text-gray-600 mt-1">
                Public sector becomes largest revenue stream, national expansion
              </div>
              <div className="text-sm font-semibold text-purple-600 mt-2">
                Year 10: {formatCurrency(year10Total.total.revenue)} total revenue
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Financial Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10-Year Consolidated Projection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Private Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Private Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total EBITDA</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consolidatedData.map((yearData) => (
                <tr key={yearData.year} className={yearData.year % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Year {yearData.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {formatNumber(yearData.private.students)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                    {formatNumber(yearData.public.students)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                    {formatNumber(yearData.total.students)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {formatCurrency(yearData.private.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                    {formatCurrency(yearData.public.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                    {formatCurrency(yearData.total.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(yearData.total.ebitda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Target className="w-6 h-6 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-900 mb-3">Consolidated Strategy Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-indigo-800 mb-2">Market Dominance Strategy</h5>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Phase 1 (Years 1-3): Private sector validation & cash generation</li>
                  <li>• Phase 2 (Years 4-6): Public pilot partnerships & scaling</li>
                  <li>• Phase 3 (Years 7-10): Public sector dominance & national reach</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-indigo-800 mb-2">Financial Highlights</h5>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Year 10: {formatCurrency(year10Total.total.revenue)} total revenue</li>
                  <li>• 10-year CAGR: {calculateCAGR(year10Total.total.revenue, year1Total.total.revenue, 10)}%</li>
                  <li>• Market penetration: {((year10Total.total.students / 55700000) * 100).toFixed(1)}% of Brazil K-12</li>
                  <li>• Democratizing AI education across all socioeconomic levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedView;