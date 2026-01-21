import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Edit2, Save, RotateCcw, ChevronLeft, ChevronRight, MousePointer } from 'lucide-react';
import MonthDetailModal from './MonthDetailModal';

// Helper function to get expense value from nested path - defined outside component
const getExpenseValueFromPath = (exp, data) => {
  if (!exp || !data) return 0;
  const path = exp.field.split('.');
  let value = data;
  for (const key of path) {
    value = value?.[key];
  }
  return value || 0;
};

const ExpenseDetailModal = ({
  isOpen,
  onClose,
  expense,
  yearData,
  allYearsData,
  onSave,
  parameters,
  expenseOverrides = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(yearData?.yearIndex ?? 1);
  const [monthlyValues, setMonthlyValues] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Month detail modal state
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Update selectedYear when yearData changes
  useEffect(() => {
    if (yearData?.yearIndex !== undefined) {
      setSelectedYear(yearData.yearIndex);
    }
  }, [yearData]);

  // Get the current year's data
  const currentYearData = useMemo(() => {
    return allYearsData?.find(y => y.yearIndex === selectedYear) || yearData;
  }, [allYearsData, selectedYear, yearData]);

  // Calculate monthly values based on the expense type
  const calculateMonthlyValues = useMemo(() => {
    if (!expense || !currentYearData) return Array(12).fill(0);

    const annualValue = getExpenseValueFromPath(expense, currentYearData);
    const yearIndex = currentYearData.yearIndex;
    const calendarYear = 2026 + yearIndex;

    // Different distribution patterns based on expense type
    switch (expense.id) {
      // Expenses that ramp up during the year
      case 'staff.corporate':
      case 'staff.flagship':
      case 'staff.franchiseSupport':
      case 'staff.adoptionSupport':
        // Staff costs: flat monthly after hiring ramp in Y0/Y1
        if (yearIndex === 0) {
          // Y0: Ramp up - 50% in S1, 100% in S2
          return months.map((_, i) => {
            if (i < 4) return (annualValue / 12) * 0.5;
            if (i < 8) return (annualValue / 12) * 0.75;
            return (annualValue / 12);
          });
        }
        return Array(12).fill(annualValue / 12);

      // Revenue-based costs - follow revenue pattern
      case 'operational.technology':
      case 'operational.marketing':
      case 'business.badDebt':
      case 'business.paymentProcessing':
      case 'business.platformRD':
      case 'educational.contentDevelopment':
        if (yearIndex === 0) {
          // Y0: No revenue, minimal costs
          return months.map((_, i) => i >= 8 ? (annualValue / 5) : 0);
        }
        if (yearIndex === 1) {
          // Y1: Revenue ramps up through the year
          const weights = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2];
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          return weights.map(w => (annualValue * w) / totalWeight);
        }
        return Array(12).fill(annualValue / 12);

      // Fixed monthly costs
      case 'operational.facilities':
      case 'other.insurance':
        return Array(12).fill(annualValue / 12);

      // CAPEX - lumpy based on project phases
      case 'capex.amount':
        if (yearIndex === 0) {
          // Y0: R$20M - April to December (construction)
          return months.map((_, i) => i >= 3 ? (annualValue / 9) : 0);
        }
        if (yearIndex === 1) {
          // Y1: R$5M - spread across year
          return Array(12).fill(annualValue / 12);
        }
        return Array(12).fill(annualValue / 12);

      case 'capex.architectPayment':
        if (yearIndex === 0) {
          // R$100K upfront in Jan + R$45.8K/month for 11 months
          return months.map((_, i) => i === 0 ? 100000 : 45833);
        }
        if (yearIndex === 1 || yearIndex === 2) {
          // R$45.8K/month for 12 months
          return Array(12).fill(45833);
        }
        return Array(12).fill(0);

      // Debt service
      case 'debtService.bridgeInterest':
        if (yearIndex === 0) {
          // Interest accrues Jan-Oct, paid at repayment
          return months.map((_, i) => i === 9 ? annualValue : 0);
        }
        return Array(12).fill(0);

      case 'debtService.bridgeRepayment':
        if (yearIndex === 0) {
          // Repaid in October
          return months.map((_, i) => i === 9 ? annualValue : 0);
        }
        return Array(12).fill(0);

      case 'debtService.dspInterest':
      case 'debtService.innovationInterest':
        if (yearIndex === 0) {
          // DSP/Innovation disbursed in August, interest starts then
          return months.map((_, i) => i >= 7 ? (annualValue / 5) : 0);
        }
        // Quarterly interest payments
        return months.map((_, i) => [2, 5, 8, 11].includes(i) ? (annualValue / 4) : 0);

      case 'debtService.principal':
        if (yearIndex >= 4 && yearIndex < 9) {
          // Principal paid quarterly starting 2030
          return months.map((_, i) => [2, 5, 8, 11].includes(i) ? (annualValue / 4) : 0);
        }
        return Array(12).fill(0);

      // Default: even distribution
      default:
        return Array(12).fill(annualValue / 12);
    }
  }, [expense, currentYearData]);

  // Initialize monthly values when expense or year changes
  useEffect(() => {
    setMonthlyValues(calculateMonthlyValues);
    setHasChanges(false);
    setIsEditing(false);
  }, [calculateMonthlyValues]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleMonthValueChange = (index, value) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    const newValues = [...monthlyValues];
    newValues[index] = numValue;
    setMonthlyValues(newValues);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave({
        expenseId: expense.id,
        yearIndex: selectedYear,
        monthlyValues: monthlyValues,
        annualTotal: monthlyValues.reduce((a, b) => a + b, 0),
      });
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setMonthlyValues(calculateMonthlyValues);
    setHasChanges(false);
  };

  const handleYearChange = (direction) => {
    const newYear = selectedYear + direction;
    if (newYear >= 0 && newYear <= 10) {
      setSelectedYear(newYear);
    }
  };

  const handleMonthClick = (monthIndex) => {
    if (!isEditing && monthlyValues[monthIndex] > 0) {
      setSelectedMonthIndex(monthIndex);
      setIsMonthModalOpen(true);
    }
  };

  const handleMonthDetailSave = (data) => {
    const newValues = [...monthlyValues];
    const overrideKey = `${expense.id}_${selectedYear}`;
    const currentOverrides = expenseOverrides[overrideKey]?.itemOverrides || {};
    const newItemOverrides = { ...currentOverrides };

    if (data.applyToRestOfYear) {
      // Apply the new total from this month through December
      for (let i = data.monthIndex; i < 12; i++) {
        newValues[i] = data.newTotal;
        // Store item overrides for each month
        newItemOverrides[i] = data.items;
      }
    } else {
      // Only update this specific month
      newValues[data.monthIndex] = data.newTotal;
      newItemOverrides[data.monthIndex] = data.items;
    }

    setMonthlyValues(newValues);

    // Auto-save to parent so changes persist immediately (including item overrides)
    if (onSave) {
      onSave({
        expenseId: expense.id,
        yearIndex: selectedYear,
        monthlyValues: newValues,
        annualTotal: newValues.reduce((a, b) => a + b, 0),
        itemOverrides: newItemOverrides,
      });
    }

    setHasChanges(false); // Changes have been saved
    // Close the month detail modal
    setIsMonthModalOpen(false);
    setSelectedMonthIndex(null);
  };

  if (!isOpen || !expense) return null;

  const annualTotal = monthlyValues.reduce((a, b) => a + b, 0);
  const calendarYear = 2026 + selectedYear;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{expense.label}</h2>
              <p className="text-blue-100 text-sm mt-1">{expense.formula}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Year Selector */}
        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b">
          <button
            onClick={() => handleYearChange(-1)}
            disabled={selectedYear === 0}
            className="flex items-center space-x-1 px-3 py-1 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              Year {selectedYear} ({calendarYear})
            </div>
            <div className="text-sm text-gray-500">
              Annual Total: <span className="font-semibold text-blue-600">{formatCurrency(annualTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => handleYearChange(1)}
            disabled={selectedYear === 10}
            className="flex items-center space-x-1 px-3 py-1 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Breakdown */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Click hint */}
          {!isEditing && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 mb-4">
              <MousePointer className="w-4 h-4" />
              <span>Click any month to see detailed breakdown</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((month, index) => (
              <div
                key={month}
                onClick={() => handleMonthClick(index)}
                className={`rounded-lg border-2 p-4 transition-all ${
                  isEditing
                    ? 'border-blue-300 bg-blue-50'
                    : monthlyValues[index] > 0
                      ? 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer group'
                      : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-600">
                    {month} {calendarYear}
                  </div>
                  {!isEditing && monthlyValues[index] > 0 && (
                    <MousePointer className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formatCurrency(monthlyValues[index]).replace('R$', '').trim()}
                    onChange={(e) => handleMonthValueChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-right font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className={`text-lg font-bold text-right ${monthlyValues[index] > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {formatCurrency(monthlyValues[index])}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Row */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="font-medium">Annual Total ({calendarYear})</span>
              <span className="text-2xl font-bold">{formatCurrency(annualTotal)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-gray-300 text-sm">
              <span>Monthly Average</span>
              <span>{formatCurrency(annualTotal / 12)}</span>
            </div>
          </div>

          {/* All Years Quick View */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">All Years Overview</h3>
            <div className="overflow-x-auto">
              <div className="flex space-x-2">
                {allYearsData?.map((year) => {
                  const value = getExpenseValueFromPath(expense, year);
                  const isSelected = year.yearIndex === selectedYear;
                  return (
                    <button
                      key={year.yearIndex}
                      onClick={() => setSelectedYear(year.yearIndex)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium">Y{year.yearIndex}</div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}M`
                          : `${(value / 1000).toFixed(0)}K`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {hasChanges && (
              <span className="text-amber-600 font-medium">
                * You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Values</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Month Detail Modal */}
      <MonthDetailModal
        isOpen={isMonthModalOpen}
        onClose={() => {
          setIsMonthModalOpen(false);
          setSelectedMonthIndex(null);
        }}
        expenseId={expense?.id}
        expenseLabel={expense?.label}
        monthIndex={selectedMonthIndex}
        monthValue={selectedMonthIndex !== null ? monthlyValues[selectedMonthIndex] : 0}
        yearIndex={selectedYear}
        calendarYear={calendarYear}
        onSave={handleMonthDetailSave}
        savedItems={expenseOverrides[`${expense?.id}_${selectedYear}`]?.itemOverrides?.[selectedMonthIndex]}
      />
    </div>
  );
};

export default ExpenseDetailModal;
