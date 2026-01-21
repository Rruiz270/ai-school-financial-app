import React, { useMemo, useState } from 'react';
import { DollarSign, Users, Building, BookOpen, Briefcase, Settings, TrendingDown, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { INVESTMENT_PHASES, CAPEX_SCENARIOS } from '../utils/financialModel';

const AllExpenses = ({ financialData, parameters, currentScenario }) => {
  const [expandedSections, setExpandedSections] = useState({
    staff: true,
    operational: true,
    educational: true,
    business: true,
    other: true,
    capex: true,
    debtService: true,
  });

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
          // Bridge interest: ~2% × 9 months (Jan-Oct)
          debtService.bridgeInterest = 1800000;
          debtService.bridgeRepayment = 10000000;
        }

        // Interest on DSP (R$30M) and Innovation (R$15M) loans
        if (yearIndex >= 1) {
          // DSP: R$30M × 12% = R$3.6M/year
          debtService.dspInterest = 30000000 * 0.12;
          // Innovation: R$15M × 12% = R$1.8M/year
          debtService.innovationInterest = 15000000 * 0.12;
        }

        // Principal payments start Year 4 (2030) - grace period ends Aug 2029
        const graceEndYear = 4;
        if (yearIndex >= graceEndYear && yearIndex < graceEndYear + 5) {
          // 5-year amortization: R$45M / 5 = R$9M/year
          debtService.principal = 9000000;
          // Reduce interest as principal is paid down
          const yearsSinceGraceEnd = yearIndex - graceEndYear;
          const remainingPrincipal = 45000000 - (yearsSinceGraceEnd * 9000000);
          debtService.dspInterest = (remainingPrincipal * 0.12) * (30/45);
          debtService.innovationInterest = (remainingPrincipal * 0.12) * (15/45);
        }

        debtService.totalDebtService = debtService.bridgeInterest + debtService.bridgeRepayment +
          debtService.dspInterest + debtService.innovationInterest + debtService.principal;
      }

      years.push({
        yearIndex,
        calendarYear,
        label: yearIndex === 0 ? 'Y0 (2026)' : `Y${yearIndex} (${calendarYear})`,

        // STAFF EXPENSES
        staff: {
          corporate: costs.staffCorporate || 0,
          flagship: costs.staffFlagship || 0,
          franchiseSupport: costs.staffFranchiseSupport || 0,
          adoptionSupport: costs.staffAdoptionSupport || 0,
          subtotal: (costs.staffCorporate || 0) + (costs.staffFlagship || 0) +
                   (costs.staffFranchiseSupport || 0) + (costs.staffAdoptionSupport || 0),
        },

        // OPERATIONAL EXPENSES
        operational: {
          technology: costs.technologyOpex || 0,
          marketing: costs.marketing || 0,
          facilities: costs.facilities || 0,
          subtotal: (costs.technologyOpex || 0) + (costs.marketing || 0) + (costs.facilities || 0),
        },

        // EDUCATIONAL EXPENSES
        educational: {
          teacherTraining: costs.teacherTraining || 0,
          qualityAssurance: costs.qualityAssurance || 0,
          regulatoryCompliance: costs.regulatoryCompliance || 0,
          dataManagement: costs.dataManagement || 0,
          parentEngagement: costs.parentEngagement || 0,
          contentDevelopment: costs.contentDevelopment || 0,
          subtotal: (costs.teacherTraining || 0) + (costs.qualityAssurance || 0) +
                   (costs.regulatoryCompliance || 0) + (costs.dataManagement || 0) +
                   (costs.parentEngagement || 0) + (costs.contentDevelopment || 0),
        },

        // BUSINESS EXPENSES
        business: {
          badDebt: costs.badDebt || 0,
          paymentProcessing: costs.paymentProcessing || 0,
          platformRD: costs.platformRD || 0,
          subtotal: (costs.badDebt || 0) + (costs.paymentProcessing || 0) + (costs.platformRD || 0),
        },

        // OTHER EXPENSES
        other: {
          legal: costs.legal || 0,
          insurance: costs.insurance || 0,
          travel: costs.travel || 0,
          workingCapital: costs.workingCapital || 0,
          contingency: costs.contingency || 0,
          subtotal: (costs.legal || 0) + (costs.insurance || 0) + (costs.travel || 0) +
                   (costs.workingCapital || 0) + (costs.contingency || 0),
        },

        // CAPEX
        capex: {
          amount: yearData.capex || 0,
          architectPayment: costs.architectPayment || 0,
          subtotal: (yearData.capex || 0) + (costs.architectPayment || 0),
        },

        // DEBT SERVICE
        debtService,

        // TOTALS
        totalOperatingCosts: costs.total || 0,
        totalCashOut: (costs.total || 0) + (yearData.capex || 0) + debtService.totalDebtService,

        // Revenue for reference
        revenue: yearData.revenue?.total || 0,
        ebitda: yearData.ebitda || 0,
        students: yearData.students?.total || 0,
      });
    }

    return years;
  }, [financialData, parameters]);

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
      <td className="sticky left-0 bg-inherit px-4 py-3 font-semibold text-gray-900 flex items-center space-x-2">
        {expandedSections[section] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Icon className={`w-5 h-5 text-${color}-600`} />
        <span>{title}</span>
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

  const ExpenseRow = ({ label, field, section, formula }) => {
    if (!expandedSections[section]) return null;

    return (
      <tr className="hover:bg-gray-50 border-b border-gray-100">
        <td className="sticky left-0 bg-white px-6 py-2 text-sm text-gray-700">
          <div>{label}</div>
          {formula && <div className="text-xs text-gray-400 italic">{formula}</div>}
        </td>
        {expenseData.map((year) => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], year);
          return (
            <td key={year.yearIndex} className="px-3 py-2 text-right text-sm text-gray-600">
              {formatMillions(value || 0)}
            </td>
          );
        })}
        <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 bg-gray-50">
          {formatMillions(field.split('.').reduce((obj, key) => obj?.[key], totals) || 0)}
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
              Complete breakdown of every expense category from the financial model
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Scenario: <span className="font-medium capitalize">{currentScenario}</span> |
              CAPEX: <span className="font-medium">{CAPEX_SCENARIOS[parameters?.capexScenario]?.name || 'Private Historic'}</span>
            </p>
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
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">Staff</div>
            <div className="text-lg font-bold text-blue-800">{formatMillions(totals?.staff?.subtotal)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium">Operational</div>
            <div className="text-lg font-bold text-green-800">{formatMillions(totals?.operational?.subtotal)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-purple-600 font-medium">Educational</div>
            <div className="text-lg font-bold text-purple-800">{formatMillions(totals?.educational?.subtotal)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-orange-600 font-medium">Business</div>
            <div className="text-lg font-bold text-orange-800">{formatMillions(totals?.business?.subtotal)}</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="text-xs text-gray-600 font-medium">Other</div>
            <div className="text-lg font-bold text-gray-800">{formatMillions(totals?.other?.subtotal)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-red-600 font-medium">CAPEX</div>
            <div className="text-lg font-bold text-red-800">{formatMillions(totals?.capex?.subtotal)}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-xs text-yellow-700 font-medium">Debt Service</div>
            <div className="text-lg font-bold text-yellow-800">{formatMillions(totals?.debtService?.totalDebtService)}</div>
          </div>
        </div>
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
              <ExpenseRow
                label="Corporate Staff"
                field="staff.corporate"
                section="staff"
                formula="Max(R$3M, students × R$80) × inflation"
              />
              <ExpenseRow
                label="Flagship Staff (Teachers + Admin)"
                field="staff.flagship"
                section="staff"
                formula="Max(R$5M, flagshipStudents × R$4,400) × inflation"
              />
              <ExpenseRow
                label="Franchise Support Staff"
                field="staff.franchiseSupport"
                section="staff"
                formula="franchiseCount × R$300K × inflation"
              />
              <ExpenseRow
                label="Adoption Support Staff"
                field="staff.adoptionSupport"
                section="staff"
                formula="(adoptionSchools ÷ 20) × R$10K/mo × 12 × inflation"
              />

              {/* OPERATIONAL EXPENSES */}
              <SectionHeader
                icon={Settings}
                title="Operational Expenses"
                section="operational"
                color="green"
                subtotal={totals?.operational?.subtotal}
              />
              <ExpenseRow
                label="Technology (Platform & Infrastructure)"
                field="operational.technology"
                section="operational"
                formula="Revenue × 4%"
              />
              <ExpenseRow
                label="Marketing & Sales"
                field="operational.marketing"
                section="operational"
                formula="Revenue × 5%"
              />
              <ExpenseRow
                label="Facilities (Rent, Utilities, Maintenance)"
                field="operational.facilities"
                section="operational"
                formula="R$1.5M × (1.05)^year"
              />

              {/* EDUCATIONAL EXPENSES */}
              <SectionHeader
                icon={BookOpen}
                title="Educational Expenses"
                section="educational"
                color="purple"
                subtotal={totals?.educational?.subtotal}
              />
              <ExpenseRow
                label="Teacher Training"
                field="educational.teacherTraining"
                section="educational"
                formula="Max(R$200K, (flagship+franchise) × R$250) × inflation"
              />
              <ExpenseRow
                label="Quality Assurance"
                field="educational.qualityAssurance"
                section="educational"
                formula="Max(R$45K, Revenue × 0.15%)"
              />
              <ExpenseRow
                label="Regulatory Compliance"
                field="educational.regulatoryCompliance"
                section="educational"
                formula="Max(R$60K, Revenue × 0.075%)"
              />
              <ExpenseRow
                label="Data Management"
                field="educational.dataManagement"
                section="educational"
                formula="Max(R$200K, students × R$40)"
              />
              <ExpenseRow
                label="Parent Engagement"
                field="educational.parentEngagement"
                section="educational"
                formula="Max(R$150K, students × R$60)"
              />
              <ExpenseRow
                label="Content Development"
                field="educational.contentDevelopment"
                section="educational"
                formula="Revenue × 4%"
              />

              {/* BUSINESS EXPENSES */}
              <SectionHeader
                icon={Briefcase}
                title="Business Expenses"
                section="business"
                color="orange"
                subtotal={totals?.business?.subtotal}
              />
              <ExpenseRow
                label="Bad Debt Provision"
                field="business.badDebt"
                section="business"
                formula="Revenue × 2%"
              />
              <ExpenseRow
                label="Payment Processing Fees"
                field="business.paymentProcessing"
                section="business"
                formula="Revenue × 2.5%"
              />
              <ExpenseRow
                label="Platform R&D"
                field="business.platformRD"
                section="business"
                formula="Revenue × 6%"
              />

              {/* OTHER EXPENSES */}
              <SectionHeader
                icon={DollarSign}
                title="Other Expenses"
                section="other"
                color="gray"
                subtotal={totals?.other?.subtotal}
              />
              <ExpenseRow
                label="Legal & Compliance"
                field="other.legal"
                section="other"
                formula="Max(R$500K, Revenue × 0.3%)"
              />
              <ExpenseRow
                label="Insurance"
                field="other.insurance"
                section="other"
                formula="R$100K × inflation"
              />
              <ExpenseRow
                label="Travel & Logistics"
                field="other.travel"
                section="other"
                formula="Max(R$300K, (franchises + adoptionStudents÷5000) × R$50K)"
              />
              <ExpenseRow
                label="Working Capital Reserve"
                field="other.workingCapital"
                section="other"
                formula="Revenue × 1%"
              />
              <ExpenseRow
                label="Contingency"
                field="other.contingency"
                section="other"
                formula="Revenue × 0.5%"
              />

              {/* CAPEX */}
              <SectionHeader
                icon={Building}
                title="Capital Expenditures (CAPEX)"
                section="capex"
                color="red"
                subtotal={totals?.capex?.subtotal}
              />
              <ExpenseRow
                label="CAPEX (Building, Equipment, Tech)"
                field="capex.amount"
                section="capex"
                formula="Y0: R$20M, Y1: R$5M, then maintenance"
              />
              <ExpenseRow
                label="Architect Project Payments"
                field="capex.architectPayment"
                section="capex"
                formula="R$100K upfront + R$45.8K/mo × 24 months"
              />

              {/* DEBT SERVICE */}
              <SectionHeader
                icon={TrendingDown}
                title="Debt Service"
                section="debtService"
                color="yellow"
                subtotal={totals?.debtService?.totalDebtService}
              />
              <ExpenseRow
                label="Bridge Loan Interest"
                field="debtService.bridgeInterest"
                section="debtService"
                formula="R$10M × 2%/mo × 9 months (Jan-Oct 2026)"
              />
              <ExpenseRow
                label="Bridge Loan Repayment"
                field="debtService.bridgeRepayment"
                section="debtService"
                formula="R$10M principal in October 2026"
              />
              <ExpenseRow
                label="Desenvolve SP Interest"
                field="debtService.dspInterest"
                section="debtService"
                formula="R$30M × 12%/year (36-mo grace, then declining)"
              />
              <ExpenseRow
                label="Innovation Loan Interest"
                field="debtService.innovationInterest"
                section="debtService"
                formula="R$15M × 12%/year (36-mo grace, then declining)"
              />
              <ExpenseRow
                label="Principal Payments"
                field="debtService.principal"
                section="debtService"
                formula="R$45M ÷ 5 = R$9M/year starting 2030"
              />

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

      {/* Formula Reference */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Formula Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Staff Costs</h4>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-mono text-xs">Corporate:</span> Max(3M, students×80) × 1.05^y</li>
              <li><span className="font-mono text-xs">Flagship:</span> Max(5M, flagship×4400) × 1.05^y</li>
              <li><span className="font-mono text-xs">Franchise:</span> count × 300K × 1.05^y</li>
              <li><span className="font-mono text-xs">Adoption:</span> (schools÷20) × 10K × 12 × 1.05^y</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Revenue-Based Costs</h4>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-mono text-xs">Technology:</span> 4% of revenue</li>
              <li><span className="font-mono text-xs">Marketing:</span> 5% of revenue</li>
              <li><span className="font-mono text-xs">Content:</span> 4% of revenue</li>
              <li><span className="font-mono text-xs">Platform R&D:</span> 6% of revenue</li>
              <li><span className="font-mono text-xs">Bad Debt:</span> 2% of revenue</li>
              <li><span className="font-mono text-xs">Processing:</span> 2.5% of revenue</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Debt Terms</h4>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-mono text-xs">Bridge:</span> R$10M @ 2%/mo, repaid Oct 2026</li>
              <li><span className="font-mono text-xs">DSP:</span> R$30M @ 12%/yr, 36-mo grace</li>
              <li><span className="font-mono text-xs">Innovation:</span> R$15M @ 12%/yr, 36-mo grace</li>
              <li><span className="font-mono text-xs">Principal:</span> R$9M/year for 5 years (2030-2034)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cost as % of Revenue */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost as % of Revenue by Year</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Category</th>
                {expenseData.filter(y => y.yearIndex > 0).map((year) => (
                  <th key={year.yearIndex} className="px-3 py-2 text-right">{year.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Staff', field: 'staff.subtotal', color: 'blue' },
                { label: 'Operational', field: 'operational.subtotal', color: 'green' },
                { label: 'Educational', field: 'educational.subtotal', color: 'purple' },
                { label: 'Business', field: 'business.subtotal', color: 'orange' },
                { label: 'Other', field: 'other.subtotal', color: 'gray' },
                { label: 'Total OpEx', field: 'totalOperatingCosts', color: 'red' },
              ].map(({ label, field, color }) => (
                <tr key={label} className="border-b">
                  <td className={`px-4 py-2 font-medium text-${color}-700`}>{label}</td>
                  {expenseData.filter(y => y.yearIndex > 0).map((year) => {
                    const value = field.split('.').reduce((obj, key) => obj?.[key], year);
                    const pct = year.revenue > 0 ? ((value || 0) / year.revenue * 100).toFixed(1) : '0.0';
                    return (
                      <td key={year.yearIndex} className="px-3 py-2 text-right">
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllExpenses;
