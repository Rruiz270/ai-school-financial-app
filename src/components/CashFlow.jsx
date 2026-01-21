import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Wallet, Users, Building, GraduationCap, Info, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CashFlow = ({ financialData, parameters, currentScenario, publicModelData, currentPublicScenario }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showEmployeeBreakdown, setShowEmployeeBreakdown] = useState(false);
  const [showExpenseTooltip, setShowExpenseTooltip] = useState(null);
  const [employeeDetailModal, setEmployeeDetailModal] = useState(null);

  // Investment Structure for Private Historic Building (2026-2027)
  // CAPEX = R$25M total, Bridge R$10M (repaid Aug 2026), DSP R$30M, Innovation R$15M
  // Prefeitura subsidy = 25% of R$25M = R$6.25M
  // Phase 1 (2026): R$25M total
  //   - Semester 1 (Jan-Jul): R$10M from Bridge Investment
  //   - Semester 2 (Aug-Dec): R$15M - Bridge repaid, DSP+Innovation arrive
  // Phase 2 (2027): R$5M CAPEX while school operates

  const INVESTMENT_PHASES = {
    phase1: {
      semester1: {
        total: 10000000, // R$10M
        bridgeInvestment: 10000000, // R$10M from bridge
        allocation: {
          architectUpfront: 100000,
          technologyPlatform: 5000000,
          peoplePreLaunch: 3400000,
          contentDevelopment: 500000,
        }
      },
      semester2: {
        total: 15000000, // R$15M expenses
        desenvolveSP: 20000000, // R$20M from DSP
        innovationLoan: 15000000, // R$15M Innovation loan
        prefeituraSubsidy: 5000000, // R$5M (part of R$6.25M total)
        bridgeRepayment: {
          amount: 10000000, // R$10M bridge repaid
          interestPaid: 1800000, // ~2% × 9 months (Jan-Oct)
          month: 10, // October 2026
        },
        allocation: {
          capexConstruction: 10000000,
          peopleHiring: 3000000,
          technology: 2000000,
        }
      }
    },
    phase2: {
      total: 5000000, // R$5M CAPEX
      desenvolveSP: 10000000, // Remaining R$10M from DSP (total R$30M)
      prefeituraSubsidy: 1250000, // R$1.25M remaining
    },
    architectProject: {
      total: 1200000,
      upfront: 100000,
      monthlyPayment: 45833,
      paymentMonths: 24,
    }
  };

  // Public Adoption Projections by year (2028-2037)
  // NO PUBLIC in 2027 (Year 1) - starts in 2028 (Year 2)
  // Realistic: 0 (Y1), 10K (Y2), 50K (Y3), grow to 1.5M by 2037
  const PUBLIC_ADOPTION_STUDENTS = {
    realistic: { 1: 0, 2: 10000, 3: 50000, 4: 100000, 5: 180000, 6: 300000, 7: 450000, 8: 650000, 9: 900000, 10: 1200000 },
    pessimistic: { 1: 0, 2: 8000, 3: 40000, 4: 80000, 5: 144000, 6: 240000, 7: 360000, 8: 520000, 9: 720000, 10: 960000 },
    optimistic: { 1: 0, 2: 12000, 3: 60000, 4: 120000, 5: 216000, 6: 360000, 7: 540000, 8: 780000, 9: 1080000, 10: 1440000 },
  };

  // Public adoption fee per student per MONTH by scenario
  const PUBLIC_ADOPTION_FEE_MONTHLY = {
    optimistic: 150,   // R$150/student/month
    realistic: 120,    // R$120/student/month
    pessimistic: 90,   // R$90/student/month
  };

  // Total funding sources
  const TOTAL_BRIDGE_INVESTMENT = 10000000; // R$10M bridge (repaid Aug 2026)
  const TOTAL_DESENVOLVE_SP = 30000000; // R$30M from Desenvolve SP
  const TOTAL_INNOVATION_LOAN = 15000000; // R$15M Innovation loan
  const TOTAL_PREFEITURA_SUBSIDY = 6250000; // R$6.25M (25% of R$25M CAPEX)
  const TOTAL_CAPEX = 25000000; // R$25M total CAPEX budget
  const TOTAL_DEBT = 45000000; // R$30M DSP + R$15M Innovation

  const INITIAL_INVESTMENT = TOTAL_BRIDGE_INVESTMENT; // Bridge equity investment
  const PRE_LAUNCH_TECH_INVESTMENT = 5000000; // R$5M tech investment (part of phase 1 semester 1)
  
  // Expense category definitions matching model
  const expenseCategories = {
    technology: {
      title: "Technology Expenses",
      percentage: "4% of total revenue",
      description: "Cloud infrastructure, software licenses, API costs, system maintenance"
    },
    marketing: {
      title: "Marketing & Growth",
      percentage: "5% of total revenue",
      description: "Customer acquisition, brand building, digital marketing, advertising, events"
    },
    corporateStaff: {
      title: "Corporate Staff",
      formula: "Max(R$3M OR R$80/student) + 5% inflation/year",
      description: "Executives, tech team, sales, operations staff"
    },
    flagshipStaff: {
      title: "Flagship Staff",
      formula: "Max(R$2.5M OR R$2,200/student) + 5% inflation/year",
      description: "Teachers, support staff, campus operations"
    },
    franchiseSupport: {
      title: "Franchise Support",
      formula: "R$300K per franchise",
      description: "Franchise operations and support team"
    },
    franchiseTeam: {
      title: "Franchising Team",
      formula: "R$15K per franchise per month",
      description: "Dedicated franchise development, support, and quality assurance staff"
    },
    adoptionSupport: {
      title: "Adoption Support",
      formula: "1 person (R$10K/mo) per 20 schools",
      description: "Support for adoption licensing program (1 staff per 20 schools)"
    },
    facilities: {
      title: "Facilities & Infrastructure",
      formula: "R$1.5M base + 5% inflation/year",
      description: "Building costs, utilities, maintenance"
    },
    contentDevelopment: {
      title: "Content Development",
      percentage: "4% of revenue",
      description: "Curriculum and content development"
    },
    teacherTraining: {
      title: "Teacher Training",
      formula: "Max(R$200K OR R$250/student)",
      description: "Professional development and AI system training"
    },
    qualityAssurance: {
      title: "Quality & Compliance",
      formula: "Max(R$300K OR 1% revenue)",
      description: "Quality assurance, regulatory compliance, data privacy"
    },
    insurance: {
      title: "Insurance",
      percentage: "0.5% of revenue",
      description: "Business insurance, liability coverage (market rate)"
    },
    travel: {
      title: "Travel & Business",
      formula: "Max(R$300K OR R$50K x locations)",
      description: "Business travel, client meetings, training"
    },
    workingCapital: {
      title: "Working Capital",
      percentage: "1% of revenue",
      description: "Cash flow management and operational buffer"
    },
    contingency: {
      title: "Contingency",
      percentage: "0.5% of revenue",
      description: "Unexpected expenses and risk mitigation"
    },
    platformRD: {
      title: "Platform R&D",
      percentage: "6% of revenue",
      description: "Platform improvements and new feature development"
    },
    corporateTax: {
      title: "Corporate Tax",
      percentage: "34% (IRPJ + CSLL)",
      description: "Brazilian corporate tax on profit"
    }
  };
  
  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absValue);
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatCompactCurrency = (value) => {
    const absValue = Math.abs(value);
    const millions = absValue / 1000000;
    const formatted = millions >= 1 
      ? `R$${millions.toFixed(1)}M` 
      : `R$${(absValue / 1000).toFixed(0)}K`;
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  // Calculate cash flow data
  const cashFlowData = useMemo(() => {
    const { projection } = financialData;
    const yearlyData = [];

    // Phase 1 - Year 0 (2026) Pre-Launch
    // Semester 1: R$10M (Bridge) -> Architecture, Tech, People, Content
    // Semester 2: R$15M expenses, Bridge repaid, DSP+Innovation arrive
    const phase1Semester1Expenses = INVESTMENT_PHASES.phase1.semester1.total; // R$10M
    const phase1Semester2Expenses = INVESTMENT_PHASES.phase1.semester2.total; // R$15M
    const phase1TotalExpenses = phase1Semester1Expenses + phase1Semester2Expenses; // R$25M

    // Funding for Year 0
    const year0BridgeInvestment = INVESTMENT_PHASES.phase1.semester1.bridgeInvestment; // R$10M
    const year0DesenvolveSP = INVESTMENT_PHASES.phase1.semester2.desenvolveSP; // R$20M
    const year0InnovationLoan = INVESTMENT_PHASES.phase1.semester2.innovationLoan; // R$15M
    const year0PrefeituraSubsidy = INVESTMENT_PHASES.phase1.semester2.prefeituraSubsidy; // R$5M
    const year0TotalFunding = year0BridgeInvestment + year0DesenvolveSP + year0InnovationLoan + year0PrefeituraSubsidy; // R$50M

    // Bridge repayment in Oct 2026
    const bridgeRepayment = INVESTMENT_PHASES.phase1.semester2.bridgeRepayment.amount; // R$10M
    const bridgeInterest = INVESTMENT_PHASES.phase1.semester2.bridgeRepayment.interestPaid; // R$1.8M

    // Year 0 cash flow
    const year0NetCashFlow = year0TotalFunding - phase1TotalExpenses - bridgeRepayment - bridgeInterest;
    const year0ClosingCash = year0NetCashFlow;

    // 30 teachers hired in S2 2026 for flagship training
    const teacherHiringCostS2 = 30 * 8000 * 5; // 30 teachers x R$8K/month x 5 months = R$1.2M

    yearlyData.push({
      year: 0,
      yearLabel: 'Phase 1 (2026)',
      openingCash: 0,
      investments: year0TotalFunding,
      investmentDetails: {
        bridgeInvestment: year0BridgeInvestment,
        desenvolveSP: year0DesenvolveSP,
        innovationLoan: year0InnovationLoan,
        prefeituraSubsidy: year0PrefeituraSubsidy,
        bridgeRepayment: -bridgeRepayment,
        bridgeInterest: -bridgeInterest,
      },
      expenses: {
        semester1: {
          total: phase1Semester1Expenses,
          architectUpfront: INVESTMENT_PHASES.architectProject.upfront,
          technology: INVESTMENT_PHASES.phase1.semester1.allocation.technologyPlatform,
          people: INVESTMENT_PHASES.phase1.semester1.allocation.peoplePreLaunch,
          content: INVESTMENT_PHASES.phase1.semester1.allocation.contentDevelopment,
          architectMonthly: INVESTMENT_PHASES.architectProject.monthlyPayment * 5,
        },
        semester2: {
          total: phase1Semester2Expenses + teacherHiringCostS2,
          capex: INVESTMENT_PHASES.phase1.semester2.allocation.capexConstruction,
          people: INVESTMENT_PHASES.phase1.semester2.allocation.peopleHiring,
          teacherHiring: teacherHiringCostS2,
          technology: INVESTMENT_PHASES.phase1.semester2.allocation.technology,
          architectMonthly: INVESTMENT_PHASES.architectProject.monthlyPayment * 7,
        }
      },
      headcount: {
        teachers: 30,
        corporate: 12,
        support: 4
      },
      revenue: 0,
      operatingExpenses: -(phase1TotalExpenses + teacherHiringCostS2 - INVESTMENT_PHASES.phase1.semester2.allocation.capexConstruction),
      capex: -INVESTMENT_PHASES.phase1.semester2.allocation.capexConstruction,
      debtService: -(bridgeRepayment + bridgeInterest),
      taxes: 0,
      netCashFlow: year0NetCashFlow - teacherHiringCostS2,
      closingCash: year0ClosingCash - teacherHiringCostS2,
      burnRate: (phase1TotalExpenses + teacherHiringCostS2) / 12,
      runwayMonths: 12,
      phase: 'Phase 1 - Pre-Launch'
    });

    let cumulativeCash = year0ClosingCash - teacherHiringCostS2;

    // Years 1-10
    for (let year = 1; year <= 10; year++) {
      const yearProjection = projection[year];
      // Add government revenue if applicable
      const privateRevenue = yearProjection.revenue.total;

      // Public sector revenue - use our projected public adoption students
      // Year 1 = 0 students, Year 2 = first public year (2028)
      const publicAdoptionScenario = currentScenario || 'realistic';
      const publicStudents = PUBLIC_ADOPTION_STUDENTS[publicAdoptionScenario]?.[year] || 0;
      const publicAdoptionFeeMonthly = PUBLIC_ADOPTION_FEE_MONTHLY[publicAdoptionScenario] || 120; // R$150/120/90 per month
      const publicRevenue = publicStudents * publicAdoptionFeeMonthly * 12; // Annual revenue

      const revenue = privateRevenue + publicRevenue;

      // Add public sector costs (support costs for public students)
      const publicCosts = publicStudents * 50; // R$50/student support cost

      // Add franchising team costs
      const franchisingTeamCosts = (yearProjection.franchiseCount || 0) * 15000 * 12; // R$15k per franchise per month
      const operatingExpenses = yearProjection.costs.total + publicCosts + franchisingTeamCosts;

      // CAPEX and funding for Year 1 (Phase 2 - School Operating)
      let capex = yearProjection.capex || 0;
      let yearInvestments = 0;
      let investmentDetails = null;
      let bridgeRepayment = 0;

      if (year === 1) {
        // Phase 2: R$5M CAPEX while school operates
        // Funded by remaining Desenvolve SP (R$10M) + Prefeitura subsidy (R$1.25M)
        yearInvestments = INVESTMENT_PHASES.phase2.desenvolveSP; // R$10M from Desenvolve SP
        const phase2Subsidy = INVESTMENT_PHASES.phase2.prefeituraSubsidy; // R$1.25M

        // Bridge already repaid in Aug 2026
        bridgeRepayment = 0;

        investmentDetails = {
          desenvolveSP: INVESTMENT_PHASES.phase2.desenvolveSP,
          prefeituraSubsidy: phase2Subsidy,
        };
        // Architect payments continue (12 months * 45.8k)
        const architectPayments = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
        // Total Phase 2 CAPEX + architect
        capex = INVESTMENT_PHASES.phase2.total + architectPayments;
      } else if (year === 2) {
        // Final year of architect payments
        const architectPayments = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
        capex = architectPayments + (yearProjection.capex || 0);
      }

      const taxes = yearProjection.taxes || 0;

      const operatingCashFlow = revenue - operatingExpenses;
      // For Year 1, we receive Desenvolve SP funding but also repay bridge
      const fundingReceived = year === 1 ? yearInvestments : 0;
      const netCashFlow = operatingCashFlow - capex - taxes + fundingReceived - bridgeRepayment;
      const closingCash = cumulativeCash + netCashFlow;

      const monthlyBurn = netCashFlow < 0 ? Math.abs(netCashFlow) / 12 : 0;
      const runwayMonths = closingCash > 0 && monthlyBurn > 0
        ? Math.floor(closingCash / monthlyBurn)
        : closingCash > 0 ? 999 : 0;

      yearlyData.push({
        year,
        yearLabel: year === 1 ? 'Phase 2 (2027)' : `Year ${year}`,
        openingCash: cumulativeCash,
        revenue,
        publicRevenue,
        publicStudents,
        investments: fundingReceived > 0 ? fundingReceived : undefined,
        investmentDetails,
        bridgeRepayment: bridgeRepayment > 0 ? -bridgeRepayment : undefined,
        operatingExpenses: -operatingExpenses,
        capex: -capex,
        taxes: -taxes,
        operatingCashFlow,
        netCashFlow,
        closingCash,
        burnRate: monthlyBurn,
        runwayMonths,
        phase: year === 1 ? 'Phase 2 - School Operating' : null,
        architectPayment: year <= 2 ? INVESTMENT_PHASES.architectProject.monthlyPayment * 12 : 0,
      });

      cumulativeCash = closingCash;
    }
    
    return yearlyData;
  }, [financialData]);

  // Calculate detailed monthly cash flow
  const getMonthlyDetailedData = (year) => {
    if (!showMonthly || selectedYear === null) return [];

    const yearData = cashFlowData[year];
    const monthlyData = [];
    const yearProjection = financialData.projection[year];
    // For Year 0, start with 0 and add investment in month 1
    let runningCash = year === 0 ? 0 : yearData.openingCash;

    // For Year 0 (Phase 1 - 2026), it's pre-launch investments
    if (year === 0) {
      for (let month = 1; month <= 12; month++) {
        const isSemester1 = month <= 7; // Jan-Jul
        const isSemester2 = month > 7; // Aug-Dec

        // Funding inflows based on semester
        let bridgeFunding = 0;
        let desenvolveSPFunding = 0;
        let prefeituaSubsidy = 0;

        if (month === 1) {
          // Semester 1 bridge funding arrives
          bridgeFunding = INVESTMENT_PHASES.phase1.semester1.bridgeInvestment; // R$10M
        }
        if (month === 8) {
          // Semester 2 funding arrives
          desenvolveSPFunding = INVESTMENT_PHASES.phase1.semester2.desenvolveSP; // R$10M
          prefeituaSubsidy = INVESTMENT_PHASES.phase1.semester2.prefeituraSubsidy; // R$2.5M
          bridgeFunding = INVESTMENT_PHASES.phase1.semester2.bridgeInvestment; // R$2.5M
        }

        // Monthly expense allocations
        const techMonthly = isSemester1 ?
          INVESTMENT_PHASES.phase1.semester1.allocation.technologyPlatform / 7 : // R$5M / 7 months
          INVESTMENT_PHASES.phase1.semester2.allocation.technology / 5; // R$2M / 5 months

        const peopleMonthly = isSemester1 ?
          INVESTMENT_PHASES.phase1.semester1.allocation.peoplePreLaunch / 7 : // R$3.4M / 7 months
          INVESTMENT_PHASES.phase1.semester2.allocation.peopleHiring / 5; // R$3M / 5 months (corporate hiring)

        // 30 teachers hired and trained in semester 2 for flagship launch
        // Average teacher salary ~R$8K/month, hiring 30 teachers over 5 months
        const teacherHiringMonthly = isSemester2 ? 30 * 8000 : 0; // R$240K/month for 30 teachers

        const curriculumMonthly = isSemester1 && month >= 2 ?
          INVESTMENT_PHASES.phase1.semester1.allocation.curriculumDevelopment / 6 : 0; // R$1.5M / 6 months (Feb-Jul)

        const architectPayment = month === 1 ?
          INVESTMENT_PHASES.architectProject.upfront : // R$100k upfront
          INVESTMENT_PHASES.architectProject.monthlyPayment; // R$45.8k/month

        // CAPEX only in semester 2
        const capexMonthly = isSemester2 ?
          INVESTMENT_PHASES.phase1.semester2.allocation.capexConstruction / 5 : 0; // R$10M / 5 months

        const details = {
          month,
          monthLabel: isSemester1 ? `Month ${month} (S1)` : `Month ${month} (S2)`,
          semester: isSemester1 ? 'Semester 1' : 'Semester 2',
          inflows: {
            bridgeInvestment: bridgeFunding,
            desenvolveSP: desenvolveSPFunding,
            prefeituraSubsidy: prefeituaSubsidy,
            total: bridgeFunding + desenvolveSPFunding + prefeituaSubsidy
          },
          outflows: {
            techDevelopment: techMonthly,
            peopleOperations: peopleMonthly,
            teacherHiring: teacherHiringMonthly, // 30 teachers for flagship - training in S2
            curriculumDevelopment: curriculumMonthly,
            architectProject: architectPayment,
            capexConstruction: capexMonthly,
            legalSetup: month === 2 ? 50000 : 0,
            marketResearch: month === 3 || month === 4 ? 75000 : 0,
            brandingDesign: month === 5 || month === 6 ? 100000 : 0,
            total: 0
          },
          headcount: {
            teachers: isSemester2 ? 30 : 0, // 30 teachers hired in S2 for flagship
            corporate: isSemester1 ? 8 : 12 // Corporate team grows in S2
          }
        };

        details.outflows.total = Object.values(details.outflows).reduce((sum, val) => {
          return typeof val === 'number' ? sum + val : sum;
        }, 0);
        const netFlow = details.inflows.total - details.outflows.total;
        runningCash += netFlow;

        details.netCashFlow = netFlow;
        details.closingCash = runningCash;
        monthlyData.push(details);
      }
      return monthlyData;
    }
    
    // For operational years - use actual cost breakdown from model
    const students = yearProjection?.students || {};
    const revenue = yearProjection?.revenue || {};
    const costs = yearProjection?.costs || {};
    
    // Apply ramp-up for early years
    const revenueRampFactors = year === 1 ? 
      [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1] :
      year === 2 ?
      [0.8, 0.85, 0.9, 0.95, 0.95, 1, 1, 1, 1, 1, 1, 1] :
      Array(12).fill(1);
    
    for (let month = 1; month <= 12; month++) {
      const rampFactor = revenueRampFactors[month - 1];
      
      const details = {
        month,
        monthLabel: `Month ${month}`,
        inflows: {
          flagshipTuition: (revenue.flagship || 0) / 12, // No ramp - students enroll in January
          franchiseFees: month === 1 || month === 7 ? (revenue.franchiseFees || 0) / 2 : 0,
          franchiseRoyalties: (revenue.franchiseRoyalty || 0) / 12,
          franchiseMarketing: (revenue.franchiseMarketing || 0) / 12,
          // Private adoption fees (monthly)
          adoptionFeesPrivate: (revenue.adoption || 0) / 12, // No ramp - fixed monthly
          // Public adoption fees (monthly) - Year 1=0, starts Year 2 (2028)
          // Use total public revenue divided by 12
          adoptionFeesPublic: publicModelData && publicModelData[year-1] ?
            publicModelData[year-1].revenue.total / 12 : 0,
          // Kit sales - ONLY flagship and franchise, ALL in January
          kitSales: month === 1 ? 
            ((students.flagship || 0) + (students.franchise || 0)) * 
            (yearProjection.pricing?.kitCost || parameters.kitCostPerStudent) : 0,
          total: 0
        },
        outflows: {
          // Staff costs from model
          corporateStaff: (costs.staffCorporate || 0) / 12,
          flagshipStaff: (costs.staffFlagship || 0) / 12,
          franchiseSupport: (costs.staffFranchiseSupport || 0) / 12,
          franchiseTeam: (yearProjection.franchiseCount || 0) * 15000, // R$15k per franchise per month for franchising team
          adoptionSupport: (costs.staffAdoptionSupport || 0) / 12,
          
          // Operating expenses
          technology: (costs.technologyOpex || 0) / 12,
          marketing: (costs.marketing || 0) / 12 * (month <= 6 && year === 1 ? 1.5 : 1),
          facilities: (costs.facilities || 0) / 12,
          
          // Educational costs
          curriculum: (costs.curriculum || 0) / 12,
          studentSupport: (costs.studentSupport || 0) / 12,
          parentEngagement: (costs.parentEngagement || 0) / 12,
          teacherTraining: (costs.teacherTraining || 0) / 12,
          
          // Compliance & Quality
          qualityAssurance: (costs.qualityAssurance || 0) / 12,
          regulatory: (costs.regulatoryCompliance || 0) / 12,
          dataManagement: (costs.dataManagement || 0) / 12,
          legal: (costs.legal || 0) / 12,
          
          // Other
          insurance: month === 1 ? (costs.insurance || 0) : 0,
          travel: (costs.travel || 0) / 12,
          workingCapital: (costs.workingCapital || 0) / 12,
          contingency: (costs.contingency || 0) / 12,
          
          // Taxes and CAPEX
          taxes: (yearProjection.taxes || 0) / 12 * rampFactor,
          capex: month === 6 && yearProjection.capex ? yearProjection.capex : 0,
          
          total: 0
        },
        
        // Headcount estimates (scenario-adjusted)
        headcount: {
          flagship: {
            // Teacher ratio varies by scenario: pessimistic 1:30, realistic 1:25, optimistic 1:20
            teachers: students.flagship ? Math.ceil(students.flagship * rampFactor / 
              (currentScenario === 'pessimistic' ? 30 : currentScenario === 'optimistic' ? 20 : 25)) : 0,
            support: students.flagship ? Math.ceil(students.flagship * rampFactor / 200) : 0
          },
          corporate: {
            executives: year === 1 ? 3 : Math.min(5, 3 + Math.floor(year / 3)),
            tech: Math.min(20, 5 + year * 1.5),
            sales: Math.min(15, 3 + yearProjection.franchiseCount * 0.2),
            operations: Math.min(10, 3 + year)
          },
          franchiseTeam: yearProjection.franchiseCount ? Math.max(2, Math.ceil(yearProjection.franchiseCount / 10)) : 0,
          adoptionTeam: students.adoption ? Math.max(3, Math.ceil(students.adoption / 25000)) : 0
        },
        
        // Student numbers
        students: {
          flagship: students.flagship || 0,
          franchise: (students.franchise || 0),
          adoption: students.adoption || 0,
          total: students.total || 0
        },
        
        // Public students (for display) - Year 1=0, starts Year 2 (2028)
        publicStudents: publicModelData && publicModelData[year-1] ?
          publicModelData[year-1].students : 0
      };
      
      // Calculate totals
      details.inflows.total = Object.values(details.inflows).reduce((sum, val) => sum + val, 0) - details.inflows.total;
      details.outflows.total = Object.values(details.outflows).reduce((sum, val) => sum + val, 0) - details.outflows.total;
      
      const netFlow = details.inflows.total - details.outflows.total;
      runningCash += netFlow;
      
      details.netCashFlow = netFlow;
      details.closingCash = runningCash;
      monthlyData.push(details);
    }
    
    return monthlyData;
  };
  
  const monthlyData = useMemo(() => {
    const detailed = getMonthlyDetailedData(selectedYear);
    if (!detailed || detailed.length === 0) return [];
    
    return detailed.map(month => ({
      month: month.month,
      monthLabel: month.monthLabel,
      revenue: month.inflows.total,
      expenses: -month.outflows.total + (month.outflows.taxes || 0) + (month.outflows.capex || 0),
      taxes: month.outflows.taxes ? -month.outflows.taxes : 0,
      capex: month.outflows.capex ? -month.outflows.capex : 0,
      netCashFlow: month.netCashFlow,
      closingCash: month.closingCash
    }));
  }, [selectedYear, showMonthly]);
  
  // Employee detail breakdown function
  const getEmployeeDetails = (year, category) => {
    const yearProjection = financialData.projection[year];
    const costs = yearProjection?.costs || {};
    
    const details = {
      year,
      category,
      categoryTitle: '',
      employees: [],
      totalCount: 0,
      totalMonthlyCost: 0,
      totalAnnualCost: 0
    };
    
    switch (category) {
      case 'corporate':
        details.categoryTitle = 'Corporate Staff';
        const executiveCount = Math.min(5, 3 + Math.floor(year / 3));
        const techCount = Math.min(20, 5 + year * 1.5);
        const salesCount = Math.min(15, 3 + (yearProjection?.franchiseCount || 0) * 0.2);
        const operationsCount = Math.min(10, 3 + year);
        
        // Apply market-realistic salary structure with 5% annual growth
        const corporateGrowthRate = Math.pow(1.05, year - 1);
        
        // Executive salary caps for Brazilian market realism
        const ceoSalary = Math.min(75000, Math.round(50000 * corporateGrowthRate)); // Cap at R$75K
        const ctoSalary = Math.min(60000, Math.round(40000 * corporateGrowthRate)); // Cap at R$60K
        const headOpsSalary = Math.min(35000, Math.round(25000 * corporateGrowthRate)); // Cap at R$35K
        const headFinanceSalary = Math.min(30000, Math.round(20000 * corporateGrowthRate)); // Cap at R$30K
        
        details.employees = [
          { role: 'CEO / Founder', count: 1, avgSalary: ceoSalary, totalSalary: ceoSalary },
          { role: 'CTO / Head of Technology', count: 1, avgSalary: ctoSalary, totalSalary: ctoSalary },
          { role: 'Head of Operations', count: 1, avgSalary: headOpsSalary, totalSalary: headOpsSalary },
          { role: 'Head of Finance', count: 1, avgSalary: headFinanceSalary, totalSalary: headFinanceSalary },
          { role: 'Software Engineers', count: Math.round(techCount - 1), avgSalary: Math.round(15000 * corporateGrowthRate), totalSalary: Math.round(techCount - 1) * Math.round(15000 * corporateGrowthRate) },
          { role: 'Product Managers', count: Math.min(2, Math.round(year / 2) + 1), avgSalary: Math.round(18000 * corporateGrowthRate), totalSalary: Math.min(2, Math.round(year / 2) + 1) * Math.round(18000 * corporateGrowthRate) },
          { role: 'Legal & Compliance', count: 1, avgSalary: Math.round(12000 * corporateGrowthRate), totalSalary: Math.round(12000 * corporateGrowthRate) },
          { role: 'HR & Admin', count: 1, avgSalary: Math.round(9000 * corporateGrowthRate), totalSalary: Math.round(9000 * corporateGrowthRate) },
          { role: 'Sales Team', count: Math.round(salesCount), avgSalary: Math.round(7000 * corporateGrowthRate), totalSalary: Math.round(salesCount) * Math.round(7000 * corporateGrowthRate) },
          { role: 'Operations Support', count: Math.max(0, Math.round(operationsCount - 1)), avgSalary: Math.round(6000 * corporateGrowthRate), totalSalary: Math.max(0, Math.round(operationsCount - 1)) * Math.round(6000 * corporateGrowthRate) }
        ];
        details.totalCount = Math.round(executiveCount + techCount + salesCount + operationsCount);
        details.totalMonthlyCost = (costs.staffCorporate || 0) / 12;
        details.totalAnnualCost = costs.staffCorporate || 0;
        break;
        
      case 'flagship':
        details.categoryTitle = 'Flagship School Staff';
        const studentCount = yearProjection?.students?.flagship || 0;
        const teacherCount = studentCount ? Math.ceil(studentCount / (currentScenario === 'pessimistic' ? 30 : currentScenario === 'optimistic' ? 20 : 25)) : 0;
        const supportCount = studentCount ? Math.ceil(studentCount / 200) : 0;
        
        // Keep premium teacher salaries with 8% growth - our competitive advantage!
        // Adjust support staff to market-realistic 5% growth
        const teacherGrowthRate = Math.pow(1.08, year - 1); // Premium teacher growth
        const supportGrowthRate = Math.pow(1.05, year - 1); // Market-realistic support growth
        
        const teacherSalary = Math.round(6500 * 1.5 * teacherGrowthRate); // Keep premium teacher pay
        const supportSalary = Math.round(4000 * supportGrowthRate); // Market-realistic support
        const managementSalary = Math.round(6500 * supportGrowthRate); // Market-realistic management
        
        details.employees = [
          { role: 'Teachers', count: teacherCount, avgSalary: teacherSalary, totalSalary: teacherCount * teacherSalary },
          { role: 'Support Staff', count: supportCount, avgSalary: supportSalary, totalSalary: supportCount * supportSalary },
          { role: 'Campus Management', count: studentCount > 0 ? Math.max(2, Math.ceil(studentCount / 1000)) : 0, avgSalary: managementSalary, totalSalary: (studentCount > 0 ? Math.max(2, Math.ceil(studentCount / 1000)) : 0) * managementSalary }
        ];
        details.totalCount = teacherCount + supportCount + (studentCount > 0 ? Math.max(2, Math.ceil(studentCount / 1000)) : 0);
        details.totalMonthlyCost = (costs.staffFlagship || 0) / 12;
        details.totalAnnualCost = costs.staffFlagship || 0;
        break;
        
      case 'franchise':
        details.categoryTitle = 'Franchise Support';
        const franchiseCount = yearProjection?.franchiseCount || 0;
        const totalBudget = (costs.staffFranchiseSupport || 0) / 12; // Monthly budget
        
        // Apply market-realistic 5% annual growth for franchise support
        const franchiseGrowthRate = Math.pow(1.05, year - 1);
        const supportManagerSalary = Math.round(9000 * franchiseGrowthRate);
        const qaSalary = Math.round(7000 * franchiseGrowthRate);
        
        // Calculate employee counts based on actual budget
        const supportManagerCount = Math.max(2, Math.round(totalBudget * 0.7 / supportManagerSalary));
        const qaCount = Math.max(1, Math.round(totalBudget * 0.3 / qaSalary));
        
        details.employees = [
          { role: 'Franchise Support Managers', count: supportManagerCount, avgSalary: supportManagerSalary, totalSalary: supportManagerCount * supportManagerSalary },
          { role: 'Quality Assurance', count: qaCount, avgSalary: qaSalary, totalSalary: qaCount * qaSalary }
        ];
        details.totalCount = supportManagerCount + qaCount;
        details.totalMonthlyCost = (costs.staffFranchiseSupport || 0) / 12;
        details.totalAnnualCost = costs.staffFranchiseSupport || 0;
        break;
        
      case 'franchising':
        details.categoryTitle = 'Franchising Development Team';
        const franchisingBudget = (yearProjection?.franchiseCount || 0) * 15000; // Monthly budget
        
        // Apply market-realistic 5% annual growth for franchising team
        const franchisingTeamGrowthRate = Math.pow(1.05, year - 1);
        const devSpecialistSalary = Math.round(12000 * franchisingTeamGrowthRate);
        const coordinatorSalary = Math.round(10000 * franchisingTeamGrowthRate);
        
        // Calculate employee counts based on actual budget
        const devSpecialistCount = Math.max(1, Math.round(franchisingBudget * 0.75 / devSpecialistSalary));
        const coordinatorCount = franchisingBudget > devSpecialistSalary ? Math.round(franchisingBudget * 0.25 / coordinatorSalary) : 0;
        
        details.employees = [
          { role: 'Franchise Development Specialists', count: devSpecialistCount, avgSalary: devSpecialistSalary, totalSalary: devSpecialistCount * devSpecialistSalary },
          { role: 'Regional Coordinators', count: coordinatorCount, avgSalary: coordinatorSalary, totalSalary: coordinatorCount * coordinatorSalary }
        ];
        details.totalCount = devSpecialistCount + coordinatorCount;
        details.totalMonthlyCost = (yearProjection?.franchiseCount || 0) * 15000;
        details.totalAnnualCost = details.totalMonthlyCost * 12;
        break;
        
      case 'adoption':
        details.categoryTitle = 'Adoption Support';
        const adoptionStudents = yearProjection?.students?.adoption || 0;
        const adoptionBudget = (costs.staffAdoptionSupport || 0) / 12; // Monthly budget
        
        // Apply market-realistic 5% annual growth for adoption support
        const adoptionGrowthRate = Math.pow(1.05, year - 1);
        const adoptionSpecialistSalary = Math.round(6000 * adoptionGrowthRate);
        const trainingCoordinatorSalary = Math.round(7000 * adoptionGrowthRate);
        
        // Calculate employee counts based on actual budget
        const adoptionSpecialistCount = Math.max(3, Math.round(adoptionBudget * 0.8 / adoptionSpecialistSalary));
        const trainingCoordinatorCount = adoptionBudget > (adoptionSpecialistCount * adoptionSpecialistSalary) ? 
          Math.round((adoptionBudget - adoptionSpecialistCount * adoptionSpecialistSalary) / trainingCoordinatorSalary) : 0;
        
        details.employees = [
          { role: 'Adoption Support Specialists', count: adoptionSpecialistCount, avgSalary: adoptionSpecialistSalary, totalSalary: adoptionSpecialistCount * adoptionSpecialistSalary },
          { role: 'Training Coordinators', count: trainingCoordinatorCount, avgSalary: trainingCoordinatorSalary, totalSalary: trainingCoordinatorCount * trainingCoordinatorSalary }
        ];
        details.totalCount = adoptionSpecialistCount + trainingCoordinatorCount;
        details.totalMonthlyCost = (costs.staffAdoptionSupport || 0) / 12;
        details.totalAnnualCost = costs.staffAdoptionSupport || 0;
        break;
    }
    
    return details;
  };
  
  // Key metrics
  const finalYearData = cashFlowData[cashFlowData.length - 1];
  const cashPositive = cashFlowData.find(d => d.netCashFlow > 0);
  const lowestCash = Math.min(...cashFlowData.map(d => d.closingCash));
  const peakFunding = INITIAL_INVESTMENT - lowestCash;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Cash Flow Analysis</h2>
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {currentScenario} Scenario
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmployeeBreakdown(!showEmployeeBreakdown)}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                showEmployeeBreakdown 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Employee Breakdown
            </button>
            <button
              onClick={() => {
                setShowMonthly(false);
                setSelectedYear(null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                !showMonthly 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yearly View
            </button>
          </div>
        </div>
        
        {/* Key Metrics - Funding Sources */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Bridge Investment</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(TOTAL_BRIDGE_INVESTMENT)}</div>
            <div className="text-xs text-gray-500 mt-1">Private equity (H1 2026)</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Desenvolve SP Financing</div>
            <div className="text-lg font-bold text-blue-900">{formatCurrency(TOTAL_DESENVOLVE_SP)}</div>
            <div className="text-xs text-blue-500 mt-1">CAPEX loan (H2 2026 + 2027)</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Prefeitura Subsidy</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(TOTAL_PREFEITURA_SUBSIDY)}</div>
            <div className="text-xs text-green-500 mt-1">25% historic building benefit</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600">Total CAPEX Budget</div>
            <div className="text-lg font-bold text-purple-900">{formatCurrency(TOTAL_CAPEX)}</div>
            <div className="text-xs text-purple-500 mt-1">Phase 1 + Phase 2</div>
          </div>
        </div>

        {/* Investment Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div className="text-sm font-semibold text-indigo-700">Phase 1 - Semester 1</div>
            <div className="text-lg font-bold text-indigo-900">{formatCurrency(INVESTMENT_PHASES.phase1.semester1.total)}</div>
            <div className="text-xs text-indigo-600 mt-1">Jan-Jul 2026 • Bridge Investment</div>
            <div className="text-xs text-indigo-500">Architecture, Tech, People, Curriculum</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div className="text-sm font-semibold text-indigo-700">Phase 1 - Semester 2</div>
            <div className="text-lg font-bold text-indigo-900">{formatCurrency(INVESTMENT_PHASES.phase1.semester2.total)}</div>
            <div className="text-xs text-indigo-600 mt-1">Aug-Dec 2026 • Multi-source</div>
            <div className="text-xs text-indigo-500">CAPEX, Hiring, Technology</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
            <div className="text-sm font-semibold text-teal-700">Phase 2 - 2027</div>
            <div className="text-lg font-bold text-teal-900">{formatCurrency(INVESTMENT_PHASES.phase2.total)}</div>
            <div className="text-xs text-teal-600 mt-1">School Operating • Desenvolve SP</div>
            <div className="text-xs text-teal-500">Equipment, Infrastructure + Architect</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-sm font-semibold text-red-700">Bridge Repayment</div>
            <div className="text-lg font-bold text-red-900">{formatCurrency(INVESTMENT_PHASES.phase2.bridgeRepayment.amount)}</div>
            <div className="text-xs text-red-600 mt-1">August 2027</div>
            <div className="text-xs text-red-500">When Desenvolve SP disburses</div>
          </div>
        </div>

        {/* Public Adoption Projections */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Public Sector Adoption Projections ({currentScenario})</h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-center">
            {Object.entries(PUBLIC_ADOPTION_STUDENTS[currentScenario] || PUBLIC_ADOPTION_STUDENTS.realistic).map(([year, students]) => (
              <div key={year} className="bg-white p-2 rounded">
                <div className="text-xs text-blue-600">Year {year}</div>
                <div className="text-sm font-bold text-blue-900">{(students / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-sm text-amber-600">Architect Project</div>
            <div className="text-lg font-bold text-amber-900">{formatCurrency(INVESTMENT_PHASES.architectProject.total)}</div>
            <div className="text-xs text-amber-500 mt-1">R$100K upfront + 24 months</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Cash Positive From</div>
            <div className="text-lg font-bold text-blue-900">
              {cashPositive ? `Year ${cashPositive.year}` : 'Not in projection'}
            </div>
            <div className="text-xs text-blue-500 mt-1">Operating cash flow positive</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Year 10 Cash Balance</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(finalYearData.closingCash)}</div>
            <div className="text-xs text-green-500 mt-1">
              {finalYearData.closingCash > INITIAL_INVESTMENT ? 'Above initial investment' : 'Building value'}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600">Net Equity Required</div>
            <div className="text-lg font-bold text-orange-900">{formatCurrency(TOTAL_BRIDGE_INVESTMENT)}</div>
            <div className="text-xs text-orange-500 mt-1">After subsidies & financing</div>
          </div>
        </div>
        
        {/* Employee Breakdown */}
        {showEmployeeBreakdown && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Monthly Employee Costs by Year
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-200">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Corporate Staff
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Flagship Staff
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Franchise Support
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Franchising Team
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Adoption Support
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Total Monthly
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                      Total Employees
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-200">
                  {cashFlowData.slice(1).map((yearData) => {
                    const yearProjection = financialData.projection[yearData.year];
                    const costs = yearProjection?.costs || {};
                    const monthlyCorporate = (costs.staffCorporate || 0) / 12;
                    const monthlyFlagship = (costs.staffFlagship || 0) / 12;
                    const monthlyFranchiseSupport = (costs.staffFranchiseSupport || 0) / 12;
                    const monthlyFranchisingTeam = (yearProjection?.franchiseCount || 0) * 15000;
                    const monthlyAdoption = (costs.staffAdoptionSupport || 0) / 12;
                    const totalMonthly = monthlyCorporate + monthlyFlagship + monthlyFranchiseSupport + monthlyFranchisingTeam + monthlyAdoption;
                    
                    // Calculate employee counts using same logic as detailed modal
                    const corporateDetails = getEmployeeDetails(yearData.year, 'corporate');
                    const flagshipDetails = getEmployeeDetails(yearData.year, 'flagship');
                    const franchiseDetails = getEmployeeDetails(yearData.year, 'franchise');
                    const franchisingDetails = getEmployeeDetails(yearData.year, 'franchising');
                    const adoptionDetails = getEmployeeDetails(yearData.year, 'adoption');
                    
                    const corporateCount = corporateDetails.totalCount;
                    const flagshipCount = flagshipDetails.totalCount;
                    const franchiseCount = franchiseDetails.totalCount;
                    const franchisingTeamCount = franchisingDetails.totalCount;
                    const adoptionCount = adoptionDetails.totalCount;
                    const totalEmployees = corporateCount + flagshipCount + franchiseCount + franchisingTeamCount + adoptionCount;
                    
                    return (
                      <tr key={yearData.year} className="hover:bg-green-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Year {yearData.year}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(monthlyCorporate)}</div>
                          <button 
                            onClick={() => setEmployeeDetailModal(getEmployeeDetails(yearData.year, 'corporate'))}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {Math.round(corporateCount)} employees
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(monthlyFlagship)}</div>
                          <button 
                            onClick={() => setEmployeeDetailModal(getEmployeeDetails(yearData.year, 'flagship'))}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {Math.round(flagshipCount)} employees
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(monthlyFranchiseSupport)}</div>
                          <button 
                            onClick={() => setEmployeeDetailModal(getEmployeeDetails(yearData.year, 'franchise'))}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {Math.round(franchiseCount)} employees
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(monthlyFranchisingTeam)}</div>
                          <button 
                            onClick={() => setEmployeeDetailModal(getEmployeeDetails(yearData.year, 'franchising'))}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {Math.round(franchisingTeamCount)} employees
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-600 font-medium">{formatCurrency(monthlyAdoption)}</div>
                          <button 
                            onClick={() => setEmployeeDetailModal(getEmployeeDetails(yearData.year, 'adoption'))}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {Math.round(adoptionCount)} employees
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-green-700 font-bold text-base">{formatCurrency(totalMonthly)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="text-gray-700 font-bold">{Math.round(totalEmployees)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-green-700">
              <strong>Note:</strong> Franchising Team costs are calculated at R$15,000 per franchise per month, 
              covering dedicated franchise development, support, and quality assurance staff.
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {showMonthly && selectedYear !== null 
            ? `Year ${selectedYear} Monthly Cash Flow` 
            : 'Yearly Cash Position'}
        </h3>
        <div className="h-80">
          {!showMonthly ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearLabel" />
                <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={INITIAL_INVESTMENT} stroke="#3b82f6" strokeDasharray="3 3" label="Initial Investment" />
                <Line 
                  type="monotone" 
                  dataKey="closingCash" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Cash Balance"
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" stackId="a" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" stackId="a" />
                <Bar dataKey="taxes" fill="#f59e0b" name="Taxes" stackId="a" />
                <Bar dataKey="capex" fill="#6366f1" name="CAPEX" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Yearly Cash Flow Table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Details</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opening
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funding
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Public Rev
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                OpEx
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CAPEX
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bridge Repay
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net CF
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closing
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cashFlowData.map((yearData) => (
              <tr key={yearData.year} className={`hover:bg-gray-50 ${yearData.phase ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div>{yearData.yearLabel}</div>
                  {yearData.publicStudents > 0 && (
                    <div className="text-xs text-blue-600">{(yearData.publicStudents/1000).toFixed(0)}K public</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(yearData.openingCash)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                  {yearData.investments > 0 ? formatCurrency(yearData.investments) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  {yearData.revenue > 0 ? formatCurrency(yearData.revenue) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-teal-600">
                  {yearData.publicRevenue > 0 ? formatCurrency(yearData.publicRevenue) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  {yearData.operatingExpenses ? formatCurrency(yearData.operatingExpenses) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-indigo-600">
                  {yearData.capex ? formatCurrency(yearData.capex) : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-700 font-medium">
                  {yearData.bridgeRepayment ? formatCurrency(yearData.bridgeRepayment) : '-'}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                  yearData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(yearData.netCashFlow)}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${
                  yearData.closingCash >= 0 ? 'text-gray-900' : 'text-red-600'
                }`}>
                  {formatCurrency(yearData.closingCash)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => {
                      setSelectedYear(yearData.year);
                      setShowMonthly(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Detail */}
      {showMonthly && selectedYear !== null && getMonthlyDetailedData(selectedYear).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Year {selectedYear} Monthly Breakdown
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmployeeBreakdown(!showEmployeeBreakdown)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                  showEmployeeBreakdown 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Employee Details
              </button>
              <button
                onClick={() => {
                  setShowMonthly(false);
                  setSelectedYear(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                ← Back to Yearly View
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {getMonthlyDetailedData(selectedYear).map((month) => (
              <div key={month.month} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{month.monthLabel}</h4>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${
                      month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Net: {formatCurrency(month.netCashFlow)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      Balance: {formatCurrency(month.closingCash)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inflows */}
                  <div>
                    <h5 className="font-semibold text-green-700 mb-3 flex items-center justify-between">
                      <span>💰 Inflows</span>
                      <span className="text-green-600">{formatCurrency(month.inflows.total)}</span>
                    </h5>
                    <div className="space-y-2">
                      {selectedYear === 0 && month.month === 1 && month.inflows.investorFunding > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Investor Funding</span>
                          <span className="text-green-600 font-medium">{formatCurrency(month.inflows.investorFunding)}</span>
                        </div>
                      )}
                      {month.inflows.flagshipTuition > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Flagship Tuition
                            <span className="text-gray-400 ml-1">({month.students?.flagship || 0} students)</span>
                          </span>
                          <span className="text-green-600">{formatCurrency(month.inflows.flagshipTuition)}</span>
                        </div>
                      )}
                      {month.inflows.franchiseFees > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Franchise Fees</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.franchiseFees)}</span>
                        </div>
                      )}
                      {(month.inflows.franchiseRoyalties > 0 || month.inflows.franchiseMarketing > 0) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Franchise Royalties & Marketing
                            <span className="text-gray-400 ml-1">({month.students?.franchise || 0} students)</span>
                          </span>
                          <span className="text-green-600">
                            {formatCurrency((month.inflows.franchiseRoyalties || 0) + (month.inflows.franchiseMarketing || 0))}
                          </span>
                        </div>
                      )}
                      {month.inflows.adoptionFeesPrivate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Adoption License Fees (Private)
                            <span className="text-gray-400 ml-1">({month.students?.adoption || 0} students)</span>
                          </span>
                          <span className="text-green-600">{formatCurrency(month.inflows.adoptionFeesPrivate)}</span>
                        </div>
                      )}
                      {month.inflows.adoptionFeesPublic > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Adoption License Fees (Public)
                            <span className="text-gray-400 ml-1">({month.publicStudents || 0} students)</span>
                          </span>
                          <span className="text-green-600">{formatCurrency(month.inflows.adoptionFeesPublic)}</span>
                        </div>
                      )}
                      {month.inflows.kitSales > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kit Sales (Flagship & Franchise)</span>
                          <span className="text-green-600">{formatCurrency(month.inflows.kitSales)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Outflows */}
                  <div>
                    <h5 className="font-semibold text-red-700 mb-3 flex items-center justify-between">
                      <span>💸 Outflows</span>
                      <span className="text-red-600">{formatCurrency(month.outflows.total)}</span>
                    </h5>
                    <div className="space-y-2">
                      {/* Staff Costs */}
                      {selectedYear > 0 && (month.outflows.corporateStaff > 0 || month.outflows.flagshipStaff > 0) && (
                        <div className="border-t border-gray-100 pt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">Staff Costs:</div>
                          {month.outflows.corporateStaff > 0 && (
                            <div className="flex justify-between text-sm ml-2 relative">
                              <span className="text-gray-600 flex items-center gap-1">
                                Corporate Team
                                <button
                                  onMouseEnter={() => setShowExpenseTooltip('corporateStaff')}
                                  onMouseLeave={() => setShowExpenseTooltip(null)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                                <span className="text-gray-400 ml-1">
                                  ({(month.headcount?.corporate?.executives || 0) + 
                                    (month.headcount?.corporate?.tech || 0) + 
                                    (month.headcount?.corporate?.sales || 0) + 
                                    (month.headcount?.corporate?.operations || 0)} employees)
                                </span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.corporateStaff)}</span>
                              {showExpenseTooltip === 'corporateStaff' && (
                                <div className="absolute left-0 top-6 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 w-64">
                                  <div className="font-semibold text-gray-900">{expenseCategories.corporateStaff.title}</div>
                                  <div className="text-sm text-blue-600 mt-1">{expenseCategories.corporateStaff.formula}</div>
                                  <div className="text-xs text-gray-600 mt-1">{expenseCategories.corporateStaff.description}</div>
                                </div>
                              )}
                            </div>
                          )}
                          {month.outflows.flagshipStaff > 0 && (
                            <div className="flex justify-between text-sm ml-2 relative">
                              <span className="text-gray-600 flex items-center gap-1">
                                Flagship Staff
                                <button
                                  onMouseEnter={() => setShowExpenseTooltip('flagshipStaff')}
                                  onMouseLeave={() => setShowExpenseTooltip(null)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                                <span className="text-gray-400 ml-1">
                                  ({month.headcount?.flagship?.teachers || 0} teachers, 
                                   {month.headcount?.flagship?.support || 0} support)
                                </span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.flagshipStaff)}</span>
                              {showExpenseTooltip === 'flagshipStaff' && (
                                <div className="absolute left-0 top-6 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 w-64">
                                  <div className="font-semibold text-gray-900">{expenseCategories.flagshipStaff.title}</div>
                                  <div className="text-sm text-blue-600 mt-1">{expenseCategories.flagshipStaff.formula}</div>
                                  <div className="text-xs text-gray-600 mt-1">{expenseCategories.flagshipStaff.description}</div>
                                </div>
                              )}
                            </div>
                          )}
                          {month.outflows.franchiseSupport > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">
                                Franchise Support
                                <span className="text-gray-400 ml-1">({month.headcount?.franchiseTeam || 0} employees)</span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.franchiseSupport)}</span>
                            </div>
                          )}
                          {month.outflows.franchiseTeam > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">
                                Franchising Team
                                <span className="text-gray-400 ml-1">(Development & QA)</span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.franchiseTeam)}</span>
                            </div>
                          )}
                          {month.outflows.adoptionSupport > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">
                                Adoption Support
                                <span className="text-gray-400 ml-1">({month.headcount?.adoptionTeam || 0} employees)</span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.adoptionSupport)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pre-launch expenses */}
                      {selectedYear === 0 && (
                        <>
                          {month.outflows.techDevelopment > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tech Development</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.techDevelopment)}</span>
                            </div>
                          )}
                          {month.outflows.founderSalaries > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Founder Salaries</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.founderSalaries)}</span>
                            </div>
                          )}
                          {month.outflows.legalSetup > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Legal Setup</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.legalSetup)}</span>
                            </div>
                          )}
                          {month.outflows.marketResearch > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Market Research</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.marketResearch)}</span>
                            </div>
                          )}
                          {month.outflows.brandingDesign > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Branding & Design</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.brandingDesign)}</span>
                            </div>
                          )}
                          {month.outflows.officeSetup > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Office Setup</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.officeSetup)}</span>
                            </div>
                          )}
                          {month.outflows.curriculumDevelopment > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Curriculum Development</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.curriculumDevelopment)}</span>
                            </div>
                          )}
                          {month.outflows.peopleOperations > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Corporate Team</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.peopleOperations)}</span>
                            </div>
                          )}
                          {month.outflows.teacherHiring > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Flagship Teachers (30)
                                <span className="text-gray-400 ml-1">training</span>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.teacherHiring)}</span>
                            </div>
                          )}
                          {month.outflows.architectProject > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Architect Project</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.architectProject)}</span>
                            </div>
                          )}
                          {month.outflows.capexConstruction > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">CAPEX Construction</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.capexConstruction)}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Operating Expenses */}
                      {selectedYear > 0 && (
                        <div className="border-t border-gray-100 pt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">Operating Expenses:</div>
                          {month.outflows.technology > 0 && (
                            <div className="flex justify-between text-sm ml-2 relative">
                              <span className="text-gray-600 flex items-center gap-1">
                                Technology OPEX (10%)
                                <button
                                  onMouseEnter={() => setShowExpenseTooltip('technology')}
                                  onMouseLeave={() => setShowExpenseTooltip(null)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.technology)}</span>
                              {showExpenseTooltip === 'technology' && (
                                <div className="absolute left-0 top-6 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 w-64">
                                  <div className="font-semibold text-gray-900">{expenseCategories.technology.title}</div>
                                  <div className="text-sm text-blue-600 mt-1">{expenseCategories.technology.percentage}</div>
                                  <div className="text-xs text-gray-600 mt-1">{expenseCategories.technology.description}</div>
                                </div>
                              )}
                            </div>
                          )}
                          {month.outflows.marketing > 0 && (
                            <div className="flex justify-between text-sm ml-2 relative">
                              <span className="text-gray-600 flex items-center gap-1">
                                Marketing & Growth (8%)
                                <button
                                  onMouseEnter={() => setShowExpenseTooltip('marketing')}
                                  onMouseLeave={() => setShowExpenseTooltip(null)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </span>
                              <span className="text-red-600">{formatCurrency(month.outflows.marketing)}</span>
                              {showExpenseTooltip === 'marketing' && (
                                <div className="absolute left-0 top-6 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 w-64">
                                  <div className="font-semibold text-gray-900">{expenseCategories.marketing.title}</div>
                                  <div className="text-sm text-blue-600 mt-1">{expenseCategories.marketing.percentage}</div>
                                  <div className="text-xs text-gray-600 mt-1">{expenseCategories.marketing.description}</div>
                                </div>
                              )}
                            </div>
                          )}
                          {month.outflows.facilities > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Facilities & Infrastructure</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.facilities)}</span>
                            </div>
                          )}
                          {month.outflows.curriculum > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Curriculum Development</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.curriculum)}</span>
                            </div>
                          )}
                          {month.outflows.teacherTraining > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Teacher Training</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.teacherTraining)}</span>
                            </div>
                          )}
                          {month.outflows.qualityAssurance > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Quality & Compliance</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.qualityAssurance)}</span>
                            </div>
                          )}
                          {month.outflows.insurance > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Insurance (0.2%)</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.insurance)}</span>
                            </div>
                          )}
                          {month.outflows.travel > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Travel & Business</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.travel)}</span>
                            </div>
                          )}
                          {month.outflows.workingCapital > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Working Capital (1%)</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.workingCapital)}</span>
                            </div>
                          )}
                          {month.outflows.contingency > 0 && (
                            <div className="flex justify-between text-sm ml-2">
                              <span className="text-gray-600">Contingency (0.5%)</span>
                              <span className="text-red-600">{formatCurrency(month.outflows.contingency)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Taxes & CAPEX */}
                      {month.outflows.taxes > 0 && (
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                          <span className="text-gray-600">Corporate Taxes</span>
                          <span className="text-orange-600">{formatCurrency(month.outflows.taxes)}</span>
                        </div>
                      )}
                      {month.outflows.capex > 0 && (
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                          <span className="text-gray-600 font-medium">CAPEX</span>
                          <span className="text-blue-600 font-medium">{formatCurrency(month.outflows.capex)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                {selectedYear > 0 && month.students && (
                  <div className="bg-blue-50 px-4 py-2 border-t border-blue-100">
                    <div className="flex justify-between text-xs text-blue-700">
                      <span>
                        <span className="font-medium">Students:</span> {month.students.flagship} flagship, 
                        {month.students.franchise} franchise, {month.students.adoption} adoption
                      </span>
                      <span>
                        <span className="font-medium">Staff:</span> ~{month.headcount.corporate.executives + 
                        month.headcount.corporate.tech + month.headcount.corporate.sales + 
                        month.headcount.corporate.operations} corporate, 
                        {month.headcount.flagship.teachers} teachers
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {employeeDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {employeeDetailModal.categoryTitle} - Year {employeeDetailModal.year}
                </h3>
                <button
                  onClick={() => setEmployeeDetailModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{employeeDetailModal.totalCount}</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(employeeDetailModal.totalMonthlyCost)}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(employeeDetailModal.totalAnnualCost)}
                    </div>
                    <div className="text-sm text-gray-600">Annual Cost</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Employee Breakdown by Role</h4>
                {employeeDetailModal.employees.map((employee, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{employee.role}</h5>
                      <span className="text-sm font-medium text-gray-600">{employee.count} employees</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Average Salary:</span>
                        <span className="ml-2 font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(employee.avgSalary)}/month
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Monthly Cost:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(employee.totalSalary)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>Note:</strong> Employee counts and salaries are calculated based on student enrollment, 
                  franchise locations, and operational requirements for Year {employeeDetailModal.year}.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;