import React, { useMemo, useState, useCallback } from 'react';
import { DollarSign, Users, Building, BookOpen, Briefcase, Settings, TrendingDown, ChevronDown, ChevronRight, MousePointer } from 'lucide-react';
import { CAPEX_SCENARIOS } from '../utils/financialModel';
import ExpenseDetailModal from './ExpenseDetailModal';
import { getStaffBreakdownTotal } from './MonthDetailModal';

// Define all expense items with their metadata
const EXPENSE_DEFINITIONS = {
  // STAFF - Uses actual staff breakdown totals (click to see details)
  'staff.corporate': {
    id: 'staff.corporate',
    label: 'Corporate Staff',
    field: 'staff.corporate',
    formula: 'Sum of actual staff salaries × 12 months',
    section: 'staff',
    useBreakdown: true, // Flag to use breakdown totals instead of formula
  },
  'staff.flagship': {
    id: 'staff.flagship',
    label: 'Flagship Staff (Teachers + Admin)',
    field: 'staff.flagship',
    formula: 'Sum of actual staff salaries × 12 months',
    section: 'staff',
    useBreakdown: true,
  },
  'staff.franchiseSupport': {
    id: 'staff.franchiseSupport',
    label: 'Franchise Support Staff',
    field: 'staff.franchiseSupport',
    formula: 'Sum of actual staff salaries × 12 months',
    section: 'staff',
    useBreakdown: true,
  },
  'staff.adoptionSupport': {
    id: 'staff.adoptionSupport',
    label: 'Adoption Support Staff',
    field: 'staff.adoptionSupport',
    formula: 'Sum of actual staff salaries × 12 months',
    section: 'staff',
    useBreakdown: true,
  },

  // OPERATIONAL
  'operational.technology': {
    id: 'operational.technology',
    label: 'Technology (Platform & Infrastructure)',
    field: 'operational.technology',
    formula: 'Y0: R$2M from Bridge (Feb-Jul), Y1+: Revenue × 4%',
    section: 'operational',
  },
  'operational.marketing': {
    id: 'operational.marketing',
    label: 'Marketing & Sales',
    field: 'operational.marketing',
    formula: 'Revenue × 5%',
    section: 'operational',
  },
  'operational.facilities': {
    id: 'operational.facilities',
    label: 'Facilities (Rent, Utilities, Maintenance)',
    field: 'operational.facilities',
    formula: 'R$1.5M × (1.05)^year',
    section: 'operational',
  },

  // EDUCATIONAL
  'educational.teacherTraining': {
    id: 'educational.teacherTraining',
    label: 'Teacher Training',
    field: 'educational.teacherTraining',
    formula: 'Max(R$200K, (flagship+franchise) × R$250) × inflation',
    section: 'educational',
  },
  'educational.qualityAssurance': {
    id: 'educational.qualityAssurance',
    label: 'Quality Assurance',
    field: 'educational.qualityAssurance',
    formula: 'Max(R$45K, Revenue × 0.15%)',
    section: 'educational',
  },
  'educational.regulatoryCompliance': {
    id: 'educational.regulatoryCompliance',
    label: 'Regulatory Compliance',
    field: 'educational.regulatoryCompliance',
    formula: 'Max(R$60K, Revenue × 0.075%)',
    section: 'educational',
  },
  'educational.dataManagement': {
    id: 'educational.dataManagement',
    label: 'Data Management',
    field: 'educational.dataManagement',
    formula: 'Max(R$200K, students × R$40)',
    section: 'educational',
  },
  'educational.parentEngagement': {
    id: 'educational.parentEngagement',
    label: 'Parent Engagement',
    field: 'educational.parentEngagement',
    formula: 'Max(R$150K, students × R$60)',
    section: 'educational',
  },
  'educational.contentDevelopment': {
    id: 'educational.contentDevelopment',
    label: 'Content Development',
    field: 'educational.contentDevelopment',
    formula: 'Y0: R$1.5M (10% Innovation loan), Y1+: Yearly budget',
    section: 'educational',
  },

  // BUSINESS
  'business.badDebt': {
    id: 'business.badDebt',
    label: 'Bad Debt Provision',
    field: 'business.badDebt',
    formula: 'Revenue × 2%',
    section: 'business',
  },
  'business.paymentProcessing': {
    id: 'business.paymentProcessing',
    label: 'Payment Processing Fees',
    field: 'business.paymentProcessing',
    formula: 'Revenue × 2.5%',
    section: 'business',
  },
  'business.platformRD': {
    id: 'business.platformRD',
    label: 'Platform R&D',
    field: 'business.platformRD',
    formula: 'Y0: Innovation loan, Y1+: Revenue × 6%',
    section: 'business',
  },

  // OTHER
  'other.legal': {
    id: 'other.legal',
    label: 'Legal & Compliance',
    field: 'other.legal',
    formula: 'Max(R$500K, Revenue × 0.3%)',
    section: 'other',
  },
  'other.insurance': {
    id: 'other.insurance',
    label: 'Insurance',
    field: 'other.insurance',
    formula: 'R$100K × inflation',
    section: 'other',
  },
  'other.travel': {
    id: 'other.travel',
    label: 'Travel & Logistics',
    field: 'other.travel',
    formula: 'Max(R$300K, (franchises + adoptionStudents÷5000) × R$50K)',
    section: 'other',
  },
  'other.workingCapital': {
    id: 'other.workingCapital',
    label: 'Working Capital Reserve',
    field: 'other.workingCapital',
    formula: 'Revenue × 1%',
    section: 'other',
  },
  'other.contingency': {
    id: 'other.contingency',
    label: 'Contingency',
    field: 'other.contingency',
    formula: 'Revenue × 0.5%',
    section: 'other',
  },

  // CAPEX
  'capex.amount': {
    id: 'capex.amount',
    label: 'CAPEX (Building, Equipment, Tech)',
    field: 'capex.amount',
    formula: 'Y0: R$20M, Y1: R$5M, then maintenance',
    section: 'capex',
  },
  'capex.architectPayment': {
    id: 'capex.architectPayment',
    label: 'Architect Project Payments',
    field: 'capex.architectPayment',
    formula: 'R$100K upfront + R$45.8K/mo × 24 months',
    section: 'capex',
  },

  // DEBT SERVICE
  'debtService.bridgeInterest': {
    id: 'debtService.bridgeInterest',
    label: 'Bridge Loan Interest',
    field: 'debtService.bridgeInterest',
    formula: 'R$10M × 2%/mo × 9 months (Jan-Oct 2026)',
    section: 'debtService',
  },
  'debtService.bridgeRepayment': {
    id: 'debtService.bridgeRepayment',
    label: 'Bridge Loan Repayment',
    field: 'debtService.bridgeRepayment',
    formula: 'R$10M principal in October 2026',
    section: 'debtService',
  },
  'debtService.dspInterest': {
    id: 'debtService.dspInterest',
    label: 'Desenvolve SP Interest',
    field: 'debtService.dspInterest',
    formula: 'R$30M × 8.4%/year (0.7%/mo, 36-mo grace)',
    section: 'debtService',
  },
  'debtService.innovationInterest': {
    id: 'debtService.innovationInterest',
    label: 'Innovation Loan Interest',
    field: 'debtService.innovationInterest',
    formula: 'R$15M × 8.4%/year (0.7%/mo, 36-mo grace)',
    section: 'debtService',
  },
  'debtService.principal': {
    id: 'debtService.principal',
    label: 'Principal Payments',
    field: 'debtService.principal',
    formula: 'R$45M ÷ 5 = R$9M/year starting 2030',
    section: 'debtService',
  },
};

const AllExpenses = ({ financialData, parameters, currentScenario, onExpenseOverride }) => {
  const [expandedSections, setExpandedSections] = useState({
    staff: true,
    operational: true,
    educational: true,
    business: true,
    other: true,
    capex: true,
    debtService: true,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedYearData, setSelectedYearData] = useState(null);

  // Store expense overrides locally
  const [expenseOverrides, setExpenseOverrides] = useState({});

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMillions = (value) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0';
    if (Math.abs(value) >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return `R$ ${(value / 1000).toFixed(0)}K`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle expense click to open modal
  const handleExpenseClick = useCallback((expenseId, yearData) => {
    const expense = EXPENSE_DEFINITIONS[expenseId];
    if (expense) {
      setSelectedExpense(expense);
      setSelectedYearData(yearData);
      setIsModalOpen(true);
    }
  }, []);

  // Handle save from modal
  const handleExpenseSave = useCallback((data) => {
    const key = `${data.expenseId}_${data.yearIndex}`;
    setExpenseOverrides(prev => ({
      ...prev,
      [key]: {
        monthlyValues: data.monthlyValues,
        annualTotal: data.annualTotal,
        // Store item-level overrides if provided
        itemOverrides: data.itemOverrides || prev[key]?.itemOverrides || {},
      }
    }));

    // Notify parent if callback provided
    if (onExpenseOverride) {
      onExpenseOverride(data);
    }

    console.log('Expense override saved:', data);
  }, [onExpenseOverride]);

  // Calculate all expenses for each year
  const expenseData = useMemo(() => {
    if (!financialData?.projection) return [];

    const projection = financialData.projection;
    const years = [];

    for (let yearIndex = 0; yearIndex <= 10; yearIndex++) {
      const yearData = projection[yearIndex];
      if (!yearData) continue;

      const costs = yearData.costs || {};
      const calendarYear = 2026 + yearIndex;

      // Calculate debt service details
      let debtService = {
        bridgeInterest: 0,
        bridgeRepayment: 0,
        dspInterest: 0,
        innovationInterest: 0,
        principal: 0,
        totalDebtService: 0,
      };

      if (parameters?.capexScenario === 'private-historic') {
        if (yearIndex === 0) {
          debtService.bridgeInterest = 1800000;
          debtService.bridgeRepayment = 10000000;
        }

        if (yearIndex >= 1) {
          // 0.7% monthly = 8.4% annual
          debtService.dspInterest = 30000000 * 0.084;
          debtService.innovationInterest = 15000000 * 0.084;
        }

        const graceEndYear = 4;
        if (yearIndex >= graceEndYear && yearIndex < graceEndYear + 5) {
          debtService.principal = 9000000;
          const yearsSinceGraceEnd = yearIndex - graceEndYear;
          const remainingPrincipal = 45000000 - (yearsSinceGraceEnd * 9000000);
          // 0.7% monthly = 8.4% annual
          debtService.dspInterest = (remainingPrincipal * 0.084) * (30/45);
          debtService.innovationInterest = (remainingPrincipal * 0.084) * (15/45);
        }

        debtService.totalDebtService = debtService.bridgeInterest + debtService.bridgeRepayment +
          debtService.dspInterest + debtService.innovationInterest + debtService.principal;
      }

      // Apply any overrides
      const applyOverride = (expenseId, originalValue) => {
        const key = `${expenseId}_${yearIndex}`;
        if (expenseOverrides[key]) {
          return expenseOverrides[key].annualTotal;
        }
        return originalValue;
      };

      // Get actual staff breakdown totals (monthly × 12)
      // This uses the real staff items defined in MonthDetailModal
      const getStaffAnnualTotal = (expenseId) => {
        const monthlyTotal = getStaffBreakdownTotal(expenseId, yearIndex, 0);
        if (monthlyTotal !== null && monthlyTotal > 0) {
          return monthlyTotal * 12; // Annual = monthly × 12
        }
        return 0;
      };

      // Staff values from actual breakdown (not formula)
      const staffCorporate = applyOverride('staff.corporate', getStaffAnnualTotal('staff.corporate'));
      const staffFlagship = applyOverride('staff.flagship', getStaffAnnualTotal('staff.flagship'));
      const staffFranchiseSupport = applyOverride('staff.franchiseSupport', getStaffAnnualTotal('staff.franchiseSupport'));
      const staffAdoptionSupport = applyOverride('staff.adoptionSupport', getStaffAnnualTotal('staff.adoptionSupport'));

      years.push({
        yearIndex,
        calendarYear,
        label: yearIndex === 0 ? 'Y0 (2026)' : `Y${yearIndex} (${calendarYear})`,

        // STAFF EXPENSES - from actual breakdown totals
        staff: {
          corporate: staffCorporate,
          flagship: staffFlagship,
          franchiseSupport: staffFranchiseSupport,
          adoptionSupport: staffAdoptionSupport,
          subtotal: staffCorporate + staffFlagship + staffFranchiseSupport + staffAdoptionSupport,
        },

        // OPERATIONAL EXPENSES
        operational: {
          technology: applyOverride('operational.technology', costs.technologyOpex || 0),
          marketing: applyOverride('operational.marketing', costs.marketing || 0),
          facilities: applyOverride('operational.facilities', costs.facilities || 0),
          subtotal: applyOverride('operational.technology', costs.technologyOpex || 0) +
                   applyOverride('operational.marketing', costs.marketing || 0) +
                   applyOverride('operational.facilities', costs.facilities || 0),
        },

        // EDUCATIONAL EXPENSES
        educational: {
          teacherTraining: applyOverride('educational.teacherTraining', costs.teacherTraining || 0),
          qualityAssurance: applyOverride('educational.qualityAssurance', costs.qualityAssurance || 0),
          regulatoryCompliance: applyOverride('educational.regulatoryCompliance', costs.regulatoryCompliance || 0),
          dataManagement: applyOverride('educational.dataManagement', costs.dataManagement || 0),
          parentEngagement: applyOverride('educational.parentEngagement', costs.parentEngagement || 0),
          contentDevelopment: applyOverride('educational.contentDevelopment', costs.contentDevelopment || 0),
          subtotal: applyOverride('educational.teacherTraining', costs.teacherTraining || 0) +
                   applyOverride('educational.qualityAssurance', costs.qualityAssurance || 0) +
                   applyOverride('educational.regulatoryCompliance', costs.regulatoryCompliance || 0) +
                   applyOverride('educational.dataManagement', costs.dataManagement || 0) +
                   applyOverride('educational.parentEngagement', costs.parentEngagement || 0) +
                   applyOverride('educational.contentDevelopment', costs.contentDevelopment || 0),
        },

        // BUSINESS EXPENSES
        business: {
          badDebt: applyOverride('business.badDebt', costs.badDebt || 0),
          paymentProcessing: applyOverride('business.paymentProcessing', costs.paymentProcessing || 0),
          platformRD: applyOverride('business.platformRD', costs.platformRD || 0),
          subtotal: applyOverride('business.badDebt', costs.badDebt || 0) +
                   applyOverride('business.paymentProcessing', costs.paymentProcessing || 0) +
                   applyOverride('business.platformRD', costs.platformRD || 0),
        },

        // OTHER EXPENSES
        other: {
          legal: applyOverride('other.legal', costs.legal || 0),
          insurance: applyOverride('other.insurance', costs.insurance || 0),
          travel: applyOverride('other.travel', costs.travel || 0),
          workingCapital: applyOverride('other.workingCapital', costs.workingCapital || 0),
          contingency: applyOverride('other.contingency', costs.contingency || 0),
          subtotal: applyOverride('other.legal', costs.legal || 0) +
                   applyOverride('other.insurance', costs.insurance || 0) +
                   applyOverride('other.travel', costs.travel || 0) +
                   applyOverride('other.workingCapital', costs.workingCapital || 0) +
                   applyOverride('other.contingency', costs.contingency || 0),
        },

        // CAPEX
        capex: {
          amount: applyOverride('capex.amount', yearData.capex || 0),
          architectPayment: applyOverride('capex.architectPayment', costs.architectPayment || 0),
          subtotal: applyOverride('capex.amount', yearData.capex || 0) +
                   applyOverride('capex.architectPayment', costs.architectPayment || 0),
        },

        // DEBT SERVICE
        debtService: {
          bridgeInterest: applyOverride('debtService.bridgeInterest', debtService.bridgeInterest),
          bridgeRepayment: applyOverride('debtService.bridgeRepayment', debtService.bridgeRepayment),
          dspInterest: applyOverride('debtService.dspInterest', debtService.dspInterest),
          innovationInterest: applyOverride('debtService.innovationInterest', debtService.innovationInterest),
          principal: applyOverride('debtService.principal', debtService.principal),
          totalDebtService: debtService.totalDebtService,
        },

        // TOTALS - Calculate using actual staff breakdown values
        totalOperatingCosts: (() => {
          const staffTotal = staffCorporate + staffFlagship + staffFranchiseSupport + staffAdoptionSupport;
          const nonStaffCosts = (costs.technologyOpex || 0) + (costs.marketing || 0) + (costs.facilities || 0) +
                         (costs.teacherTraining || 0) + (costs.qualityAssurance || 0) + (costs.regulatoryCompliance || 0) +
                         (costs.dataManagement || 0) + (costs.parentEngagement || 0) + (costs.contentDevelopment || 0) +
                         (costs.badDebt || 0) + (costs.paymentProcessing || 0) + (costs.platformRD || 0) +
                         (costs.legal || 0) + (costs.insurance || 0) + (costs.travel || 0) +
                         (costs.workingCapital || 0) + (costs.contingency || 0);
          return staffTotal + nonStaffCosts;
        })(),
        totalCashOut: (() => {
          const staffTotal = staffCorporate + staffFlagship + staffFranchiseSupport + staffAdoptionSupport;
          const nonStaffCosts = (costs.technologyOpex || 0) + (costs.marketing || 0) + (costs.facilities || 0) +
                         (costs.teacherTraining || 0) + (costs.qualityAssurance || 0) + (costs.regulatoryCompliance || 0) +
                         (costs.dataManagement || 0) + (costs.parentEngagement || 0) + (costs.contentDevelopment || 0) +
                         (costs.badDebt || 0) + (costs.paymentProcessing || 0) + (costs.platformRD || 0) +
                         (costs.legal || 0) + (costs.insurance || 0) + (costs.travel || 0) +
                         (costs.workingCapital || 0) + (costs.contingency || 0);
          const totalOpCosts = staffTotal + nonStaffCosts;
          return totalOpCosts + (yearData.capex || 0) + (costs.architectPayment || 0) + debtService.totalDebtService;
        })(),

        // Revenue for reference
        revenue: yearData.revenue?.total || 0,
        // Recalculate EBITDA with actual staff costs
        ebitda: (() => {
          const staffTotal = staffCorporate + staffFlagship + staffFranchiseSupport + staffAdoptionSupport;
          const nonStaffCosts = (costs.technologyOpex || 0) + (costs.marketing || 0) + (costs.facilities || 0) +
                         (costs.teacherTraining || 0) + (costs.qualityAssurance || 0) + (costs.regulatoryCompliance || 0) +
                         (costs.dataManagement || 0) + (costs.parentEngagement || 0) + (costs.contentDevelopment || 0) +
                         (costs.badDebt || 0) + (costs.paymentProcessing || 0) + (costs.platformRD || 0) +
                         (costs.legal || 0) + (costs.insurance || 0) + (costs.travel || 0) +
                         (costs.workingCapital || 0) + (costs.contingency || 0);
          const totalOpCosts = staffTotal + nonStaffCosts;
          return (yearData.revenue?.total || 0) - totalOpCosts;
        })(),
        students: yearData.students?.total || 0,
      });
    }

    return years;
  }, [financialData, parameters, expenseOverrides]);

  // Calculate totals across all years
  const totals = useMemo(() => {
    if (expenseData.length === 0) return null;

    const sumField = (arr, path) => arr.reduce((sum, year) => {
      const value = path.split('.').reduce((obj, key) => obj?.[key], year);
      return sum + (value || 0);
    }, 0);

    return {
      staff: {
        corporate: sumField(expenseData, 'staff.corporate'),
        flagship: sumField(expenseData, 'staff.flagship'),
        franchiseSupport: sumField(expenseData, 'staff.franchiseSupport'),
        adoptionSupport: sumField(expenseData, 'staff.adoptionSupport'),
        subtotal: sumField(expenseData, 'staff.subtotal'),
      },
      operational: {
        technology: sumField(expenseData, 'operational.technology'),
        marketing: sumField(expenseData, 'operational.marketing'),
        facilities: sumField(expenseData, 'operational.facilities'),
        subtotal: sumField(expenseData, 'operational.subtotal'),
      },
      educational: {
        teacherTraining: sumField(expenseData, 'educational.teacherTraining'),
        qualityAssurance: sumField(expenseData, 'educational.qualityAssurance'),
        regulatoryCompliance: sumField(expenseData, 'educational.regulatoryCompliance'),
        dataManagement: sumField(expenseData, 'educational.dataManagement'),
        parentEngagement: sumField(expenseData, 'educational.parentEngagement'),
        contentDevelopment: sumField(expenseData, 'educational.contentDevelopment'),
        subtotal: sumField(expenseData, 'educational.subtotal'),
      },
      business: {
        badDebt: sumField(expenseData, 'business.badDebt'),
        paymentProcessing: sumField(expenseData, 'business.paymentProcessing'),
        platformRD: sumField(expenseData, 'business.platformRD'),
        subtotal: sumField(expenseData, 'business.subtotal'),
      },
      other: {
        legal: sumField(expenseData, 'other.legal'),
        insurance: sumField(expenseData, 'other.insurance'),
        travel: sumField(expenseData, 'other.travel'),
        workingCapital: sumField(expenseData, 'other.workingCapital'),
        contingency: sumField(expenseData, 'other.contingency'),
        subtotal: sumField(expenseData, 'other.subtotal'),
      },
      capex: {
        amount: sumField(expenseData, 'capex.amount'),
        architectPayment: sumField(expenseData, 'capex.architectPayment'),
        subtotal: sumField(expenseData, 'capex.subtotal'),
      },
      debtService: {
        bridgeInterest: sumField(expenseData, 'debtService.bridgeInterest'),
        bridgeRepayment: sumField(expenseData, 'debtService.bridgeRepayment'),
        dspInterest: sumField(expenseData, 'debtService.dspInterest'),
        innovationInterest: sumField(expenseData, 'debtService.innovationInterest'),
        principal: sumField(expenseData, 'debtService.principal'),
        totalDebtService: sumField(expenseData, 'debtService.totalDebtService'),
      },
      totalOperatingCosts: sumField(expenseData, 'totalOperatingCosts'),
      totalCashOut: sumField(expenseData, 'totalCashOut'),
      revenue: sumField(expenseData, 'revenue'),
    };
  }, [expenseData]);

  const SectionHeader = ({ icon: Icon, title, section, color, subtotal }) => (
    <tr
      className={`bg-${color}-50 cursor-pointer hover:bg-${color}-100 transition-colors`}
      onClick={() => toggleSection(section)}
    >
      <td className={`sticky left-0 bg-${color}-50 hover:bg-${color}-100 px-4 py-3 font-semibold text-gray-900`}>
        <div className="flex items-center space-x-2">
          {expandedSections[section] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Icon className={`w-5 h-5 text-${color}-600`} />
          <span>{title}</span>
        </div>
      </td>
      {expenseData.map((year) => {
        const value = year[section]?.subtotal ?? year[section]?.totalDebtService ?? 0;
        return (
          <td key={year.yearIndex} className={`px-3 py-3 text-right font-semibold text-${color}-700`}>
            {formatMillions(value)}
          </td>
        );
      })}
      <td className={`px-3 py-3 text-right font-bold text-${color}-800 bg-${color}-100`}>
        {formatMillions(subtotal)}
      </td>
    </tr>
  );

  const ExpenseRow = ({ expenseId }) => {
    const expense = EXPENSE_DEFINITIONS[expenseId];
    if (!expense || !expandedSections[expense.section]) return null;

    const hasOverride = expenseData.some((year) => {
      const key = `${expenseId}_${year.yearIndex}`;
      return expenseOverrides[key];
    });

    return (
      <tr className="hover:bg-blue-50 border-b border-gray-100 cursor-pointer group transition-colors">
        <td
          className="sticky left-0 bg-white group-hover:bg-blue-50 px-6 py-2 text-sm text-gray-700 transition-colors"
          onClick={() => handleExpenseClick(expenseId, expenseData[1])}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span>{expense.label}</span>
                {hasOverride && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Modified</span>
                )}
              </div>
              <div className="text-xs text-gray-400 italic">{expense.formula}</div>
            </div>
            <MousePointer className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </td>
        {expenseData.map((year) => {
          const value = expense.field.split('.').reduce((obj, key) => obj?.[key], year);
          const key = `${expenseId}_${year.yearIndex}`;
          const isOverridden = expenseOverrides[key];

          return (
            <td
              key={year.yearIndex}
              className={`px-3 py-2 text-right text-sm cursor-pointer hover:bg-blue-100 transition-colors ${
                isOverridden ? 'text-amber-700 font-medium' : 'text-gray-600'
              }`}
              onClick={() => handleExpenseClick(expenseId, year)}
            >
              {formatMillions(value || 0)}
            </td>
          );
        })}
        <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 bg-gray-50">
          {formatMillions(expense.field.split('.').reduce((obj, key) => obj?.[key], totals) || 0)}
        </td>
      </tr>
    );
  };

  if (!financialData || expenseData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500">Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Expenses - 10 Year View</h2>
            <p className="text-gray-600 mt-1">
              Click any expense row to see monthly breakdown and edit values
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Scenario: <span className="font-medium capitalize">{currentScenario}</span> |
              CAPEX: <span className="font-medium">{CAPEX_SCENARIOS[parameters?.capexScenario]?.name || 'Private Historic'}</span>
            </p>
            {Object.keys(expenseOverrides).length > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {Object.keys(expenseOverrides).length} expense(s) have been modified
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">10-Year Total Operating Costs</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals?.totalOperatingCosts)}</div>
            <div className="text-sm text-gray-500 mt-2">10-Year Total Cash Out (incl. CAPEX & Debt)</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(totals?.totalCashOut)}</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, staff: !prev.staff }))}>
            <div className="text-xs text-blue-600 font-medium">Staff</div>
            <div className="text-lg font-bold text-blue-800">{formatMillions(totals?.staff?.subtotal)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, operational: !prev.operational }))}>
            <div className="text-xs text-green-600 font-medium">Operational</div>
            <div className="text-lg font-bold text-green-800">{formatMillions(totals?.operational?.subtotal)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, educational: !prev.educational }))}>
            <div className="text-xs text-purple-600 font-medium">Educational</div>
            <div className="text-lg font-bold text-purple-800">{formatMillions(totals?.educational?.subtotal)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, business: !prev.business }))}>
            <div className="text-xs text-orange-600 font-medium">Business</div>
            <div className="text-lg font-bold text-orange-800">{formatMillions(totals?.business?.subtotal)}</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, other: !prev.other }))}>
            <div className="text-xs text-gray-600 font-medium">Other</div>
            <div className="text-lg font-bold text-gray-800">{formatMillions(totals?.other?.subtotal)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, capex: !prev.capex }))}>
            <div className="text-xs text-red-600 font-medium">CAPEX</div>
            <div className="text-lg font-bold text-red-800">{formatMillions(totals?.capex?.subtotal)}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setExpandedSections(prev => ({ ...prev, debtService: !prev.debtService }))}>
            <div className="text-xs text-yellow-700 font-medium">Debt Service</div>
            <div className="text-lg font-bold text-yellow-800">{formatMillions(totals?.debtService?.totalDebtService)}</div>
          </div>
        </div>
      </div>

      {/* Instruction Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
        <MousePointer className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Click any expense row</strong> to open a detailed monthly view where you can see the breakdown and edit values for each month.
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="sticky left-0 bg-gray-800 px-4 py-3 text-left font-semibold min-w-[280px]">
                  Expense Category
                </th>
                {expenseData.map((year) => (
                  <th key={year.yearIndex} className="px-3 py-3 text-right font-semibold min-w-[100px]">
                    {year.label}
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold min-w-[120px] bg-gray-900">
                  10-Year Total
                </th>
              </tr>
              {/* Reference Row */}
              <tr className="bg-gray-100 text-gray-600 text-xs">
                <td className="sticky left-0 bg-gray-100 px-4 py-2 font-medium">Revenue (Reference)</td>
                {expenseData.map((year) => (
                  <td key={year.yearIndex} className="px-3 py-2 text-right">
                    {formatMillions(year.revenue)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium bg-gray-200">
                  {formatMillions(totals?.revenue)}
                </td>
              </tr>
            </thead>
            <tbody>
              {/* STAFF EXPENSES */}
              <SectionHeader
                icon={Users}
                title="Staff Expenses"
                section="staff"
                color="blue"
                subtotal={totals?.staff?.subtotal}
              />
              <ExpenseRow expenseId="staff.corporate" />
              <ExpenseRow expenseId="staff.flagship" />
              <ExpenseRow expenseId="staff.franchiseSupport" />
              <ExpenseRow expenseId="staff.adoptionSupport" />

              {/* OPERATIONAL EXPENSES */}
              <SectionHeader
                icon={Settings}
                title="Operational Expenses"
                section="operational"
                color="green"
                subtotal={totals?.operational?.subtotal}
              />
              <ExpenseRow expenseId="operational.technology" />
              <ExpenseRow expenseId="operational.marketing" />
              <ExpenseRow expenseId="operational.facilities" />

              {/* EDUCATIONAL EXPENSES */}
              <SectionHeader
                icon={BookOpen}
                title="Educational Expenses"
                section="educational"
                color="purple"
                subtotal={totals?.educational?.subtotal}
              />
              <ExpenseRow expenseId="educational.teacherTraining" />
              <ExpenseRow expenseId="educational.qualityAssurance" />
              <ExpenseRow expenseId="educational.regulatoryCompliance" />
              <ExpenseRow expenseId="educational.dataManagement" />
              <ExpenseRow expenseId="educational.parentEngagement" />
              <ExpenseRow expenseId="educational.contentDevelopment" />

              {/* BUSINESS EXPENSES */}
              <SectionHeader
                icon={Briefcase}
                title="Business Expenses"
                section="business"
                color="orange"
                subtotal={totals?.business?.subtotal}
              />
              <ExpenseRow expenseId="business.badDebt" />
              <ExpenseRow expenseId="business.paymentProcessing" />
              <ExpenseRow expenseId="business.platformRD" />

              {/* OTHER EXPENSES */}
              <SectionHeader
                icon={DollarSign}
                title="Other Expenses"
                section="other"
                color="gray"
                subtotal={totals?.other?.subtotal}
              />
              <ExpenseRow expenseId="other.legal" />
              <ExpenseRow expenseId="other.insurance" />
              <ExpenseRow expenseId="other.travel" />
              <ExpenseRow expenseId="other.workingCapital" />
              <ExpenseRow expenseId="other.contingency" />

              {/* CAPEX */}
              <SectionHeader
                icon={Building}
                title="Capital Expenditures (CAPEX)"
                section="capex"
                color="red"
                subtotal={totals?.capex?.subtotal}
              />
              <ExpenseRow expenseId="capex.amount" />
              <ExpenseRow expenseId="capex.architectPayment" />

              {/* DEBT SERVICE */}
              <SectionHeader
                icon={TrendingDown}
                title="Debt Service"
                section="debtService"
                color="yellow"
                subtotal={totals?.debtService?.totalDebtService}
              />
              <ExpenseRow expenseId="debtService.bridgeInterest" />
              <ExpenseRow expenseId="debtService.bridgeRepayment" />
              <ExpenseRow expenseId="debtService.dspInterest" />
              <ExpenseRow expenseId="debtService.innovationInterest" />
              <ExpenseRow expenseId="debtService.principal" />

              {/* TOTALS */}
              <tr className="bg-gray-800 text-white font-bold">
                <td className="sticky left-0 bg-gray-800 px-4 py-4">
                  TOTAL OPERATING EXPENSES
                </td>
                {expenseData.map((year) => (
                  <td key={year.yearIndex} className="px-3 py-4 text-right">
                    {formatMillions(year.totalOperatingCosts)}
                  </td>
                ))}
                <td className="px-3 py-4 text-right bg-gray-900">
                  {formatCurrency(totals?.totalOperatingCosts)}
                </td>
              </tr>
              <tr className="bg-red-800 text-white font-bold">
                <td className="sticky left-0 bg-red-800 px-4 py-4">
                  TOTAL CASH OUT (OpEx + CAPEX + Debt)
                </td>
                {expenseData.map((year) => (
                  <td key={year.yearIndex} className="px-3 py-4 text-right">
                    {formatMillions(year.totalCashOut)}
                  </td>
                ))}
                <td className="px-3 py-4 text-right bg-red-900">
                  {formatCurrency(totals?.totalCashOut)}
                </td>
              </tr>
              <tr className="bg-green-700 text-white font-bold">
                <td className="sticky left-0 bg-green-700 px-4 py-4">
                  EBITDA (Revenue - Operating Costs)
                </td>
                {expenseData.map((year) => (
                  <td key={year.yearIndex} className="px-3 py-4 text-right">
                    {formatMillions(year.ebitda)}
                  </td>
                ))}
                <td className="px-3 py-4 text-right bg-green-800">
                  {formatCurrency(expenseData.reduce((sum, y) => sum + y.ebitda, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        yearData={selectedYearData}
        allYearsData={expenseData}
        onSave={handleExpenseSave}
        parameters={parameters}
        expenseOverrides={expenseOverrides}
      />
    </div>
  );
};

export default AllExpenses;
