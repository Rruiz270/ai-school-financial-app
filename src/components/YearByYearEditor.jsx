import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Building, Edit3, RotateCcw, TrendingUp, BarChart3, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { CAPEX_SCENARIOS, SCENARIO_PRESETS } from '../utils/financialModel';

const YearByYearEditor = ({ parameters, onParameterChange, financialData, currentScenario, className = '' }) => {
  const [selectedYear, setSelectedYear] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [showStaffBreakdown, setShowStaffBreakdown] = useState(null); // null, 'corporate', 'flagship', 'franchise', 'adoption', 'training'
  
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Staff - Corporate</span>
                        <button
                          onClick={() => setShowStaffBreakdown(showStaffBreakdown === 'corporate' ? null : 'corporate')}
                          className="p-1 hover:bg-blue-100 rounded-full border border-gray-300 hover:border-blue-400"
                          title="View staff breakdown"
                        >
                          <Info className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffCorporate || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Staff - Flagship</span>
                        <button
                          onClick={() => setShowStaffBreakdown(showStaffBreakdown === 'flagship' ? null : 'flagship')}
                          className="p-1 hover:bg-blue-100 rounded-full border border-gray-300 hover:border-blue-400"
                          title="View staff breakdown"
                        >
                          <Info className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffFlagship || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Staff - Franchise Support</span>
                        <button
                          onClick={() => setShowStaffBreakdown(showStaffBreakdown === 'franchise' ? null : 'franchise')}
                          className="p-1 hover:bg-blue-100 rounded-full border border-gray-300 hover:border-blue-400"
                          title="View staff breakdown"
                        >
                          <Info className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedYearProjection.costs?.staffFranchiseSupport || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Staff - Adoption Support</span>
                        <button
                          onClick={() => setShowStaffBreakdown(showStaffBreakdown === 'adoption' ? null : 'adoption')}
                          className="p-1 hover:bg-blue-100 rounded-full border border-gray-300 hover:border-blue-400"
                          title="View staff breakdown"
                        >
                          <Info className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Teacher Training</span>
                        <button
                          onClick={() => setShowStaffBreakdown(showStaffBreakdown === 'training' ? null : 'training')}
                          className="p-1 hover:bg-blue-100 rounded-full border border-gray-300 hover:border-blue-400"
                          title="View staff breakdown"
                        >
                          <Info className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
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
                      <span className="text-sm text-gray-600">Bad Debt (5%)</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency((selectedYearProjection.revenue?.total || 0) * 0.05)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">EBITDA (after bad debt)</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency((selectedYearProjection.ebitda || 0) - ((selectedYearProjection.revenue?.total || 0) * 0.05))}
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

      {/* Staff Breakdown Modal */}
      {showStaffBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showStaffBreakdown === 'corporate' && 'Corporate Staff Breakdown'}
                {showStaffBreakdown === 'flagship' && 'Flagship School Staff Breakdown'}
                {showStaffBreakdown === 'franchise' && 'Franchise Support Staff Breakdown'}
                {showStaffBreakdown === 'adoption' && 'Adoption Support Staff Breakdown'}
                {showStaffBreakdown === 'training' && 'Teacher Training Staff Breakdown'}
              </h2>
              <button
                onClick={() => setShowStaffBreakdown(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {showStaffBreakdown === 'corporate' && (() => {
                const totalStudents = selectedYearProjection.students?.total || 0;
                const corporateCost = selectedYearProjection.costs?.staffCorporate || 0;
                const baseStaff = {
                  ceo: { salary: 50000, count: 1 },
                  cto: { salary: 35000, count: 1 },
                  operations: { salary: 30000, count: 1 },
                  finance: { salary: 25000, count: 1 },
                  engineers: { salary: 18000, count: Math.max(4, Math.ceil(totalStudents / 5000)) }, // Scale engineers with students
                  productManagers: { salary: 20000, count: Math.max(1, Math.ceil(totalStudents / 10000)) },
                  legal: { salary: 15000, count: 1 },
                  hr: { salary: 12000, count: Math.max(1, Math.ceil(totalStudents / 8000)) }
                };
                
                const calculateStaffCost = (staff) => {
                  return Object.values(staff).reduce((total, role) => total + (role.salary * role.count * 12), 0);
                };
                
                const baseCost = calculateStaffCost(baseStaff);
                const benefitsTaxes = baseCost * 0.35;
                const totalCalculated = baseCost + benefitsTaxes;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-3">Corporate Team Structure - Year {selectedYear}</h3>
                      <div className="mb-3 text-sm text-blue-700">
                        📊 Total Students: {formatNumber(totalStudents)} | Actual Cost: {formatCurrency(corporateCost)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">CEO / Founder</span>
                          <span className="text-sm font-medium">R${baseStaff.ceo.salary.toLocaleString()}/month × {baseStaff.ceo.count} = {formatCurrency(baseStaff.ceo.salary * baseStaff.ceo.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CTO / Head of Technology</span>
                          <span className="text-sm font-medium">R${baseStaff.cto.salary.toLocaleString()}/month × {baseStaff.cto.count} = {formatCurrency(baseStaff.cto.salary * baseStaff.cto.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Head of Operations</span>
                          <span className="text-sm font-medium">R${baseStaff.operations.salary.toLocaleString()}/month × {baseStaff.operations.count} = {formatCurrency(baseStaff.operations.salary * baseStaff.operations.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Head of Finance</span>
                          <span className="text-sm font-medium">R${baseStaff.finance.salary.toLocaleString()}/month × {baseStaff.finance.count} = {formatCurrency(baseStaff.finance.salary * baseStaff.finance.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Software Engineers</span>
                          <span className="text-sm font-medium">R${baseStaff.engineers.salary.toLocaleString()}/month × {baseStaff.engineers.count} = {formatCurrency(baseStaff.engineers.salary * baseStaff.engineers.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Product Managers</span>
                          <span className="text-sm font-medium">R${baseStaff.productManagers.salary.toLocaleString()}/month × {baseStaff.productManagers.count} = {formatCurrency(baseStaff.productManagers.salary * baseStaff.productManagers.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Legal & Compliance</span>
                          <span className="text-sm font-medium">R${baseStaff.legal.salary.toLocaleString()}/month × {baseStaff.legal.count} = {formatCurrency(baseStaff.legal.salary * baseStaff.legal.count * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">HR & Admin</span>
                          <span className="text-sm font-medium">R${baseStaff.hr.salary.toLocaleString()}/month × {baseStaff.hr.count} = {formatCurrency(baseStaff.hr.salary * baseStaff.hr.count * 12)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-sm font-bold">Total Base Cost</span>
                          <span className="text-sm font-bold">{formatCurrency(baseCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Benefits & Taxes (35%)</span>
                          <span className="text-sm font-medium">{formatCurrency(benefitsTaxes)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-bold text-blue-900">Calculated Total</span>
                          <span className="text-sm font-bold text-blue-900">{formatCurrency(totalCalculated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-bold text-green-900">Actual Model Cost</span>
                          <span className="text-sm font-bold text-green-900">{formatCurrency(corporateCost)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      * Corporate staff costs: Max(R$3M base, R$80 per total student). Staff count scales with student growth.
                    </p>
                  </div>
                );
              })()}
              
              {showStaffBreakdown === 'flagship' && (() => {
                const flagshipStudents = selectedYearProjection.students?.flagship || 0;
                const flagshipCost = selectedYearProjection.costs?.staffFlagship || 0;
                
                const facilitatorsNeeded = Math.max(1, Math.ceil(flagshipStudents / 25)); // 1:25 ratio
                const successManagersNeeded = Math.max(1, Math.ceil(flagshipStudents / 75)); // 1:75 ratio
                const adminNeeded = Math.max(1, Math.ceil(flagshipStudents / 100)); // 1:100 ratio
                const techSupportNeeded = Math.max(1, Math.ceil(flagshipStudents / 150)); // 1:150 ratio
                
                const flagshipStaff = {
                  director: { salary: 25000, count: flagshipStudents > 0 ? 1 : 0 },
                  coordinator: { salary: 18000, count: flagshipStudents > 0 ? 1 : 0 },
                  facilitators: { salary: 12000, count: facilitatorsNeeded },
                  successManagers: { salary: 10000, count: successManagersNeeded },
                  admin: { salary: 8000, count: adminNeeded },
                  techSupport: { salary: 10000, count: techSupportNeeded }
                };
                
                const calculateStaffCost = (staff) => {
                  return Object.values(staff).reduce((total, role) => total + (role.salary * role.count * 12), 0);
                };
                
                const baseCost = calculateStaffCost(flagshipStaff);
                const benefitsTaxes = baseCost * 0.35;
                const totalCalculated = baseCost + benefitsTaxes;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-3">Flagship School Team - Year {selectedYear}</h3>
                      <div className="mb-3 text-sm text-green-700">
                        🏫 Flagship Students: {formatNumber(flagshipStudents)} | Actual Cost: {formatCurrency(flagshipCost)}
                      </div>
                      {flagshipStudents > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">School Director</span>
                            <span className="text-sm font-medium">R${flagshipStaff.director.salary.toLocaleString()}/month × {flagshipStaff.director.count} = {formatCurrency(flagshipStaff.director.salary * flagshipStaff.director.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Academic Coordinator</span>
                            <span className="text-sm font-medium">R${flagshipStaff.coordinator.salary.toLocaleString()}/month × {flagshipStaff.coordinator.count} = {formatCurrency(flagshipStaff.coordinator.salary * flagshipStaff.coordinator.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">AI Learning Facilitators (1:25 ratio)</span>
                            <span className="text-sm font-medium">R${flagshipStaff.facilitators.salary.toLocaleString()}/month × {flagshipStaff.facilitators.count} = {formatCurrency(flagshipStaff.facilitators.salary * flagshipStaff.facilitators.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Student Success Managers (1:75 ratio)</span>
                            <span className="text-sm font-medium">R${flagshipStaff.successManagers.salary.toLocaleString()}/month × {flagshipStaff.successManagers.count} = {formatCurrency(flagshipStaff.successManagers.salary * flagshipStaff.successManagers.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Administrative Staff (1:100 ratio)</span>
                            <span className="text-sm font-medium">R${flagshipStaff.admin.salary.toLocaleString()}/month × {flagshipStaff.admin.count} = {formatCurrency(flagshipStaff.admin.salary * flagshipStaff.admin.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Technical Support (1:150 ratio)</span>
                            <span className="text-sm font-medium">R${flagshipStaff.techSupport.salary.toLocaleString()}/month × {flagshipStaff.techSupport.count} = {formatCurrency(flagshipStaff.techSupport.salary * flagshipStaff.techSupport.count * 12)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-sm font-bold">Total Base Cost</span>
                            <span className="text-sm font-bold">{formatCurrency(baseCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Benefits & Taxes (35%)</span>
                            <span className="text-sm font-medium">{formatCurrency(benefitsTaxes)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-bold text-green-900">Calculated Total</span>
                            <span className="text-sm font-bold text-green-900">{formatCurrency(totalCalculated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-green-900">Actual Model Cost</span>
                            <span className="text-sm font-bold text-green-900">{formatCurrency(flagshipCost)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No flagship students in Year {selectedYear}</p>
                          <p className="text-xs mt-2">Flagship school starts ramping up from Year 1</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      * Flagship staff calculation: Max(R$2.5M base, R$2,200 per student). Ratios scale with enrollment.
                    </p>
                  </div>
                );
              })()}
              
              {showStaffBreakdown === 'franchise' && (() => {
                const franchiseCount = selectedYearProjection.franchiseCount || 0;
                const franchiseCost = selectedYearProjection.costs?.staffFranchiseSupport || 0;
                
                const franchiseStaff = {
                  director: { salary: 30000, count: franchiseCount > 0 ? 1 : 0 },
                  managers: { salary: 20000, count: Math.ceil(franchiseCount / 10) || 0 }, // 1 per 10 franchises
                  trainers: { salary: 15000, count: Math.ceil(franchiseCount / 5) || 0 }, // 1 per 5 franchises
                  support: { salary: 12000, count: franchiseCount || 0 } // 1 per franchise
                };
                
                const calculateStaffCost = (staff) => {
                  return Object.values(staff).reduce((total, role) => total + (role.salary * role.count * 12), 0);
                };
                
                const baseCost = calculateStaffCost(franchiseStaff);
                const benefitsTaxes = baseCost * 0.35;
                const totalCalculated = baseCost + benefitsTaxes;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-3">Franchise Support Team - Year {selectedYear}</h3>
                      <div className="mb-3 text-sm text-yellow-700">
                        🏢 Active Franchises: {formatNumber(franchiseCount)} | Actual Cost: {formatCurrency(franchiseCost)}
                      </div>
                      {franchiseCount > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Franchise Director</span>
                            <span className="text-sm font-medium">R${franchiseStaff.director.salary.toLocaleString()}/month × {franchiseStaff.director.count} = {formatCurrency(franchiseStaff.director.salary * franchiseStaff.director.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Regional Managers (1:10 ratio)</span>
                            <span className="text-sm font-medium">R${franchiseStaff.managers.salary.toLocaleString()}/month × {franchiseStaff.managers.count} = {formatCurrency(franchiseStaff.managers.salary * franchiseStaff.managers.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Training Specialists (1:5 ratio)</span>
                            <span className="text-sm font-medium">R${franchiseStaff.trainers.salary.toLocaleString()}/month × {franchiseStaff.trainers.count} = {formatCurrency(franchiseStaff.trainers.salary * franchiseStaff.trainers.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Dedicated Support (1:1 ratio)</span>
                            <span className="text-sm font-medium">R${franchiseStaff.support.salary.toLocaleString()}/month × {franchiseStaff.support.count} = {formatCurrency(franchiseStaff.support.salary * franchiseStaff.support.count * 12)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-sm font-bold">Total Base Cost</span>
                            <span className="text-sm font-bold">{formatCurrency(baseCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Benefits & Taxes (35%)</span>
                            <span className="text-sm font-medium">{formatCurrency(benefitsTaxes)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-bold text-yellow-900">Calculated Total</span>
                            <span className="text-sm font-bold text-yellow-900">{formatCurrency(totalCalculated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-yellow-900">Actual Model Cost</span>
                            <span className="text-sm font-bold text-yellow-900">{formatCurrency(franchiseCost)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No franchise support staff needed in Year {selectedYear}</p>
                          <p className="text-xs mt-2">Franchise network starts in Year 3</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      * Franchise support: R$300K per franchise for training, operations, and ongoing support
                    </p>
                  </div>
                );
              })()}
              
              {showStaffBreakdown === 'adoption' && (() => {
                const adoptionStudents = selectedYearProjection.students?.adoption || 0;
                const adoptionCost = selectedYearProjection.costs?.staffAdoptionSupport || 0;
                
                const adoptionStaff = {
                  director: { salary: 25000, count: adoptionStudents > 1000 ? 1 : 0 },
                  customerSuccess: { salary: 15000, count: Math.ceil(adoptionStudents / 2000) || 0 }, // 1 per 2K students
                  technicalSupport: { salary: 12000, count: Math.ceil(adoptionStudents / 3000) || 0 }, // 1 per 3K students
                  trainers: { salary: 14000, count: Math.ceil(adoptionStudents / 2500) || 0 } // 1 per 2.5K students
                };
                
                const calculateStaffCost = (staff) => {
                  return Object.values(staff).reduce((total, role) => total + (role.salary * role.count * 12), 0);
                };
                
                const baseCost = calculateStaffCost(adoptionStaff);
                const benefitsTaxes = baseCost * 0.35;
                const totalCalculated = baseCost + benefitsTaxes;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-3">Adoption Support Team - Year {selectedYear}</h3>
                      <div className="mb-3 text-sm text-purple-700">
                        🎓 Adoption Students: {formatNumber(adoptionStudents)} | Actual Cost: {formatCurrency(adoptionCost)}
                      </div>
                      {adoptionStudents > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Adoption Director</span>
                            <span className="text-sm font-medium">R${adoptionStaff.director.salary.toLocaleString()}/month × {adoptionStaff.director.count} = {formatCurrency(adoptionStaff.director.salary * adoptionStaff.director.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Customer Success Managers (1:2000 ratio)</span>
                            <span className="text-sm font-medium">R${adoptionStaff.customerSuccess.salary.toLocaleString()}/month × {adoptionStaff.customerSuccess.count} = {formatCurrency(adoptionStaff.customerSuccess.salary * adoptionStaff.customerSuccess.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Technical Support (1:3000 ratio)</span>
                            <span className="text-sm font-medium">R${adoptionStaff.technicalSupport.salary.toLocaleString()}/month × {adoptionStaff.technicalSupport.count} = {formatCurrency(adoptionStaff.technicalSupport.salary * adoptionStaff.technicalSupport.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Training Specialists (1:2500 ratio)</span>
                            <span className="text-sm font-medium">R${adoptionStaff.trainers.salary.toLocaleString()}/month × {adoptionStaff.trainers.count} = {formatCurrency(adoptionStaff.trainers.salary * adoptionStaff.trainers.count * 12)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-sm font-bold">Total Base Cost</span>
                            <span className="text-sm font-bold">{formatCurrency(baseCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Benefits & Taxes (35%)</span>
                            <span className="text-sm font-medium">{formatCurrency(benefitsTaxes)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-bold text-purple-900">Calculated Total</span>
                            <span className="text-sm font-bold text-purple-900">{formatCurrency(totalCalculated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-purple-900">Actual Model Cost</span>
                            <span className="text-sm font-bold text-purple-900">{formatCurrency(adoptionCost)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No adoption support staff needed in Year {selectedYear}</p>
                          <p className="text-xs mt-2">Adoption program starts in Year 2</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      * Adoption support: R$150 per student for customer success, training, and technical support
                    </p>
                  </div>
                );
              })()}
              
              {showStaffBreakdown === 'training' && (() => {
                const totalStudents = selectedYearProjection.students?.total || 0;
                const flagshipStudents = selectedYearProjection.students?.flagship || 0;
                const franchiseStudents = selectedYearProjection.students?.franchise || 0;
                const teachersToTrain = Math.ceil((flagshipStudents + franchiseStudents) * 0.1); // 10% turnover/new hires
                const trainingCost = selectedYearProjection.costs?.teacherTraining || 0;
                
                const trainingStaff = {
                  head: { salary: 22000, count: totalStudents > 500 ? 1 : 0 },
                  specialists: { salary: 15000, count: Math.max(1, Math.ceil(teachersToTrain / 50)) }, // 1 per 50 teachers
                  designers: { salary: 12000, count: Math.max(1, Math.ceil(teachersToTrain / 75)) }, // 1 per 75 teachers
                  coordinators: { salary: 10000, count: Math.max(1, Math.ceil(teachersToTrain / 100)) } // 1 per 100 teachers
                };
                
                const calculateStaffCost = (staff) => {
                  return Object.values(staff).reduce((total, role) => total + (role.salary * role.count * 12), 0);
                };
                
                const baseCost = calculateStaffCost(trainingStaff);
                const benefitsTaxes = baseCost * 0.35;
                const totalCalculated = baseCost + benefitsTaxes;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-900 mb-3">Teacher Training Team - Year {selectedYear}</h3>
                      <div className="mb-3 text-sm text-indigo-700">
                        👩‍🏫 Teachers to Train: {formatNumber(teachersToTrain)} | Total Students: {formatNumber(totalStudents)} | Actual Cost: {formatCurrency(trainingCost)}
                      </div>
                      {teachersToTrain > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Head of Teacher Development</span>
                            <span className="text-sm font-medium">R${trainingStaff.head.salary.toLocaleString()}/month × {trainingStaff.head.count} = {formatCurrency(trainingStaff.head.salary * trainingStaff.head.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Senior Training Specialists (1:50 ratio)</span>
                            <span className="text-sm font-medium">R${trainingStaff.specialists.salary.toLocaleString()}/month × {trainingStaff.specialists.count} = {formatCurrency(trainingStaff.specialists.salary * trainingStaff.specialists.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Curriculum Designers (1:75 ratio)</span>
                            <span className="text-sm font-medium">R${trainingStaff.designers.salary.toLocaleString()}/month × {trainingStaff.designers.count} = {formatCurrency(trainingStaff.designers.salary * trainingStaff.designers.count * 12)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Training Coordinators (1:100 ratio)</span>
                            <span className="text-sm font-medium">R${trainingStaff.coordinators.salary.toLocaleString()}/month × {trainingStaff.coordinators.count} = {formatCurrency(trainingStaff.coordinators.salary * trainingStaff.coordinators.count * 12)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-sm font-bold">Total Base Cost</span>
                            <span className="text-sm font-bold">{formatCurrency(baseCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Benefits & Taxes (35%)</span>
                            <span className="text-sm font-medium">{formatCurrency(benefitsTaxes)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-bold text-indigo-900">Calculated Total</span>
                            <span className="text-sm font-bold text-indigo-900">{formatCurrency(totalCalculated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-indigo-900">Actual Model Cost</span>
                            <span className="text-sm font-bold text-indigo-900">{formatCurrency(trainingCost)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Minimal training staff needed in Year {selectedYear}</p>
                          <p className="text-xs mt-2">Training scales with teacher count and student growth</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      * Training cost: Max(R$800K base, 10% of students × R$15K per teacher). Staff scales with teacher count.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearByYearEditor;