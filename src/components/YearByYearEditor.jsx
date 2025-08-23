import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Building, Edit3 } from 'lucide-react';
import { CAPEX_SCENARIOS } from '../utils/financialModel';

const YearByYearEditor = ({ parameters, onParameterChange, financialData, className = '' }) => {
  const [selectedYear, setSelectedYear] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [inputValues, setInputValues] = useState({});
  
  // Ensure we have data
  if (!parameters || !financialData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Private Sector Year-by-Year Planning...</h3>
          <p className="text-sm text-gray-600">Please wait while we load the financial data.</p>
        </div>
      </div>
    );
  }
  
  const { projection } = financialData;
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value || 0));
  };

  const getYearData = (year) => {
    const yearOverrides = parameters?.yearlyOverrides?.[year] || {};
    const currentYearData = projection?.[year] || {};
    
    return {
      flagshipStudents: yearOverrides.flagshipStudents || (year <= 1 ? 750 : parameters?.flagshipStudents || 1500),
      adoptionStudents: yearOverrides.adoptionStudents || (currentYearData.students?.adoption || 25000),
      tuition: yearOverrides.tuition || ((parameters?.flagshipTuition || 2500) * Math.pow(1 + (parameters?.tuitionIncreaseRate || 0.08), Math.max(0, year - 1))),
      capex: yearOverrides.capex || (year === 0 ? CAPEX_SCENARIOS[parameters?.capexScenario || 'government']?.initialCapex || 8000000 : 0)
    };
  };

  const updateYearData = (year, field, value) => {
    if (!onParameterChange) return;
    
    const newOverrides = {
      ...parameters?.yearlyOverrides,
      [year]: {
        ...parameters?.yearlyOverrides?.[year],
        [field]: value
      }
    };
    onParameterChange({ yearlyOverrides: newOverrides });
    
    // Clear the input value from local state since it's now saved
    const inputKey = `${year}-${field}`;
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[inputKey];
      return newValues;
    });
  };

  const getInputValue = (year, field, currentValue) => {
    const inputKey = `${year}-${field}`;
    return inputValues[inputKey] !== undefined ? inputValues[inputKey] : currentValue;
  };

  const handleInputChange = (year, field, inputValue) => {
    const inputKey = `${year}-${field}`;
    setInputValues(prev => ({ ...prev, [inputKey]: inputValue }));
  };

  const handleInputBlur = (year, field, inputValue) => {
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // Don't update if empty, just clear the input state
      const inputKey = `${year}-${field}`;
      setInputValues(prev => {
        const newValues = { ...prev };
        delete newValues[inputKey];
        return newValues;
      });
    } else {
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue)) {
        updateYearData(year, field, numValue);
      }
    }
  };

  const selectedYearData = getYearData(selectedYear);
  const selectedYearProjection = projection?.[selectedYear] || {};

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Private Sector Year-by-Year Planning</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                editMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <Edit3 className="w-4 h-4 mr-2 inline" />
              {editMode ? 'View Mode' : 'Edit Mode'}
            </button>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            {Array.from({ length: 11 }, (_, i) => i).map(year => (
              <option key={year} value={year}>
                {year === 0 ? 'Pre-Launch (Year 0)' : `Year ${year}`}
              </option>
            ))}
          </select>
          
          <div className="ml-4 text-sm text-gray-600">
            Customize specific year assumptions and see immediate impact on projections
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-blue-900">System Status:</div>
            <div className="text-sm text-blue-700">
              ✓ Financial Model Active • ✓ {projection?.length || 0} Years Projected • ✓ Real-time Updates
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year Planning Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedYear === 0 ? 'Pre-Launch Planning' : `Year ${selectedYear} Planning`}
          </h3>

          <div className="space-y-6">
            {/* Student Planning */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Student Enrollment</h4>
              </div>

              {selectedYear > 0 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Flagship Students</label>
                    {editMode ? (
                      <input
                        type="number"
                        value={getInputValue(selectedYear, 'flagshipStudents', selectedYearData.flagshipStudents)}
                        onChange={(e) => handleInputChange(selectedYear, 'flagshipStudents', e.target.value)}
                        onBlur={(e) => handleInputBlur(selectedYear, 'flagshipStudents', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        max="3000"
                        placeholder="Enter number of students"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-blue-600">{formatNumber(selectedYearData.flagshipStudents)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Adoption Students</label>
                    {editMode ? (
                      <input
                        type="number"
                        value={getInputValue(selectedYear, 'adoptionStudents', selectedYearData.adoptionStudents)}
                        onChange={(e) => handleInputChange(selectedYear, 'adoptionStudents', e.target.value)}
                        onBlur={(e) => handleInputBlur(selectedYear, 'adoptionStudents', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        max="500000"
                        step="5000"
                        placeholder="Enter number of students"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-purple-600">{formatNumber(selectedYearData.adoptionStudents)}</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Building className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Pre-launch phase focuses on setup and preparation</p>
                </div>
              )}
            </div>

            {/* Pricing Planning */}
            {selectedYear > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Pricing Strategy</h4>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Monthly Tuition (R$)</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={getInputValue(selectedYear, 'tuition', Math.round(selectedYearData.tuition))}
                      onChange={(e) => handleInputChange(selectedYear, 'tuition', e.target.value)}
                      onBlur={(e) => handleInputBlur(selectedYear, 'tuition', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                      min="1000"
                      max="8000"
                      step="100"
                      placeholder="Enter tuition amount"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedYearData.tuition)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Investment Planning */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Building className="w-5 h-5 text-orange-600" />
                <h4 className="font-medium text-gray-900">Investment</h4>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {selectedYear === 0 ? 'Initial CAPEX' : 'Additional CAPEX'} (R$)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    value={getInputValue(selectedYear, 'capex', selectedYearData.capex || 0)}
                    onChange={(e) => handleInputChange(selectedYear, 'capex', e.target.value)}
                    onBlur={(e) => handleInputBlur(selectedYear, 'capex', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    max="50000000"
                    step="1000000"
                    placeholder="Enter CAPEX amount"
                  />
                ) : (
                  <div className="text-lg font-semibold text-orange-600">
                    {formatCurrency(selectedYearData.capex || 0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Year Results Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedYear === 0 ? 'Pre-Launch Investment' : `Year ${selectedYear} Projections`}
          </h3>

          {selectedYear > 0 ? (
            <div className="space-y-6">
              {/* Revenue Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Revenue Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Flagship Revenue</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(selectedYearProjection.revenue?.flagship || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Franchise Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency((selectedYearProjection.revenue?.franchiseRoyalty || 0) + (selectedYearProjection.revenue?.franchiseMarketing || 0) + (selectedYearProjection.revenue?.franchiseFees || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Adoption Revenue</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(selectedYearProjection.revenue?.adoption || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kit Sales</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(selectedYearProjection.revenue?.kits || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(selectedYearProjection.revenue?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Financial Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">EBITDA</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(selectedYearProjection.ebitda || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">EBITDA Margin</span>
                    <span className="font-semibold text-blue-600">
                      {((selectedYearProjection.ebitdaMargin || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(selectedYearProjection.students?.total || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Free Cash Flow</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedYearProjection.freeCashFlow || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Impact */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Live Updates</h4>
                <p className="text-sm text-green-700">
                  Changes to this year's parameters will immediately update all charts and projections across the application.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Pre-Launch Investment</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Initial setup and technology development phase
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {formatCurrency(selectedYearData.capex || 0)}
                  </div>
                  <div className="text-sm text-orange-700">Initial CAPEX Investment</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">How to Use Private Sector Year-by-Year Planning:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Private Sector Only</strong> - This planning tool covers flagship school, franchise network, and private adoption model</li>
          <li>• <strong>Select a year</strong> from the dropdown to view or edit that year's assumptions</li>
          <li>• <strong>Toggle Edit Mode</strong> to modify student counts, pricing, or investments for specific years</li>
          <li>• <strong>Changes update instantly</strong> - all charts and projections reflect your year-specific modifications</li>
          <li>• <strong>Public sector planning</strong> is available in the "Public Partnerships" and "Consolidated View" tabs</li>
          <li>• <strong>View results</strong> in the right panel to see the financial impact of your changes</li>
        </ul>
      </div>
    </div>
  );
};

export default YearByYearEditor;