import React from 'react';
import { GitMerge, TrendingUp, Users, Calendar, AlertTriangle } from 'lucide-react';

const SimpleIntegrated = ({ financialData }) => {
  const year1Revenue = financialData && financialData[0] ? financialData[0].revenue?.total : 154000000;
  const year10Revenue = financialData && financialData[9] ? financialData[9].revenue?.total : 8300000000;
  const daysToLaunch = Math.ceil((new Date('2027-01-15') - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <GitMerge className="w-7 h-7 mr-3 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI School Brazil - Integrated Dashboard</h2>
            <p className="text-gray-600">Financial Model + Launch Control Integration</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Days to Launch</p>
              <p className="text-3xl font-bold">{daysToLaunch}</p>
              <p className="text-blue-100 text-sm mt-1">January 15, 2027</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Year 1 Revenue</p>
              <p className="text-3xl font-bold">R$ {(year1Revenue / 1000000).toFixed(0)}M</p>
              <p className="text-green-100 text-sm mt-1">Private Sector</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Year 10 Revenue</p>
              <p className="text-3xl font-bold">R$ {(year10Revenue / 1000000000).toFixed(1)}B</p>
              <p className="text-purple-100 text-sm mt-1">Private + Public</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Launch Status</p>
              <p className="text-3xl font-bold">12%</p>
              <p className="text-orange-100 text-sm mt-1">Overall Progress</p>
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Control Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Funding & Finance</span>
              <span className="text-green-600 font-bold">75%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-gray-900">Construction</span>
              <span className="text-orange-600 font-bold">60%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-900">Technology</span>
              <span className="text-blue-600 font-bold">25%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Projections</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Series A Funding</span>
              <span className="text-gray-600">R$ 20M Target</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Year 1 Students</span>
              <span className="text-gray-600">750 Target</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Break-even</span>
              <span className="text-gray-600">Month 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
          <h3 className="text-lg font-semibold text-red-900">Critical Actions Required</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Series A Fundraising</h4>
            <p className="text-sm text-gray-600">Close R$ 20M funding by November 2025</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Government Building</h4>
            <p className="text-sm text-gray-600">Finalize partnership agreement for flagship school</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Head of School</h4>
            <p className="text-sm text-gray-600">Hire leadership team by October 2025</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Technology Platform</h4>
            <p className="text-sm text-gray-600">Complete INCEPT MVP by March 2026</p>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Connected</div>
            <div className="text-sm text-blue-700">Financial Model</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Demo Mode</div>
            <div className="text-sm text-blue-700">Launch Control</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Real-time</div>
            <div className="text-sm text-blue-700">Data Sync</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleIntegrated;