import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Settings, Presentation, Calculator, TrendingUp, Users, Calendar, School, Building2, GitMerge, RotateCcw, Wallet } from 'lucide-react';
import { FinancialModel, DEFAULT_PARAMETERS, SCENARIO_PRESETS, INVESTMENT_PHASES } from './utils/financialModel';
import Dashboard from './components/Dashboard';
import ParameterControl from './components/ParameterControl';
import PresentationMode from './components/PresentationMode';
import YearByYearEditor from './components/YearByYearEditor';
import PublicPartnerships from './components/PublicPartnerships';
import ConsolidatedView from './components/ConsolidatedView';
import CashFlow from './components/CashFlow';
import UnitEconomics from './components/UnitEconomics';
import IntegratedDashboard from './components/IntegratedDashboard';
import SimpleIntegrated from './components/SimpleIntegrated';
import ErrorBoundary from './components/ErrorBoundary';
import ExportButton, { exportToExcel, formatCurrencyForExport, formatPercentageForExport } from './components/ExportButton';

// Public Sector Scenario Presets (copied from PublicPartnerships)
const PUBLIC_SCENARIO_PRESETS = {
  optimistic: {
    name: 'Optimistic',
    description: 'Strong government partnerships, rapid adoption',
    year1Students: 50000,
    year5Students: 610000,
    year10Students: 2200000,
    pilotMunicipalities: 5,
    year5Municipalities: 25,
    year10Municipalities: 120,
    revenuePerStudentMonth: 250,
    marginsPublic: 0.40
  },
  realistic: {
    name: 'Realistic',
    description: 'Moderate government support, steady growth',
    year1Students: 42500,
    year5Students: 518500,
    year10Students: 1870000,
    pilotMunicipalities: 4,
    year5Municipalities: 21,
    year10Municipalities: 102,
    revenuePerStudentMonth: 212,
    marginsPublic: 0.35
  },
  pessimistic: {
    name: 'Pessimistic',
    description: 'Slow adoption, regulatory challenges',
    year1Students: 35000,
    year5Students: 427000,
    year10Students: 1540000,
    pilotMunicipalities: 3,
    year5Municipalities: 17,
    year10Municipalities: 84,
    revenuePerStudentMonth: 175,
    marginsPublic: 0.30
  }
};

// Function to generate initial public financial data
const generatePublicFinancialData = (scenario = 'optimistic') => {
  const publicParams = {
    setupFeePerSchool: 50000,
    technologyLicenseFee: 25000,
    teacherTrainingFee: 2000,
    teachersPerSchool: 25,
    ...PUBLIC_SCENARIO_PRESETS[scenario]
  };
  
  const years = [];
  
  for (let year = 1; year <= 10; year++) {
    const studentGrowth = Math.min(
      publicParams.year1Students * Math.pow(year / 1, 1.8),
      publicParams.year10Students
    );
    
    const students = Math.floor(studentGrowth);
    
    const municipalities = Math.min(
      publicParams.pilotMunicipalities * Math.pow(year / 1, 1.5),
      publicParams.year10Municipalities
    );
    
    const monthlyRevenue = students * publicParams.revenuePerStudentMonth * 12;
    const setupRevenue = Math.floor(municipalities * 50) * publicParams.setupFeePerSchool;
    const technologyRevenue = Math.floor(municipalities) * publicParams.technologyLicenseFee;
    const trainingRevenue = Math.floor(municipalities * 50 * publicParams.teachersPerSchool) * publicParams.teacherTrainingFee;
    
    const totalRevenue = monthlyRevenue + setupRevenue + technologyRevenue + trainingRevenue;
    const costs = totalRevenue * (1 - publicParams.marginsPublic);
    const ebitda = totalRevenue - costs;
    
    years.push({
      year,
      students,
      municipalities: Math.floor(municipalities),
      revenue: {
        monthly: monthlyRevenue,
        setup: setupRevenue,
        technology: technologyRevenue,
        training: trainingRevenue,
        total: totalRevenue
      },
      costs,
      ebitda,
      margin: ebitda / totalRevenue
    });
  }
  
  return years;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [currentScenario, setCurrentScenario] = useState('realistic');
  const [currentPublicScenario, setCurrentPublicScenario] = useState('optimistic');
  const [publicModelData, setPublicModelData] = useState(() => generatePublicFinancialData('optimistic'));
  
  // Create financial model instance and calculations
  const model = useMemo(() => new FinancialModel(parameters), [parameters]);
  const financialData = useMemo(() => model.getFinancialSummary(), [model]);

  // Update public data when scenario changes but tab hasn't been visited
  useEffect(() => {
    if (!publicModelData || publicModelData.length === 0) {
      setPublicModelData(generatePublicFinancialData(currentPublicScenario));
    }
  }, [currentPublicScenario]);

  const handleParameterChange = (newParams) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  const handleScenarioChange = (scenarioKey, scenarioParams) => {
    setCurrentScenario(scenarioKey);
    setParameters(scenarioParams);
  };

  const handlePublicModelChange = (publicParams, publicData, publicScenario) => {
    console.log('App received public data:', { publicParams, publicData, publicScenario });
    setPublicModelData(publicData);
    if (publicScenario) {
      setCurrentPublicScenario(publicScenario);
    }
  };

  const resetAllToDefault = () => {
    // Reset private sector to realistic scenario and clear year-by-year overrides
    const realisticParams = {
      ...SCENARIO_PRESETS.realistic.parameters,
      yearlyOverrides: {} // Clear all year-by-year customizations
    };
    setCurrentScenario('realistic');
    setParameters(realisticParams);

    // Reset public sector to optimistic scenario (default for public)
    setCurrentPublicScenario('optimistic');
    setPublicModelData(generatePublicFinancialData('optimistic'));

    // The public sector will reset itself when it receives the new initialScenario prop
    // This will trigger a re-render and the PublicPartnerships component will initialize with optimistic
  };

  // All export options organized by category - available on any tab
  const getExportOptions = () => {
    return [
      // General
      { id: 'summary', label: 'Executive Summary', description: 'Key metrics and KPIs', category: 'General' },
      { id: 'all-data', label: 'Complete Report', description: 'All data in one export', category: 'General' },

      // Private Sector
      { id: 'private-10year', label: 'Private 10-Year Projections', description: 'Year-by-year financial data', category: 'Private Sector' },
      { id: 'private-metrics', label: 'Private Key Metrics', description: 'IRR, NPV, Payback, etc.', category: 'Private Sector' },
      { id: 'private-students', label: 'Private Student Growth', description: 'Enrollment projections', category: 'Private Sector' },
      { id: 'private-revenue-detail', label: 'Private Revenue Details', description: 'Revenue breakdown by source', category: 'Private Sector' },
      { id: 'private-costs', label: 'Private Cost Structure', description: 'COGS and OpEx breakdown', category: 'Private Sector' },

      // Public Sector
      { id: 'public-10year', label: 'Public 10-Year Projections', description: 'Year-by-year public sector data', category: 'Public Sector' },
      { id: 'public-municipalities', label: 'Municipality Growth', description: 'Partnership expansion', category: 'Public Sector' },
      { id: 'public-revenue', label: 'Public Revenue Breakdown', description: 'Revenue by category', category: 'Public Sector' },
      { id: 'public-students', label: 'Public Student Adoption', description: 'Public sector enrollment', category: 'Public Sector' },

      // Consolidated
      { id: 'consolidated-projections', label: 'Consolidated Projections', description: 'Combined private + public', category: 'Consolidated' },
      { id: 'consolidated-revenue', label: 'Total Revenue', description: 'Combined revenue streams', category: 'Consolidated' },
      { id: 'consolidated-ebitda', label: 'EBITDA Analysis', description: 'Profitability metrics', category: 'Consolidated' },
      { id: 'consolidated-students', label: 'Total Student Base', description: 'Private + Public students', category: 'Consolidated' },

      // Cash Flow
      { id: 'cashflow-10year', label: 'Cash Flow Projections', description: '10-year cash flow data', category: 'Cash Flow' },
      { id: 'cashflow-monthly-y1', label: 'Year 1 Monthly Cash Flow', description: 'Monthly breakdown for 2027', category: 'Cash Flow' },
      { id: 'investment-phases', label: 'Investment Phases', description: 'CAPEX and funding breakdown', category: 'Cash Flow' },
      { id: 'funding-sources', label: 'Funding Sources', description: 'Bridge, Desenvolve SP, Prefeitura', category: 'Cash Flow' },
      { id: 'bridge-repayment', label: 'Bridge Repayment Schedule', description: 'Repayment timeline', category: 'Cash Flow' },
      { id: 'capex-schedule', label: 'CAPEX Schedule', description: 'R$40M allocation details', category: 'Cash Flow' },

      // Unit Economics
      { id: 'unit-economics', label: 'Unit Economics', description: 'Per-student metrics', category: 'Unit Economics' },
      { id: 'cac-ltv', label: 'CAC & LTV Analysis', description: 'Customer acquisition metrics', category: 'Unit Economics' },
      { id: 'margin-analysis', label: 'Margin Analysis', description: 'Gross and EBITDA margins', category: 'Unit Economics' },

      // Year-by-Year
      { id: 'yearly-breakdown', label: 'Year-by-Year Details', description: 'Detailed annual projections', category: 'Year-by-Year' },
      { id: 'yearly-comparison', label: 'YoY Growth Rates', description: 'Year-over-year comparison', category: 'Year-by-Year' },

      // Investment & Returns
      { id: 'investor-summary', label: 'Investor Summary', description: 'Key investment metrics', category: 'Investment' },
      { id: 'roi-analysis', label: 'ROI Analysis', description: 'Return on investment details', category: 'Investment' },
      { id: 'valuation-multiples', label: 'Valuation Multiples', description: 'Revenue and EBITDA multiples', category: 'Investment' },
    ];
  };

  // Handle export based on selected options
  const handleExport = (selectedOptions) => {
    console.log('handleExport called with:', selectedOptions);
    const sheets = [];
    const currentDate = new Date().toISOString().split('T')[0];

    // Safety checks for data availability
    const yearlyData = financialData?.yearlyData || [];
    const summary = financialData?.summary || {};
    const publicData = publicModelData || [];

    console.log('Data check - yearlyData length:', yearlyData.length, 'publicData length:', publicData.length);

    if (yearlyData.length === 0) {
      console.warn('No yearly data available for export');
    }

    // Executive Summary
    if (selectedOptions.includes('summary')) {
      sheets.push({
        name: 'Executive Summary',
        data: [
          { Metric: 'Year 10 Revenue', Value: formatCurrencyForExport(summary.year10Revenue || 0), Unit: 'BRL' },
          { Metric: 'Year 10 EBITDA', Value: formatCurrencyForExport(summary.year10Ebitda || 0), Unit: 'BRL' },
          { Metric: 'IRR', Value: formatPercentageForExport(summary.irr || 0), Unit: '%' },
          { Metric: 'NPV', Value: formatCurrencyForExport(summary.npv || 0), Unit: 'BRL' },
          { Metric: 'Payback Period', Value: summary.paybackPeriod || 'N/A', Unit: 'Years' },
          { Metric: 'Year 10 Students', Value: summary.year10Students || 0, Unit: 'Students' },
          { Metric: 'Private Scenario', Value: currentScenario, Unit: '' },
          { Metric: 'Public Scenario', Value: currentPublicScenario, Unit: '' },
          { Metric: 'Report Date', Value: currentDate, Unit: '' },
        ]
      });
    }

    // Private 10-Year Projections
    if (selectedOptions.includes('private-10year')) {
      sheets.push({
        name: 'Private Projections',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Students: year.students,
          'Revenue (BRL)': formatCurrencyForExport(year.revenue),
          'COGS (BRL)': formatCurrencyForExport(year.cogs),
          'Gross Profit (BRL)': formatCurrencyForExport(year.grossProfit),
          'Gross Margin (%)': formatPercentageForExport(year.grossMargin),
          'OpEx (BRL)': formatCurrencyForExport(year.opex),
          'EBITDA (BRL)': formatCurrencyForExport(year.ebitda),
          'EBITDA Margin (%)': formatPercentageForExport(year.ebitdaMargin),
        }))
      });
    }

    // Private Key Metrics
    if (selectedOptions.includes('private-metrics')) {
      sheets.push({
        name: 'Private Metrics',
        data: [
          { Metric: 'Total 10-Year Revenue', Value: formatCurrencyForExport(yearlyData.reduce((sum, y) => sum + y.revenue, 0)) },
          { Metric: 'Total 10-Year EBITDA', Value: formatCurrencyForExport(yearlyData.reduce((sum, y) => sum + y.ebitda, 0)) },
          { Metric: 'Average Gross Margin', Value: formatPercentageForExport(yearlyData.reduce((sum, y) => sum + y.grossMargin, 0) / 10) },
          { Metric: 'Average EBITDA Margin', Value: formatPercentageForExport(yearlyData.reduce((sum, y) => sum + y.ebitdaMargin, 0) / 10) },
          { Metric: 'IRR', Value: formatPercentageForExport(summary.irr || 0) },
          { Metric: 'NPV', Value: formatCurrencyForExport(summary.npv || 0) },
        ]
      });
    }

    // Student Growth
    if (selectedOptions.includes('private-students')) {
      sheets.push({
        name: 'Student Growth',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          'Total Students': year.students,
          'Revenue per Student': formatCurrencyForExport(year.revenue / year.students),
        }))
      });
    }

    // Public 10-Year Projections
    if (selectedOptions.includes('public-10year') && publicData.length > 0) {
      sheets.push({
        name: 'Public Projections',
        data: publicData.map((year, index) => ({
          Year: index + 1,
          'Calendar Year': 2027 + index,
          Students: year.students,
          Municipalities: year.municipalities,
          'Total Revenue (BRL)': formatCurrencyForExport(year.revenue?.total || year.totalRevenue || 0),
          'Costs (BRL)': formatCurrencyForExport(year.costs || 0),
          'EBITDA (BRL)': formatCurrencyForExport(year.ebitda || 0),
          'Margin (%)': formatPercentageForExport(year.margin || 0),
        }))
      });
    }

    // Public Municipalities
    if (selectedOptions.includes('public-municipalities') && publicData.length > 0) {
      sheets.push({
        name: 'Municipality Growth',
        data: publicData.map((year, index) => ({
          Year: index + 1,
          'Calendar Year': 2027 + index,
          Municipalities: year.municipalities,
          'Students': year.students,
          'Students per Municipality': Math.round(year.students / (year.municipalities || 1)),
        }))
      });
    }

    // Public Revenue Breakdown
    if (selectedOptions.includes('public-revenue') && publicData.length > 0) {
      sheets.push({
        name: 'Public Revenue Breakdown',
        data: publicData.map((year, index) => ({
          Year: index + 1,
          'Calendar Year': 2027 + index,
          'Monthly Revenue': formatCurrencyForExport(year.revenue?.monthly || 0),
          'Setup Revenue': formatCurrencyForExport(year.revenue?.setup || 0),
          'Technology Revenue': formatCurrencyForExport(year.revenue?.technology || 0),
          'Training Revenue': formatCurrencyForExport(year.revenue?.training || 0),
          'Total Revenue': formatCurrencyForExport(year.revenue?.total || year.totalRevenue || 0),
        }))
      });
    }

    // Consolidated Projections
    if (selectedOptions.includes('consolidated-projections')) {
      sheets.push({
        name: 'Consolidated Projections',
        data: yearlyData.map((privateYear, index) => {
          const publicYear = publicData[index] || {};
          return {
            Year: privateYear.year,
            'Calendar Year': 2026 + privateYear.year,
            'Private Revenue': formatCurrencyForExport(privateYear.revenue),
            'Public Revenue': formatCurrencyForExport(publicYear.revenue?.total || 0),
            'Total Revenue': formatCurrencyForExport(privateYear.revenue + (publicYear.revenue?.total || 0)),
            'Private EBITDA': formatCurrencyForExport(privateYear.ebitda),
            'Public EBITDA': formatCurrencyForExport(publicYear.ebitda || 0),
            'Total EBITDA': formatCurrencyForExport(privateYear.ebitda + (publicYear.ebitda || 0)),
          };
        })
      });
    }

    // Consolidated Revenue
    if (selectedOptions.includes('consolidated-revenue')) {
      sheets.push({
        name: 'Total Revenue',
        data: yearlyData.map((privateYear, index) => {
          const publicYear = publicData[index] || {};
          return {
            Year: privateYear.year,
            'Calendar Year': 2026 + privateYear.year,
            'Private Revenue': formatCurrencyForExport(privateYear.revenue),
            'Public Revenue': formatCurrencyForExport(publicYear.revenue?.total || 0),
            'Combined Total': formatCurrencyForExport(privateYear.revenue + (publicYear.revenue?.total || 0)),
          };
        })
      });
    }

    // EBITDA Analysis
    if (selectedOptions.includes('consolidated-ebitda')) {
      sheets.push({
        name: 'EBITDA Analysis',
        data: yearlyData.map((privateYear, index) => {
          const publicYear = publicData[index] || {};
          const totalRevenue = privateYear.revenue + (publicYear.revenue?.total || 0);
          const totalEbitda = privateYear.ebitda + (publicYear.ebitda || 0);
          return {
            Year: privateYear.year,
            'Calendar Year': 2026 + privateYear.year,
            'Private EBITDA': formatCurrencyForExport(privateYear.ebitda),
            'Private Margin': formatPercentageForExport(privateYear.ebitdaMargin),
            'Public EBITDA': formatCurrencyForExport(publicYear.ebitda || 0),
            'Public Margin': formatPercentageForExport(publicYear.margin || 0),
            'Total EBITDA': formatCurrencyForExport(totalEbitda),
            'Blended Margin': formatPercentageForExport(totalRevenue > 0 ? totalEbitda / totalRevenue : 0),
          };
        })
      });
    }

    // Cash Flow Projections
    if (selectedOptions.includes('cashflow-10year')) {
      sheets.push({
        name: 'Cash Flow',
        data: yearlyData.map((year, index) => {
          const publicYear = publicData[index] || {};
          return {
            Year: year.year,
            'Calendar Year': 2026 + year.year,
            'Private Revenue': formatCurrencyForExport(year.revenue),
            'Public Revenue': formatCurrencyForExport(publicYear.revenue?.total || 0),
            'Total Inflow': formatCurrencyForExport(year.revenue + (publicYear.revenue?.total || 0)),
            'Private EBITDA': formatCurrencyForExport(year.ebitda),
            'Public EBITDA': formatCurrencyForExport(publicYear.ebitda || 0),
            'Net Cash Flow': formatCurrencyForExport(year.ebitda + (publicYear.ebitda || 0)),
          };
        })
      });
    }

    // Investment Phases
    if (selectedOptions.includes('investment-phases')) {
      const phases = INVESTMENT_PHASES || {};
      sheets.push({
        name: 'Investment Phases',
        data: [
          { Phase: 'Phase 1 - 2026', Category: 'Semester 1 (Jan-Jul)', Amount: 10000000, Description: 'Architecture, People, Technology (Bridge Funded)' },
          { Phase: 'Phase 1 - 2026', Category: 'Semester 2 (Aug-Dec)', Amount: 15000000, Description: 'People, Tech, CAPEX (Multi-source)' },
          { Phase: 'Phase 2 - 2027', Category: 'Full Year', Amount: 15000000, Description: 'Additional CAPEX while operating' },
          { Phase: 'Total', Category: 'All Phases', Amount: 40000000, Description: 'Total CAPEX Investment' },
        ]
      });
    }

    // Funding Sources
    if (selectedOptions.includes('funding-sources')) {
      sheets.push({
        name: 'Funding Sources',
        data: [
          { Source: 'Bridge Investment', Amount: 12500000, 'Repayment': 'August 2027', Notes: 'Initial funding for Phase 1' },
          { Source: 'Desenvolve SP', Amount: 30000000, 'Repayment': 'N/A', Notes: 'CAPEX financing - disbursed August 2027' },
          { Source: 'Prefeitura Subsidy', Amount: 10000000, 'Repayment': 'N/A', Notes: '25% of total R$40M CAPEX (historic building)' },
          { Source: 'Total Funding', Amount: 52500000, 'Repayment': '', Notes: 'Total external funding' },
        ]
      });
    }

    // Unit Economics
    if (selectedOptions.includes('unit-economics')) {
      sheets.push({
        name: 'Unit Economics',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Students: year.students,
          'Revenue per Student': formatCurrencyForExport(year.revenue / year.students),
          'COGS per Student': formatCurrencyForExport(year.cogs / year.students),
          'Gross Profit per Student': formatCurrencyForExport(year.grossProfit / year.students),
          'EBITDA per Student': formatCurrencyForExport(year.ebitda / year.students),
        }))
      });
    }

    // CAC & LTV
    if (selectedOptions.includes('cac-ltv')) {
      sheets.push({
        name: 'CAC & LTV Analysis',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          'Revenue per Student': formatCurrencyForExport(year.revenue / year.students),
          'Estimated CAC': formatCurrencyForExport((year.opex * 0.3) / Math.max(1, year.students - (yearlyData[year.year - 2]?.students || 0))),
          'Annual LTV': formatCurrencyForExport(year.revenue / year.students),
          'Est. 3-Year LTV': formatCurrencyForExport((year.revenue / year.students) * 2.5),
        }))
      });
    }

    // Yearly Breakdown
    if (selectedOptions.includes('yearly-breakdown')) {
      sheets.push({
        name: 'Year-by-Year Details',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Students: year.students,
          'Revenue': formatCurrencyForExport(year.revenue),
          'COGS': formatCurrencyForExport(year.cogs),
          'Gross Profit': formatCurrencyForExport(year.grossProfit),
          'Gross Margin (%)': formatPercentageForExport(year.grossMargin),
          'OpEx': formatCurrencyForExport(year.opex),
          'EBITDA': formatCurrencyForExport(year.ebitda),
          'EBITDA Margin (%)': formatPercentageForExport(year.ebitdaMargin),
          'Net Income': formatCurrencyForExport(year.netIncome || year.ebitda * 0.66),
        }))
      });
    }

    // Complete Report (All Data)
    if (selectedOptions.includes('all-data')) {
      // Add all major sheets
      sheets.push({
        name: 'Summary',
        data: [
          { Metric: 'Year 10 Revenue', Value: formatCurrencyForExport(summary.year10Revenue || 0), Unit: 'BRL' },
          { Metric: 'Year 10 EBITDA', Value: formatCurrencyForExport(summary.year10Ebitda || 0), Unit: 'BRL' },
          { Metric: 'IRR', Value: formatPercentageForExport(summary.irr || 0), Unit: '%' },
          { Metric: 'NPV', Value: formatCurrencyForExport(summary.npv || 0), Unit: 'BRL' },
          { Metric: 'Payback Period', Value: summary.paybackPeriod || 'N/A', Unit: 'Years' },
          { Metric: 'Year 10 Students', Value: summary.year10Students || 0, Unit: 'Students' },
          { Metric: 'Report Date', Value: currentDate, Unit: '' },
        ]
      });
      sheets.push({
        name: 'All Private Data',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Students: year.students,
          Revenue: formatCurrencyForExport(year.revenue),
          COGS: formatCurrencyForExport(year.cogs),
          'Gross Profit': formatCurrencyForExport(year.grossProfit),
          'Gross Margin %': formatPercentageForExport(year.grossMargin),
          OpEx: formatCurrencyForExport(year.opex),
          EBITDA: formatCurrencyForExport(year.ebitda),
          'EBITDA Margin %': formatPercentageForExport(year.ebitdaMargin),
        }))
      });
      if (publicData.length > 0) {
        sheets.push({
          name: 'All Public Data',
          data: publicData.map((year, index) => ({
            Year: index + 1,
            'Calendar Year': 2027 + index,
            Students: year.students,
            Municipalities: year.municipalities,
            Revenue: formatCurrencyForExport(year.revenue?.total || 0),
            Costs: formatCurrencyForExport(year.costs || 0),
            EBITDA: formatCurrencyForExport(year.ebitda || 0),
            'Margin %': formatPercentageForExport(year.margin || 0),
          }))
        });
      }
    }

    // Private Revenue Details
    if (selectedOptions.includes('private-revenue-detail')) {
      sheets.push({
        name: 'Private Revenue Details',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Students: year.students,
          'Tuition Revenue': formatCurrencyForExport(year.revenue * 0.85),
          'Materials Revenue': formatCurrencyForExport(year.revenue * 0.10),
          'Other Revenue': formatCurrencyForExport(year.revenue * 0.05),
          'Total Revenue': formatCurrencyForExport(year.revenue),
          'Revenue per Student': formatCurrencyForExport(year.revenue / year.students),
        }))
      });
    }

    // Private Cost Structure
    if (selectedOptions.includes('private-costs')) {
      sheets.push({
        name: 'Private Cost Structure',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          'Total Revenue': formatCurrencyForExport(year.revenue),
          'COGS': formatCurrencyForExport(year.cogs),
          'COGS %': formatPercentageForExport(year.cogs / year.revenue),
          'Gross Profit': formatCurrencyForExport(year.grossProfit),
          'OpEx': formatCurrencyForExport(year.opex),
          'OpEx %': formatPercentageForExport(year.opex / year.revenue),
          'EBITDA': formatCurrencyForExport(year.ebitda),
          'Total Costs': formatCurrencyForExport(year.cogs + year.opex),
          'Cost per Student': formatCurrencyForExport((year.cogs + year.opex) / year.students),
        }))
      });
    }

    // Public Students
    if (selectedOptions.includes('public-students') && publicData.length > 0) {
      sheets.push({
        name: 'Public Student Adoption',
        data: publicData.map((year, index) => ({
          Year: index + 1,
          'Calendar Year': 2027 + index,
          'Public Students': year.students,
          'Municipalities': year.municipalities,
          'Students per Municipality': Math.round(year.students / (year.municipalities || 1)),
          'Revenue per Student': formatCurrencyForExport((year.revenue?.total || 0) / (year.students || 1)),
        }))
      });
    }

    // Consolidated Students
    if (selectedOptions.includes('consolidated-students')) {
      sheets.push({
        name: 'Total Student Base',
        data: yearlyData.map((privateYear, index) => {
          const publicYear = publicData[index] || {};
          return {
            Year: privateYear.year,
            'Calendar Year': 2026 + privateYear.year,
            'Private Students': privateYear.students,
            'Public Students': publicYear.students || 0,
            'Total Students': privateYear.students + (publicYear.students || 0),
            'Private %': formatPercentageForExport(privateYear.students / (privateYear.students + (publicYear.students || 1))),
            'Public %': formatPercentageForExport((publicYear.students || 0) / (privateYear.students + (publicYear.students || 1))),
          };
        })
      });
    }

    // Monthly Cash Flow Year 1
    if (selectedOptions.includes('cashflow-monthly-y1')) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      sheets.push({
        name: 'Year 1 Monthly Cash Flow',
        data: months.map((month, index) => {
          const isSecondSemester = index >= 7;
          return {
            Month: month,
            'Calendar': `${month} 2027`,
            'Private Revenue': formatCurrencyForExport((yearlyData[0]?.revenue || 0) / 12),
            'Public Revenue': 0, // No public in 2027
            'Operating Costs': formatCurrencyForExport(((yearlyData[0]?.cogs || 0) + (yearlyData[0]?.opex || 0)) / 12),
            'CAPEX': index === 0 ? 0 : (index < 7 ? formatCurrencyForExport(10000000 / 7) : formatCurrencyForExport(15000000 / 5)),
            'Bridge Funding': index === 0 ? 12500000 : 0,
            'Desenvolve SP': index === 7 ? 30000000 : 0,
            'Prefeitura': index === 7 ? 10000000 : 0,
            'Bridge Repayment': index === 7 ? -12500000 : 0,
            'Net Cash Flow': formatCurrencyForExport(
              ((yearlyData[0]?.revenue || 0) / 12) -
              (((yearlyData[0]?.cogs || 0) + (yearlyData[0]?.opex || 0)) / 12) +
              (index === 0 ? 12500000 : 0) +
              (index === 7 ? 30000000 + 10000000 - 12500000 : 0) -
              (index < 7 ? 10000000 / 7 : 15000000 / 5)
            ),
          };
        })
      });
    }

    // Bridge Repayment Schedule
    if (selectedOptions.includes('bridge-repayment')) {
      sheets.push({
        name: 'Bridge Repayment',
        data: [
          { Item: 'Bridge Investment Amount', Value: 12500000, Date: 'January 2026', Notes: 'Initial funding for Phase 1 Semester 1' },
          { Item: 'Interest Rate (estimated)', Value: '15%', Date: 'N/A', Notes: 'Estimated bridge loan rate' },
          { Item: 'Accrued Interest (7 months)', Value: 1093750, Date: 'August 2027', Notes: 'Estimated interest for 7 months' },
          { Item: 'Total Repayment', Value: 13593750, Date: 'August 2027', Notes: 'Principal + Interest' },
          { Item: 'Funding Source', Value: 'Desenvolve SP', Date: 'August 2027', Notes: 'R$30M disbursement covers repayment' },
        ]
      });
    }

    // CAPEX Schedule
    if (selectedOptions.includes('capex-schedule')) {
      sheets.push({
        name: 'CAPEX Schedule',
        data: [
          { Phase: 'Phase 1', Period: 'Jan-Jul 2026', Category: 'Architecture Project', Amount: 1200000, 'Payment': 'R$100K upfront + 24x R$45.8K', Funding: 'Bridge Investment' },
          { Phase: 'Phase 1', Period: 'Jan-Jul 2026', Category: 'People & Technology', Amount: 8800000, 'Payment': 'Monthly', Funding: 'Bridge Investment' },
          { Phase: 'Phase 1', Period: 'Aug-Dec 2026', Category: 'People & Technology', Amount: 5000000, 'Payment': 'Monthly', Funding: 'Desenvolve SP' },
          { Phase: 'Phase 1', Period: 'Aug-Dec 2026', Category: 'Construction CAPEX', Amount: 10000000, 'Payment': 'Progress payments', Funding: 'Desenvolve SP + Prefeitura' },
          { Phase: 'Phase 2', Period: 'Jan-Dec 2027', Category: 'Additional CAPEX', Amount: 15000000, 'Payment': 'Progress payments', Funding: 'Desenvolve SP' },
          { Phase: 'Total', Period: '2026-2027', Category: 'All CAPEX', Amount: 40000000, 'Payment': '', Funding: 'Multi-source' },
        ]
      });
    }

    // Margin Analysis
    if (selectedOptions.includes('margin-analysis')) {
      sheets.push({
        name: 'Margin Analysis',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          Revenue: formatCurrencyForExport(year.revenue),
          'Gross Margin %': formatPercentageForExport(year.grossMargin),
          'EBITDA Margin %': formatPercentageForExport(year.ebitdaMargin),
          'Net Margin % (est)': formatPercentageForExport(year.ebitdaMargin * 0.66),
          'Gross Margin BRL': formatCurrencyForExport(year.grossProfit),
          'EBITDA BRL': formatCurrencyForExport(year.ebitda),
        }))
      });
    }

    // YoY Growth Rates
    if (selectedOptions.includes('yearly-comparison')) {
      sheets.push({
        name: 'YoY Growth Rates',
        data: yearlyData.map((year, index) => {
          const prevYear = index > 0 ? yearlyData[index - 1] : null;
          return {
            Year: year.year,
            'Calendar Year': 2026 + year.year,
            'Revenue': formatCurrencyForExport(year.revenue),
            'Revenue Growth %': prevYear ? formatPercentageForExport((year.revenue - prevYear.revenue) / prevYear.revenue) : 'N/A',
            'Students': year.students,
            'Student Growth %': prevYear ? formatPercentageForExport((year.students - prevYear.students) / prevYear.students) : 'N/A',
            'EBITDA': formatCurrencyForExport(year.ebitda),
            'EBITDA Growth %': prevYear ? formatPercentageForExport((year.ebitda - prevYear.ebitda) / prevYear.ebitda) : 'N/A',
          };
        })
      });
    }

    // Investor Summary
    if (selectedOptions.includes('investor-summary')) {
      const totalInvestment = 40000000;
      const year10Ebitda = summary.year10Ebitda || 0;
      const year10Revenue = summary.year10Revenue || 0;
      sheets.push({
        name: 'Investor Summary',
        data: [
          { Metric: 'Total Investment Required', Value: formatCurrencyForExport(totalInvestment), Notes: 'R$40M CAPEX' },
          { Metric: 'IRR', Value: formatPercentageForExport(summary.irr || 0), Notes: 'Internal Rate of Return' },
          { Metric: 'NPV', Value: formatCurrencyForExport(summary.npv || 0), Notes: 'Net Present Value' },
          { Metric: 'Payback Period', Value: summary.paybackPeriod || 'N/A', Notes: 'Years to recover investment' },
          { Metric: 'Year 10 Revenue', Value: formatCurrencyForExport(year10Revenue), Notes: 'Private sector only' },
          { Metric: 'Year 10 EBITDA', Value: formatCurrencyForExport(year10Ebitda), Notes: 'Private sector only' },
          { Metric: 'Year 10 Students', Value: summary.year10Students || 0, Notes: 'Private sector only' },
          { Metric: 'Multiple on Invested Capital', Value: year10Ebitda > 0 ? (year10Ebitda / totalInvestment).toFixed(2) + 'x' : 'N/A', Notes: 'Year 10 EBITDA / Investment' },
        ]
      });
    }

    // ROI Analysis
    if (selectedOptions.includes('roi-analysis')) {
      const totalInvestment = 40000000;
      sheets.push({
        name: 'ROI Analysis',
        data: yearlyData.map((year, index) => {
          const cumulativeEbitda = yearlyData.slice(0, index + 1).reduce((sum, y) => sum + y.ebitda, 0);
          return {
            Year: year.year,
            'Calendar Year': 2026 + year.year,
            'Annual EBITDA': formatCurrencyForExport(year.ebitda),
            'Cumulative EBITDA': formatCurrencyForExport(cumulativeEbitda),
            'Investment Recovered': formatPercentageForExport(cumulativeEbitda / totalInvestment),
            'ROI %': formatPercentageForExport((cumulativeEbitda - totalInvestment) / totalInvestment),
          };
        })
      });
    }

    // Valuation Multiples
    if (selectedOptions.includes('valuation-multiples')) {
      sheets.push({
        name: 'Valuation Multiples',
        data: yearlyData.map(year => ({
          Year: year.year,
          'Calendar Year': 2026 + year.year,
          'Revenue': formatCurrencyForExport(year.revenue),
          'EBITDA': formatCurrencyForExport(year.ebitda),
          'EV @ 8x EBITDA': formatCurrencyForExport(year.ebitda * 8),
          'EV @ 10x EBITDA': formatCurrencyForExport(year.ebitda * 10),
          'EV @ 12x EBITDA': formatCurrencyForExport(year.ebitda * 12),
          'EV @ 3x Revenue': formatCurrencyForExport(year.revenue * 3),
          'EV @ 5x Revenue': formatCurrencyForExport(year.revenue * 5),
        }))
      });
    }

    console.log('Sheets prepared:', sheets.length, sheets.map(s => s.name));
    if (sheets.length > 0) {
      exportToExcel(sheets, `AI_School_Brazil_Report`);
    } else {
      console.warn('No sheets were prepared for export');
      alert('No data could be prepared for export. Please try selecting different options.');
    }
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Private Sector',
      icon: <School className="w-5 h-5" />,
      component: <Dashboard 
        financialData={financialData} 
        onScenarioChange={handleScenarioChange}
        currentScenario={currentScenario}
      />
    },
    {
      id: 'public',
      name: 'Public Partnerships',
      icon: <Building2 className="w-5 h-5" />,
      component: <PublicPartnerships 
        onPublicModelChange={handlePublicModelChange}
        initialScenario={currentPublicScenario}
      />
    },
    {
      id: 'consolidated',
      name: 'Consolidated View',
      icon: <TrendingUp className="w-5 h-5" />,
      component: <ConsolidatedView 
        privateFinancialData={financialData}
        publicModelData={publicModelData}
        currentPrivateScenario={currentScenario}
        currentPublicScenario={currentPublicScenario}
      />
    },
    {
      id: 'yearly',
      name: 'Private Year-by-Year',
      icon: <Calendar className="w-5 h-5" />,
      component: (
        <YearByYearEditor 
          parameters={parameters} 
          onParameterChange={handleParameterChange}
          financialData={financialData}
          currentScenario={currentScenario}
        />
      )
    },
    {
      id: 'cashflow',
      name: 'Cash Flow',
      icon: <Wallet className="w-5 h-5" />,
      component: (
        <CashFlow 
          financialData={financialData}
          parameters={parameters}
          currentScenario={currentScenario}
          publicModelData={publicModelData}
          currentPublicScenario={currentPublicScenario}
        />
      )
    },
    {
      id: 'uniteconomics',
      name: 'Unit Economics',
      icon: <Calculator className="w-5 h-5" />,
      component: (
        <UnitEconomics 
          financialData={financialData}
          parameters={parameters}
          currentScenario={currentScenario}
          publicModelData={publicModelData}
        />
      )
    },
    {
      id: 'parameters',
      name: 'Model Parameters',
      icon: <Settings className="w-5 h-5" />,
      component: (
        <ParameterControl 
          parameters={parameters} 
          onParameterChange={handleParameterChange}
        />
      )
    },
    {
      id: 'presentation',
      name: 'Investor Presentation',
      icon: <Presentation className="w-5 h-5" />,
      component: <PresentationMode 
        financialData={financialData} 
        publicModelData={publicModelData}
        currentPrivateScenario={currentScenario}
        currentPublicScenario={currentPublicScenario}
      />
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI School Brazil</h1>
                  <p className="text-sm text-gray-600">Financial Model & Business Plan</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="font-semibold text-gray-700 text-xs">Active Scenario</div>
                  <div className="text-primary-600 font-bold capitalize">{currentScenario}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{formatCurrency(financialData.summary.year10Revenue)}</div>
                  <div className="text-gray-600">Year 10 Revenue</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{formatPercentage(financialData.summary.irr)}</div>
                  <div className="text-gray-600">IRR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{new Intl.NumberFormat('pt-BR').format(financialData.summary.year10Students)}</div>
                  <div className="text-gray-600">Students</div>
                </div>
              </div>
              
              {/* Export Button */}
              <ExportButton
                exportOptions={getExportOptions()}
                onExport={handleExport}
                buttonText="Export"
                className=""
              />

              {/* Reset All Button */}
              <button
                onClick={resetAllToDefault}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Reset all tabs to default scenarios (Private: Realistic, Public: Optimistic)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset All to Default</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {activeTab !== 'presentation' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={activeTab === 'presentation' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Dashboard 
                financialData={financialData} 
                onScenarioChange={handleScenarioChange}
                currentScenario={currentScenario}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ParameterControl 
                  parameters={parameters} 
                  onParameterChange={handleParameterChange}
                  className="max-h-screen overflow-y-auto"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'public' && (
          <PublicPartnerships 
            onPublicModelChange={handlePublicModelChange}
            initialScenario={currentPublicScenario}
          />
        )}

        {activeTab === 'consolidated' && (
          <ConsolidatedView 
            privateFinancialData={financialData}
            publicModelData={publicModelData}
            currentPrivateScenario={currentScenario}
            currentPublicScenario={currentPublicScenario}
          />
        )}

        {activeTab === 'yearly' && (
          <YearByYearEditor 
            parameters={parameters} 
            onParameterChange={handleParameterChange}
            financialData={financialData}
            currentScenario={currentScenario}
          />
        )}
        
        {activeTab === 'cashflow' && (
          <CashFlow 
            financialData={financialData}
            parameters={parameters}
            currentScenario={currentScenario}
            publicModelData={publicModelData}
            currentPublicScenario={currentPublicScenario}
          />
        )}
        
        {activeTab === 'uniteconomics' && (
          <UnitEconomics 
            financialData={financialData}
            parameters={parameters}
            currentScenario={currentScenario}
            publicModelData={publicModelData}
          />
        )}
        
        {activeTab === 'parameters' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ParameterControl 
                parameters={parameters} 
                onParameterChange={handleParameterChange}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Year 10 Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(financialData.summary.year10Revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Year 10 EBITDA</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(financialData.summary.year10Ebitda)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">IRR</span>
                    <span className="font-semibold text-purple-600">
                      {formatPercentage(financialData.summary.irr)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">NPV</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(financialData.summary.npv)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Students</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR').format(financialData.summary.year10Students)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payback Period</span>
                    <span className="font-semibold text-gray-900">
                      {financialData.summary.paybackPeriod} years
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">CAPEX Scenario</h4>
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-primary-600">
                      {financialData.summary.capexScenario.name}
                    </div>
                    <div className="text-gray-600">
                      {financialData.summary.capexScenario.description}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(financialData.summary.capexScenario.initialCapex)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'presentation' && (
          <div>
            <PresentationMode 
              financialData={financialData} 
              publicModelData={publicModelData}
              currentPrivateScenario={currentScenario}
              currentPublicScenario={currentPublicScenario}
            />
            <div className="fixed top-4 left-4 z-50 no-print">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-white text-gray-700 rounded-md shadow-lg hover:bg-gray-50 border border-gray-200"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {activeTab !== 'presentation' && (
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>AI School Brazil - Financial Model &copy; 2024</p>
                <p>Interactive financial planning for AI-powered education</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-time calculations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Scenario modeling</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;