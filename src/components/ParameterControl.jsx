import React from 'react';
import { Settings, DollarSign, Users, TrendingUp } from 'lucide-react';

const ParameterControl = ({ parameters, onParameterChange, className = '' }) => {
  const handleChange = (key, value) => {
    const numValue = parseFloat(value) || 0;
    onParameterChange({ [key]: numValue });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const parameterGroups = [
    {
      title: 'Students & Market',
      icon: <Users className="w-5 h-5" />,
      parameters: [
        { key: 'flagshipStudents', label: 'Flagship Students', value: parameters.flagshipStudents, min: 500, max: 3000, step: 50 },
        { key: 'franchiseCount', label: 'Total Franchises (Year 10)', value: parameters.franchiseCount, min: 20, max: 100, step: 5 },
        { key: 'studentsPerFranchise', label: 'Students per Franchise', value: parameters.studentsPerFranchise, min: 1000, max: 2000, step: 100 },
        { key: 'adoptionStudents', label: 'Adoption Students (Year 10)', value: parameters.adoptionStudents, min: 100000, max: 500000, step: 25000 },
      ]
    },
    {
      title: 'Pricing & Revenue',
      icon: <DollarSign className="w-5 h-5" />,
      parameters: [
        { key: 'flagshipTuition', label: 'Monthly Tuition (R$)', value: parameters.flagshipTuition, min: 1500, max: 4000, step: 100 },
        { key: 'adoptionLicenseFeeMonthly', label: 'Adoption Fee/Student/Month (R$)', value: parameters.adoptionLicenseFeeMonthly, min: 100, max: 400, step: 25 },
        { key: 'kitCostPerStudent', label: 'Annual Kit Cost (R$)', value: parameters.kitCostPerStudent, min: 1000, max: 2500, step: 100 },
        { key: 'franchiseRoyaltyRate', label: 'Franchise Royalty (%)', value: parameters.franchiseRoyaltyRate * 100, min: 5, max: 15, step: 0.5, isPercentage: true },
        { key: 'franchiseFee', label: 'Franchise Fee (R$)', value: parameters.franchiseFee, min: 100000, max: 500000, step: 25000 },
      ]
    },
    {
      title: 'Growth & Operations',
      icon: <TrendingUp className="w-5 h-5" />,
      parameters: [
        { key: 'tuitionIncreaseRate', label: 'Annual Tuition Increase (%)', value: parameters.tuitionIncreaseRate * 100, min: 5, max: 15, step: 0.5, isPercentage: true },
        { key: 'franchiseGrowthRate', label: 'New Franchises/Year', value: parameters.franchiseGrowthRate, min: 3, max: 10, step: 1 },
        { key: 'adoptionGrowthRate', label: 'Adoption Growth Rate (%)', value: parameters.adoptionGrowthRate * 100, min: 30, max: 80, step: 5, isPercentage: true },
        { key: 'marketingRate', label: 'Marketing % of Revenue', value: parameters.marketingRate * 100, min: 3, max: 8, step: 0.5, isPercentage: true },
      ]
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Model Parameters</h2>
      </div>

      <div className="space-y-8">
        {parameterGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <span className="text-primary-600">{group.icon}</span>
              <h3 className="font-medium text-gray-900">{group.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {group.parameters.map((param) => (
                <div key={param.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      {param.label}
                    </label>
                    <span className="text-sm text-gray-600">
                      {param.isPercentage ? `${param.value}%` : formatNumber(param.value)}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      handleChange(
                        param.key, 
                        param.isPercentage ? value / 100 : value
                      );
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{param.isPercentage ? `${param.min}%` : formatNumber(param.min)}</span>
                    <span>{param.isPercentage ? `${param.max}%` : formatNumber(param.max)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CAPEX Scenario Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Settings className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium text-gray-900">CAPEX Scenario</h3>
          </div>
          
          <div className="space-y-3">
            {['government', 'built-to-suit', 'direct'].map((scenario) => (
              <label key={scenario} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="capexScenario"
                  value={scenario}
                  checked={parameters.capexScenario === scenario}
                  onChange={(e) => onParameterChange({ capexScenario: e.target.value })}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {scenario.replace('-', ' ')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {scenario === 'government' && 'R$10M renovation, free building use'}
                    {scenario === 'built-to-suit' && 'R$3M tech + R$3.2M/year lease'}
                    {scenario === 'direct' && 'R$25M construction, full ownership'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterControl;