import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Building, Edit3, RotateCcw, TrendingUp, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { CAPEX_SCENARIOS, SCENARIO_PRESETS } from '../utils/financialModel';

const YearByYearEditor = ({ parameters, onParameterChange, financialData, currentScenario, className = '' }) => {
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
    
    // Calculate default values based on scenario and year, ensuring it reflects the actual model
    const getDefaultFlagshipStudents = () => {
      if (yearOverrides.flagshipStudents !== undefined) return yearOverrides.flagshipStudents;
      if (currentYearData.students?.flagship !== undefined) return currentYearData.students?.flagship;
      
      // Use the same logic as the financial model for year-by-year ramp-up
      if (year === 0) return 0;
      if (year === 1) return 300; // Year 1 is always 300 regardless of scenario
      if (year === 2) return 750; // Year 2 is always 750 regardless of scenario
      return parameters?.flagshipStudents || 1200; // Then it goes to scenario target
    };
    
    const getDefaultAdoptionStudents = () => {
      if (yearOverrides.adoptionStudents !== undefined) return yearOverrides.adoptionStudents;
      if (currentYearData.students?.adoption !== undefined) return currentYearData.students?.adoption;
      
      // Use the same logic as the financial model for adoption ramp-up
      if (year <= 1) return 0; // No adoption in first years
      if (year === 2) return 2500; // Start small in Year 2
      
      // Then grow towards the scenario target
      const targetAdoption = parameters?.adoptionStudents || 150000;
      if (year <= 10) {
        // Linear growth to reach target by year 10
        const growthYears = year - 2;
        return Math.min(
          2500 + (targetAdoption - 2500) * (growthYears / 8),
          targetAdoption
        );
      }
      return targetAdoption;
    };
    
    return {
      flagshipStudents: getDefaultFlagshipStudents(),
      adoptionStudents: getDefaultAdoptionStudents(),
      franchiseCount: yearOverrides.franchiseCount !== undefined ? yearOverrides.franchiseCount : (currentYearData.franchiseCount || 0),
      studentsPerFranchise: yearOverrides.studentsPerFranchise || (parameters?.studentsPerFranchise || 1200),
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

  const resetToScenarioDefaults = () => {
    // Clear all year overrides
    onParameterChange({ yearlyOverrides: {} });
    // Clear any input values
    setInputValues({});
  };

  const selectedYearData = getYearData(selectedYear);
  const selectedYearProjection = projection?.[selectedYear] || {};

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Professional Header Stamp */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 border-2 border-red-400 px-4 py-2 rounded-lg">
              <div className="text-red-700 font-bold text-sm">CONFIDENTIAL</div>
            </div>
            <div className="text-gray-700">
              <div className="font-semibold text-sm">Project Owner: Raphael Ruiz</div>
              <div className="text-xs text-gray-500">AI School Brazil - Year-by-Year Planning</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Private Sector Year-by-Year Planning</h2>
            <div className="ml-4 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full">
              <span className="text-xs font-medium text-blue-800">Scenario: {SCENARIO_PRESETS[currentScenario]?.name || currentScenario}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToScenarioDefaults}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
              title={`Reset all years to ${currentScenario} scenario defaults`}
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Back to Default
            </button>
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
            Customize specific year assumptions and see immediate impact on complete P&L projections
          </div>
          <div className="ml-4 text-xs text-blue-600">
            📊 Now showing complete P&L with all expense categories including 10% technology allocation
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-blue-900">System Status:</div>
            <div className="text-sm text-blue-700">
              ✓ Financial Model Active • ✓ {projection?.length || 0} Years Projected • ✓ Real-time Updates • ✓ {currentScenario.charAt(0).toUpperCase() + currentScenario.slice(1)} Scenario
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
                    {selectedYear <= 2 && (
                      <p className="text-xs text-blue-600">
                        📈 Standardized ramp-up (same across all scenarios)
                      </p>
                    )}
                    {selectedYear > 2 && (
                      <p className="text-xs text-blue-600">
                        🎯 Target: {formatNumber(parameters?.flagshipStudents || 1200)} students ({currentScenario} scenario)
                      </p>
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
                    {selectedYear <= 1 && (
                      <p className="text-xs text-purple-600">
                        📈 No adoption in first year (building proven model)
                      </p>
                    )}
                    {selectedYear === 2 && (
                      <p className="text-xs text-purple-600">
                        📈 Pilot launch: 2,500 students (same across scenarios)
                      </p>
                    )}
                    {selectedYear > 2 && (
                      <p className="text-xs text-purple-600">
                        🎯 Target: {formatNumber(parameters?.adoptionStudents || 150000)} students ({currentScenario} scenario)
                      </p>
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

            {/* Franchise Planning */}
            {selectedYear > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Building className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Franchise Network</h4>
                </div>

                {selectedYear <= 2 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm italic">Franchises start in Year 3</p>
                    <p className="text-xs mt-1">Building proven model first</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Number of Franchises</label>
                      {editMode ? (
                        <input
                          type="number"
                          value={getInputValue(selectedYear, 'franchiseCount', selectedYearData.franchiseCount)}
                          onChange={(e) => handleInputChange(selectedYear, 'franchiseCount', e.target.value)}
                          onBlur={(e) => handleInputBlur(selectedYear, 'franchiseCount', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                          min="0"
                          max="100"
                          placeholder="Enter number of franchises"
                        />
                      ) : (
                        <div className="text-lg font-semibold text-green-600">{formatNumber(selectedYearData.franchiseCount)}</div>
                      )}
                      <p className="text-xs text-gray-500">New franchises generate R${formatCurrency(parameters?.franchiseFee || 180000)} fee each</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Students per Franchise</label>
                      {editMode ? (
                        <input
                          type="number"
                          value={getInputValue(selectedYear, 'studentsPerFranchise', selectedYearData.studentsPerFranchise)}
                          onChange={(e) => handleInputChange(selectedYear, 'studentsPerFranchise', e.target.value)}
                          onBlur={(e) => handleInputBlur(selectedYear, 'studentsPerFranchise', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                          min="0"
                          max="3000"
                          step="100"
                          placeholder="Enter students per franchise"
                        />
                      ) : (
                        <div className="text-lg font-semibold text-green-600">{formatNumber(selectedYearData.studentsPerFranchise)}</div>
                      )}
                      <p className="text-xs text-gray-500">Total franchise students: {formatNumber(selectedYearData.franchiseCount * selectedYearData.studentsPerFranchise)}</p>
                    </div>
                  </>
                )}
              </div>
            )}

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
              {/* Complete P&L Statement */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Complete P&L Statement</h4>
                </div>

                {/* Revenue Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-3">💰 Revenue Streams</h5>
                  <div className="space-y-2">
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
                    {selectedYear > 2 && selectedYearProjection.revenue?.franchiseFees > 0 && (
                      <div className="ml-4 text-xs text-gray-500">
                        • New franchise fees: {formatCurrency(selectedYearProjection.revenue?.franchiseFees || 0)}
                      </div>
                    )}
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
                    <div className="flex justify-between items-center pt-2 border-t border-green-300">
                      <span className="text-sm font-bold text-green-900">Total Revenue</span>
                      <span className="font-bold text-green-700 text-lg">
                        {formatCurrency(selectedYearProjection.revenue?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-3">💸 Operating Expenses</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Technology OPEX (10%)</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.technologyOpex || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Marketing (8%)</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.marketing || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staff - Corporate</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffCorporate || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staff - Flagship</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffFlagship || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staff - Franchise Support</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffFranchiseSupport || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staff - Adoption Support</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffAdoptionSupport || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Facilities</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.facilities || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Curriculum Development</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.curriculum || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Teacher Training</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.teacherTraining || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quality & Compliance</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency((selectedYearProjection.costs?.qualityAssurance || 0) + (selectedYearProjection.costs?.regulatoryCompliance || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Other Operational</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency((selectedYearProjection.costs?.legal || 0) + (selectedYearProjection.costs?.insurance || 0) + (selectedYearProjection.costs?.travel || 0) + (selectedYearProjection.costs?.workingCapital || 0) + (selectedYearProjection.costs?.contingency || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-red-300">
                      <span className="text-sm font-bold text-red-900">Total Operating Costs</span>
                      <span className="font-bold text-red-700 text-lg">
                        {formatCurrency(selectedYearProjection.costs?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Results */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-3">📊 Financial Results</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">EBITDA</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(selectedYearProjection.ebitda || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">EBITDA Margin</span>
                      <span className={`font-semibold ${
                        (selectedYearProjection.ebitdaMargin || 0) > 0.8 ? 'text-green-600' :
                        (selectedYearProjection.ebitdaMargin || 0) > 0.6 ? 'text-blue-600' :
                        (selectedYearProjection.ebitdaMargin || 0) > 0.3 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {((selectedYearProjection.ebitdaMargin || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxes (25%)</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.taxes || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Net Income</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedYearProjection.netIncome || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">CAPEX</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(selectedYearProjection.capex || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                      <span className="text-sm font-bold text-blue-900">Free Cash Flow</span>
                      <span className={`font-bold text-lg ${
                        (selectedYearProjection.freeCashFlow || 0) > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(selectedYearProjection.freeCashFlow || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">🎯 Key Metrics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(selectedYearProjection.students?.total || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">• Flagship Students</span>
                      <span className="font-semibold text-blue-600">
                        {formatNumber(selectedYearProjection.students?.flagship || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">• Franchise Students</span>
                      <span className="font-semibold text-green-600">
                        {formatNumber(selectedYearProjection.students?.franchise || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">• Adoption Students</span>
                      <span className="font-semibold text-purple-600">
                        {formatNumber(selectedYearProjection.students?.adoption || 0)}
                      </span>
                    </div>
                    {selectedYear > 2 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Franchises</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(selectedYearData.franchiseCount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue per Student</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency((selectedYearProjection.revenue?.total || 0) / Math.max(1, selectedYearProjection.students?.total || 1))}
                      </span>
                    </div>
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

      {/* Enhanced Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">How to Use Enhanced Private Sector Year-by-Year Planning:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Scenario Integration</strong> - Numbers automatically reflect your selected scenario ({SCENARIO_PRESETS[currentScenario]?.name || currentScenario}) from the Private Sector tab</li>
          <li>• <strong>Complete P&L View</strong> - See full profit & loss breakdown including all operating expenses and technology costs (10%)</li>
          <li>• <strong>Select a year</strong> from the dropdown to view or edit that year's assumptions</li>
          <li>• <strong>Toggle Edit Mode</strong> to modify student counts, pricing, or investments for specific years</li>
          <li>• <strong>Performance Indicators</strong> - Color-coded results show financial health at a glance</li>
          <li>• <strong>Real-time Updates</strong> - all charts and projections reflect your year-specific modifications instantly</li>
          <li>• <strong>Public sector planning</strong> is available in the "Public Partnerships" and "Consolidated View" tabs</li>
        </ul>
      </div>
    </div>
  );
};

export default YearByYearEditor;