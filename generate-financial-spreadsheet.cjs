// Generate comprehensive 10-year financial spreadsheet with monthly breakdown
// Using ExcelJS for proper styling and colors
const ExcelJS = require('exceljs');

// ============================================
// CONFIGURATION - PRIVATE REALISTIC, PUBLIC OPTIMISTIC
// ============================================

const CONFIG = {
  // CAPEX Structure
  capex: {
    year2026: 20000000,  // R$20M in 2026
    year2027: 5000000,   // R$5M in 2027
    total: 25000000      // R$25M total CAPEX
  },

  // FUNDING SOURCES (NOT REVENUE)
  funding: {
    bridge: {
      amount: 10000000,    // R$10M bridge
      disbursementMonth: 1, // January 2026
      repaymentMonth: 10,   // October 2026
      interestRate: 0.02,   // 2% per month
    },
    desenvolveSP: {
      total: 30000000,     // R$30M total
      year2026: 20000000,  // R$20M in Aug 2026
      year2027: 10000000,  // R$10M in Jan 2027
      interestRate: 0.12,  // 12% per year
      gracePeriodMonths: 36,
      repaymentYears: 5,
    },
    innovation: {
      amount: 15000000,    // R$15M innovation loan
      disbursementMonth: 8, // August 2026 with Desenvolve SP
      interestRate: 0.12,  // Same terms as Desenvolve SP
      gracePeriodMonths: 36,
      repaymentYears: 5,
    },
    prefeitura: {
      total: 6250000,      // 25% of R$25M CAPEX = R$6.25M
      year2026: 5000000,   // R$5M in Aug 2026
      year2027: 1250000,   // R$1.25M in Jan 2027
      isGrant: true,
    }
  },

  // PRIVATE SECTOR - REALISTIC SCENARIO
  private: {
    // Flagship - realistic (with 5% churn applied after Year 2)
    flagshipStudents: { 0: 0, 1: 300, 2: 750, 3: 1200, 4: 1200, 5: 1200, 6: 1200, 7: 1200, 8: 1200, 9: 1200, 10: 1200 },
    flagshipTuition: 2300, // R$2,300/month
    tuitionIncrease: 0.06, // 6% annual
    churnRate: 0.05, // 5% annual churn (K-12 standard)

    // Franchise - starts Year 3, 3 per year
    franchiseGrowthRate: 3, // 3 new franchises per year
    maxFranchises: 24, // 8 years × 3 = 24 franchises by Year 10
    studentsPerFranchise: 1200,
    franchiseFee: 180000,
    royaltyRate: 0.06,
    marketingFeeRate: 0.02, // 2% marketing fund (industry standard)

    // Private Adoption - starts Year 2 - FEE IS R$180/MONTH!
    adoptionStudents: { 0: 0, 1: 0, 2: 2500, 3: 21250, 4: 40000, 5: 58750, 6: 77500, 7: 96250, 8: 115000, 9: 133750, 10: 150000 },
    adoptionFeeMonthly: 180, // R$180/student/MONTH (R$2,160/year)

    // Kit sales for ALL students
    kitCost: 1200,
    kitPurchaseRate: 1.0, // 100% - all students get kits
  },

  // PUBLIC SECTOR - OPTIMISTIC SCENARIO (starts Year 2 = 2028)
  public: {
    students: { 0: 0, 1: 0, 2: 12000, 3: 60000, 4: 120000, 5: 216000, 6: 360000, 7: 540000, 8: 780000, 9: 1080000, 10: 1440000 },
    feePerMonth: 150, // R$150/student/month
    costRate: 0.20,   // 20% costs (sales & training team only)
  },

  // STAFF - Teachers from model
  staff: {
    teacherRatio: 25, // 1 teacher per 25 students
    teacherSalary: 8000,
    teachersHired2026: 30, // Initial 30 teachers
    corporate: {
      base: 3000000,
      perStudent: 80,
    },
    flagship: {
      base: 2500000,
      perStudent: 2200,
    },
    franchiseSupport: 300000,
    // Adoption support: 1 person (R$10K/month) per 20 schools
    adoptionSupportPerSchool: 10000, // R$10K/month
    schoolsPerSupportPerson: 20,
    avgStudentsPerSchool: 500,
  },

  // COSTS
  costs: {
    // Technology: 4% of revenue (not 10%)
    technologyRate: 0.04,

    // Marketing: 5% of revenue
    marketingRate: 0.05,

    // Facilities: R$1.5M base + 5% inflation per year
    facilitiesBase: 1500000,
    facilitiesInflation: 0.05,

    // Content development: 4% of revenue (no separate curriculum line)
    contentDev: 0.04,

    // Teacher training: base without crazy multiplier
    teacherTraining: { base: 200000, perStudent: 250 },
    qualityAssurance: { base: 300000, rate: 0.01 },
    regulatory: { base: 400000, rate: 0.005 },
    dataManagement: { base: 200000, perStudent: 40 },
    parentEngagement: { base: 150000, perStudent: 60 },
    badDebt: 0.02, // 2%
    paymentProcessing: 0.025, // 2.5%
    platformRD: 0.06, // 6%
    legal: { base: 500000, rate: 0.003 },
    insurance: 0.005, // 0.5% (market rate for education)
    travel: { base: 300000, perLocation: 50000 },
    workingCapital: 0.01,
    contingency: 0.005,

    // Staff inflation: 5% per year (sensible, not compound 10%)
    staffInflation: 0.05,
  },

  // Pre-operational (2026)
  preOperational: {
    semester1: {
      technology: 5000000,
      people: 3400000,
      curriculum: 1500000,
      architectUpfront: 100000,
      architectMonthly: 45833,
      legal: 50000,
    },
    semester2: {
      technology: 2000000,
      people: 3000000,
    },
  },

  // Tax rate (corporate tax from model)
  taxRate: 0.34, // 34% corporate tax in Brazil (IRPJ + CSLL)
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const R = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Math.round(value);
};

const getMonthLabel = (year, month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${2026 + year}`;
};

const COLORS = {
  fundingHeader: 'BDD7EE',
  fundingFill: 'DDEBF7',
  revenueHeader: 'C6EFCE',
  revenueFill: 'E2EFDA',
  expenseHeader: 'FFC7CE',
  expenseFill: 'FCE4D6',
  debtHeader: 'FFE699',
  debtFill: 'FFF2CC',
  cashFlowHeader: 'D9D9D9',
  cashFlowFill: 'F2F2F2',
  studentCount: 'E8F4FD', // Light blue for student counts
};

// ============================================
// CALCULATE FINANCIAL DATA
// ============================================

const calculateFinancialData = () => {
  const data = { yearly: [], monthly: [] };

  let cumulativeCash = 0;
  let bridgeOutstanding = 0;
  let desenvolveSPOutstanding = 0;
  let innovationOutstanding = 0;
  let capexSpentAfterBridge = 0; // Track CAPEX spending after bridge repayment

  for (let year = 0; year <= 10; year++) {
    const yearData = { year, calendarYear: 2026 + year, months: [] };

    // ===== STUDENT COUNTS =====
    const flagshipStudents = CONFIG.private.flagshipStudents[year] || 0;
    const adoptionStudentsPrivate = CONFIG.private.adoptionStudents[year] || 0;
    const publicStudents = CONFIG.public.students[year] || 0;

    // Teachers based on model - flagship students / 25
    const teacherCount = flagshipStudents > 0
      ? Math.ceil(flagshipStudents / CONFIG.staff.teacherRatio) + CONFIG.staff.teachersHired2026
      : (year === 0 ? CONFIG.staff.teachersHired2026 : CONFIG.staff.teachersHired2026);

    // Franchise
    let franchiseCount = 0, franchiseStudents = 0, newFranchises = 0;
    if (year >= 3) {
      franchiseCount = Math.min(Math.floor((year - 2) * CONFIG.private.franchiseGrowthRate), CONFIG.private.maxFranchises);
      const prevCount = year > 3 ? Math.min(Math.floor((year - 3) * CONFIG.private.franchiseGrowthRate), CONFIG.private.maxFranchises) : 0;
      newFranchises = franchiseCount - prevCount;
      franchiseStudents = franchiseCount * CONFIG.private.studentsPerFranchise * 0.7;
    }

    const totalPrivateStudents = flagshipStudents + franchiseStudents + adoptionStudentsPrivate;
    const totalStudents = totalPrivateStudents + publicStudents;

    // ===== REVENUE CALCULATIONS =====
    const tuitionRate = CONFIG.private.flagshipTuition * Math.pow(1 + CONFIG.private.tuitionIncrease, Math.max(0, year - 1));
    const adoptionFeeRate = CONFIG.private.adoptionFeeMonthly * Math.pow(1 + CONFIG.private.tuitionIncrease, Math.max(0, year - 1));

    // Private Revenue
    const annualFlagshipRevenue = flagshipStudents * tuitionRate * 12;
    const franchiseTuitionRevenue = franchiseStudents * tuitionRate * 12;
    const annualFranchiseRoyalty = franchiseTuitionRevenue * CONFIG.private.royaltyRate;
    const annualFranchiseMarketing = franchiseTuitionRevenue * CONFIG.private.marketingFeeRate;
    const annualFranchiseFees = newFranchises * CONFIG.private.franchiseFee;
    const annualAdoptionRevenue = adoptionStudentsPrivate * adoptionFeeRate * 12; // PER MONTH × 12
    const annualKitRevenue = (flagshipStudents + franchiseStudents) * CONFIG.private.kitPurchaseRate * CONFIG.private.kitCost;

    // Public Revenue
    const annualPublicRevenue = publicStudents * CONFIG.public.feePerMonth * 12;

    const totalPrivateRevenue = annualFlagshipRevenue + annualFranchiseRoyalty + annualFranchiseMarketing + annualFranchiseFees + annualAdoptionRevenue + annualKitRevenue;
    const totalRevenue = totalPrivateRevenue + annualPublicRevenue;

    // ===== COST CALCULATIONS =====
    let staffMultiplier = 1;
    if (year === 1) staffMultiplier = 1.20;
    else if (year > 1) staffMultiplier = 1.20 * Math.pow(1.10, year - 1);

    const staffCorporate = Math.max(CONFIG.staff.corporate.base, totalStudents * CONFIG.staff.corporate.perStudent) * staffMultiplier;
    const staffFlagship = flagshipStudents > 0 ? Math.max(CONFIG.staff.flagship.base, flagshipStudents * CONFIG.staff.flagship.perStudent) * staffMultiplier : 0;
    const staffFranchise = franchiseCount * CONFIG.staff.franchiseSupport * staffMultiplier;
    const staffAdoption = adoptionStudentsPrivate * CONFIG.staff.adoptionSupport * staffMultiplier;

    // Technology: R$300K/month Y1, then 10% of revenue
    const technologyCost = year === 1 ? CONFIG.costs.technologyY1Monthly * 12 : totalRevenue * CONFIG.costs.technologyRate;

    // Marketing: 8% Y1-2, 5% Y3-4, 3% Y5+
    const marketingRate = year <= 2 ? 0.08 : (year <= 4 ? 0.05 : 0.03);
    const marketingCost = totalRevenue * marketingRate;

    // Student support: R$40K/month, doubles yearly
    const studentSupportMultiplier = Math.pow(2, Math.max(0, year - 1));
    const studentSupportCost = CONFIG.costs.studentSupportBase * 12 * studentSupportMultiplier;

    // Public sector costs: 20% (sales & training team only)
    const publicDirectCosts = annualPublicRevenue * CONFIG.public.costRate;

    // Other costs
    const facilitiesCost = CONFIG.costs.facilitiesAnnual;
    const curriculumCost = Math.max(CONFIG.costs.curriculum.base, totalStudents * CONFIG.costs.curriculum.perStudent);
    const teacherTrainingCost = Math.max(CONFIG.costs.teacherTraining.base, (flagshipStudents + franchiseStudents) * CONFIG.costs.teacherTraining.perStudent) * staffMultiplier;
    const qaCost = Math.max(CONFIG.costs.qualityAssurance.base, totalRevenue * CONFIG.costs.qualityAssurance.rate);
    const regulatoryCost = Math.max(CONFIG.costs.regulatory.base, totalRevenue * CONFIG.costs.regulatory.rate);
    const dataCost = Math.max(CONFIG.costs.dataManagement.base, totalStudents * CONFIG.costs.dataManagement.perStudent);
    const parentCost = Math.max(CONFIG.costs.parentEngagement.base, totalStudents * CONFIG.costs.parentEngagement.perStudent);
    const badDebtCost = totalRevenue * CONFIG.costs.badDebt;
    const paymentCost = totalRevenue * CONFIG.costs.paymentProcessing;
    const rdCost = totalRevenue * CONFIG.costs.platformRD;
    const contentCost = totalRevenue * CONFIG.costs.contentDev;
    const legalCost = Math.max(CONFIG.costs.legal.base, totalRevenue * CONFIG.costs.legal.rate);
    const insuranceCost = totalRevenue * CONFIG.costs.insurance;
    const travelCost = Math.max(CONFIG.costs.travel.base, franchiseCount * CONFIG.costs.travel.perLocation);
    const workingCapitalCost = totalRevenue * CONFIG.costs.workingCapital;
    const contingencyCost = totalRevenue * CONFIG.costs.contingency;

    // ===== MONTHLY BREAKDOWN =====
    for (let month = 1; month <= 12; month++) {
      const monthData = {
        year, month,
        label: getMonthLabel(year, month),

        // Student counts for display
        students: {
          flagship: 0,
          adoptionPrivate: 0,
          adoptionPublic: 0,
        },

        // FUNDING
        funding: { bridge: 0, desenvolveSP: 0, innovation: 0, prefeitura: 0 },

        // REVENUE
        revenue: {
          flagship: 0, franchiseRoyalty: 0, franchiseMarketing: 0,
          franchiseFees: 0, adoptionPrivate: 0, kits: 0, adoptionPublic: 0,
        },

        // EXPENSES
        expenses: {
          corporateStaff: 0, flagshipStaff: 0, franchiseSupport: 0, adoptionSupport: 0,
          teachers: 0, technology: 0, marketing: 0, facilities: 0,
          curriculum: 0, teacherTraining: 0, studentSupport: 0,
          qa: 0, regulatory: 0, dataManagement: 0, legal: 0, insurance: 0,
          parentEngagement: 0, badDebt: 0, paymentProcessing: 0,
          platformRD: 0, contentDev: 0, travel: 0, workingCapital: 0, contingency: 0,
          publicCosts: 0, capex: 0, architect: 0,
        },

        // DEBT SERVICE
        debtService: { bridgeInterest: 0, bridgePrincipal: 0, dspInterest: 0, dspPrincipal: 0, innovationInterest: 0, innovationPrincipal: 0 },

        // TAX
        tax: { corporateTax: 0 },

        // HEADCOUNT
        headcount: { teachers: 0, corporate: 0, franchiseTeam: 0 },
      };

      // ===== YEAR 0 (2026) - PRE-OPERATIONAL =====
      if (year === 0) {
        if (month <= 7) {
          // Semester 1
          monthData.expenses.technology = R(CONFIG.preOperational.semester1.technology / 7);
          monthData.expenses.corporateStaff = R(CONFIG.preOperational.semester1.people / 7);
          if (month >= 2) monthData.expenses.curriculum = R(CONFIG.preOperational.semester1.curriculum / 6);
          monthData.expenses.architect = month === 1
            ? R(CONFIG.preOperational.semester1.architectUpfront + CONFIG.preOperational.semester1.architectMonthly)
            : R(CONFIG.preOperational.semester1.architectMonthly);
          if (month === 2) monthData.expenses.legal = R(CONFIG.preOperational.semester1.legal);
          monthData.headcount.corporate = 8;

          // Bridge funding - January
          if (month === 1) {
            monthData.funding.bridge = R(CONFIG.funding.bridge.amount);
            bridgeOutstanding = CONFIG.funding.bridge.amount;
          }
          // Bridge interest
          if (bridgeOutstanding > 0) {
            monthData.debtService.bridgeInterest = R(bridgeOutstanding * CONFIG.funding.bridge.interestRate);
          }
        } else {
          // Semester 2 (Aug-Dec)
          monthData.expenses.technology = R(CONFIG.preOperational.semester2.technology / 5);
          monthData.expenses.corporateStaff = R(CONFIG.preOperational.semester2.people / 5);

          // Teachers every month - 30 teachers hired
          monthData.expenses.teachers = R(CONFIG.staff.teachersHired2026 * CONFIG.staff.teacherSalary);
          monthData.headcount.teachers = CONFIG.staff.teachersHired2026;
          monthData.headcount.corporate = 12;

          // August: All funding arrives, repay bridge
          if (month === 8) {
            monthData.funding.desenvolveSP = R(CONFIG.funding.desenvolveSP.year2026);
            monthData.funding.innovation = R(CONFIG.funding.innovation.amount);
            monthData.funding.prefeitura = R(CONFIG.funding.prefeitura.year2026);
            desenvolveSPOutstanding = CONFIG.funding.desenvolveSP.year2026;
            innovationOutstanding = CONFIG.funding.innovation.amount;

            // Repay bridge immediately
            monthData.debtService.bridgePrincipal = R(bridgeOutstanding);
            // Bridge interest for 7 months (Jan-Jul) already paid, Aug interest
            monthData.debtService.bridgeInterest = R(bridgeOutstanding * CONFIG.funding.bridge.interestRate);
            bridgeOutstanding = 0;
          }

          // CAPEX: R$2M/month after bridge repayment (Aug-Dec = 5 months × R$2M = R$10M)
          // Then remaining R$10M in 2027
          if (month >= 8) {
            monthData.expenses.capex = R(2000000); // R$2M/month
          }

          monthData.expenses.architect = R(CONFIG.preOperational.semester1.architectMonthly);

          // DSP + Innovation quarterly interest December
          if (month === 12) {
            if (desenvolveSPOutstanding > 0) {
              monthData.debtService.dspInterest = R(desenvolveSPOutstanding * CONFIG.funding.desenvolveSP.interestRate / 4);
            }
            if (innovationOutstanding > 0) {
              monthData.debtService.innovationInterest = R(innovationOutstanding * CONFIG.funding.innovation.interestRate / 4);
            }
          }
        }
      }
      // ===== OPERATIONAL YEARS =====
      else {
        // Student counts
        monthData.students.flagship = flagshipStudents;
        monthData.students.adoptionPrivate = adoptionStudentsPrivate;
        monthData.students.adoptionPublic = publicStudents;

        // REVENUE
        monthData.revenue.flagship = R(annualFlagshipRevenue / 12);
        monthData.revenue.franchiseRoyalty = R(annualFranchiseRoyalty / 12);
        monthData.revenue.franchiseMarketing = R(annualFranchiseMarketing / 12);
        if (month === 1 || month === 7) monthData.revenue.franchiseFees = R(annualFranchiseFees / 2);
        monthData.revenue.adoptionPrivate = R(annualAdoptionRevenue / 12);
        if (month === 1) monthData.revenue.kits = R(annualKitRevenue);
        monthData.revenue.adoptionPublic = R(annualPublicRevenue / 12);

        // EXPENSES
        monthData.expenses.corporateStaff = R(staffCorporate / 12);
        monthData.expenses.flagshipStaff = R(staffFlagship / 12);
        monthData.expenses.franchiseSupport = R(staffFranchise / 12);
        monthData.expenses.adoptionSupport = R(staffAdoption / 12);
        monthData.expenses.teachers = R(teacherCount * CONFIG.staff.teacherSalary);
        monthData.expenses.technology = R(technologyCost / 12);
        monthData.expenses.marketing = R(marketingCost / 12);
        monthData.expenses.facilities = R(facilitiesCost / 12);
        monthData.expenses.curriculum = R(curriculumCost / 12);
        monthData.expenses.teacherTraining = R(teacherTrainingCost / 12);
        monthData.expenses.studentSupport = R(studentSupportCost / 12);
        monthData.expenses.qa = R(qaCost / 12);
        monthData.expenses.regulatory = R(regulatoryCost / 12);
        monthData.expenses.dataManagement = R(dataCost / 12);
        monthData.expenses.legal = R(legalCost / 12);
        monthData.expenses.insurance = R(insuranceCost / 12);
        monthData.expenses.parentEngagement = R(parentCost / 12);
        monthData.expenses.badDebt = R(badDebtCost / 12);
        monthData.expenses.paymentProcessing = R(paymentCost / 12);
        monthData.expenses.platformRD = R(rdCost / 12);
        monthData.expenses.contentDev = R(contentCost / 12);
        monthData.expenses.travel = R(travelCost / 12);
        monthData.expenses.workingCapital = R(workingCapitalCost / 12);
        monthData.expenses.contingency = R(contingencyCost / 12);
        monthData.expenses.publicCosts = R(publicDirectCosts / 12);

        // CAPEX Year 1: Remaining R$10M from 2026 allocation + R$5M 2027
        // Jan 2027: Second tranche arrives, continue R$2M/month for ~7.5 months
        if (year === 1) {
          if (month <= 8) {
            monthData.expenses.capex = R(2000000); // R$2M/month (total R$16M in Y1)
          }
          monthData.expenses.architect = R(CONFIG.preOperational.semester1.architectMonthly);

          // January 2027: Second tranche
          if (month === 1) {
            monthData.funding.desenvolveSP = R(CONFIG.funding.desenvolveSP.year2027);
            monthData.funding.prefeitura = R(CONFIG.funding.prefeitura.year2027);
            desenvolveSPOutstanding += CONFIG.funding.desenvolveSP.year2027;
          }
        }

        // Headcount
        monthData.headcount.teachers = teacherCount;
        monthData.headcount.corporate = 12 + (year * 2);
        monthData.headcount.franchiseTeam = franchiseCount > 0 ? Math.max(2, Math.ceil(franchiseCount / 5)) : 0;

        // DSP + Innovation quarterly interest
        if ((month === 3 || month === 6 || month === 9 || month === 12)) {
          if (desenvolveSPOutstanding > 0) {
            monthData.debtService.dspInterest = R(desenvolveSPOutstanding * CONFIG.funding.desenvolveSP.interestRate / 4);
          }
          if (innovationOutstanding > 0) {
            monthData.debtService.innovationInterest = R(innovationOutstanding * CONFIG.funding.innovation.interestRate / 4);
          }
        }

        // Principal repayment after 36 month grace (Aug 2029 = Year 3 Month 8)
        const absMonth = (year * 12) + month;
        const graceEndMonth = 8 + CONFIG.funding.desenvolveSP.gracePeriodMonths; // Month 44

        if (absMonth > graceEndMonth) {
          if (desenvolveSPOutstanding > 0) {
            const monthlyPrincipal = CONFIG.funding.desenvolveSP.total / (CONFIG.funding.desenvolveSP.repaymentYears * 12);
            monthData.debtService.dspPrincipal = R(monthlyPrincipal);
            desenvolveSPOutstanding = Math.max(0, desenvolveSPOutstanding - monthlyPrincipal);
          }
          if (innovationOutstanding > 0) {
            const monthlyPrincipal = CONFIG.funding.innovation.amount / (CONFIG.funding.innovation.repaymentYears * 12);
            monthData.debtService.innovationPrincipal = R(monthlyPrincipal);
            innovationOutstanding = Math.max(0, innovationOutstanding - monthlyPrincipal);
          }
        }

        // CORPORATE TAX (34% on profit)
        const monthlyRevenue = monthData.revenue.flagship + monthData.revenue.franchiseRoyalty +
                              monthData.revenue.franchiseMarketing + monthData.revenue.franchiseFees +
                              monthData.revenue.adoptionPrivate + monthData.revenue.kits + monthData.revenue.adoptionPublic;
        const monthlyExpenses = Object.values(monthData.expenses).reduce((a, b) => a + b, 0);
        const monthlyProfit = monthlyRevenue - monthlyExpenses;
        if (monthlyProfit > 0) {
          monthData.tax.corporateTax = R(monthlyProfit * CONFIG.taxRate);
        }
      }

      // Calculate totals
      monthData.totalFunding = R(Object.values(monthData.funding).reduce((a, b) => a + b, 0));
      monthData.totalRevenue = R(Object.values(monthData.revenue).reduce((a, b) => a + b, 0));
      monthData.totalExpenses = R(Object.values(monthData.expenses).reduce((a, b) => a + b, 0));
      monthData.totalDebtService = R(Object.values(monthData.debtService).reduce((a, b) => a + b, 0));
      monthData.totalTax = R(Object.values(monthData.tax).reduce((a, b) => a + b, 0));

      monthData.totalInflows = R(monthData.totalFunding + monthData.totalRevenue);
      monthData.totalOutflows = R(monthData.totalExpenses + monthData.totalDebtService + monthData.totalTax);
      monthData.netCashFlow = R(monthData.totalInflows - monthData.totalOutflows);

      cumulativeCash += monthData.netCashFlow;
      monthData.cumulativeCash = R(cumulativeCash);

      yearData.months.push(monthData);
      data.monthly.push(monthData);
    }

    // Year summary
    yearData.summary = {
      totalPrivateRevenue: R(totalPrivateRevenue),
      totalPublicRevenue: R(annualPublicRevenue),
      totalRevenue: R(totalRevenue),
      flagshipStudents, franchiseStudents: R(franchiseStudents), franchiseCount,
      adoptionStudentsPrivate, publicStudents, teacherCount,
      totalExpenses: R(yearData.months.reduce((sum, m) => sum + m.totalExpenses, 0)),
      totalDebtService: R(yearData.months.reduce((sum, m) => sum + m.totalDebtService, 0)),
      totalTax: R(yearData.months.reduce((sum, m) => sum + m.totalTax, 0)),
      totalFunding: R(yearData.months.reduce((sum, m) => sum + m.totalFunding, 0)),
      netCashFlow: R(yearData.months.reduce((sum, m) => sum + m.netCashFlow, 0)),
      endingCash: R(yearData.months[11].cumulativeCash),
    };

    data.yearly.push(yearData);
  }

  return data;
};

// ============================================
// CREATE EXCEL WORKBOOK
// ============================================

const createWorkbook = async (financialData) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI School Brazil';
  workbook.created = new Date();

  // ============================================
  // SHEET 1: YEARLY SUMMARY
  // ============================================
  const ws1 = workbook.addWorksheet('Yearly Summary', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 5 }]
  });

  ws1.mergeCells('A1:M1');
  ws1.getCell('A1').value = 'AI SCHOOL BRAZIL - 10 YEAR FINANCIAL PLAN';
  ws1.getCell('A1').font = { bold: true, size: 16 };
  ws1.getCell('A1').alignment = { horizontal: 'center' };

  ws1.mergeCells('A2:M2');
  ws1.getCell('A2').value = 'Private: REALISTIC | Public: OPTIMISTIC | Bridge R$10M | Desenvolve SP R$30M | Innovation R$15M | Prefeitura R$6.25M (grant)';
  ws1.getCell('A2').alignment = { horizontal: 'center' };

  const yearHeaders = ['Category', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035', '2036'];
  const yearLabels = ['', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'];

  ws1.getRow(4).values = yearLabels;
  ws1.getRow(5).values = yearHeaders;
  ws1.getRow(4).font = { italic: true, color: { argb: '666666' } };
  ws1.getRow(5).font = { bold: true };

  const yearlyRows = [
    { label: 'STUDENTS', isHeader: true },
    { label: 'Flagship Students', key: 'flagshipStudents' },
    { label: 'Franchise Students', key: 'franchiseStudents' },
    { label: 'Private Adoption Students', key: 'adoptionStudentsPrivate' },
    { label: 'Public Adoption Students', key: 'publicStudents' },
    { label: 'Teachers', key: 'teacherCount' },
    { label: '', isBlank: true },
    { label: 'REVENUE', isHeader: true, color: COLORS.revenueHeader },
    { label: 'Private Sector Revenue', key: 'totalPrivateRevenue', color: COLORS.revenueFill },
    { label: 'Public Sector Revenue', key: 'totalPublicRevenue', color: COLORS.revenueFill },
    { label: 'Total Revenue', key: 'totalRevenue', color: COLORS.revenueHeader },
    { label: '', isBlank: true },
    { label: 'EXPENSES & TAX', isHeader: true, color: COLORS.expenseHeader },
    { label: 'Operating Expenses', key: 'totalExpenses', color: COLORS.expenseFill },
    { label: 'Debt Service', key: 'totalDebtService', color: COLORS.debtFill },
    { label: 'Corporate Tax (34%)', key: 'totalTax', color: COLORS.expenseFill },
    { label: '', isBlank: true },
    { label: 'FUNDING (Loans/Grants)', isHeader: true, color: COLORS.fundingHeader },
    { label: 'Total Funding Received', key: 'totalFunding', color: COLORS.fundingFill },
    { label: '', isBlank: true },
    { label: 'CASH FLOW', isHeader: true, color: COLORS.cashFlowHeader },
    { label: 'Net Cash Flow', key: 'netCashFlow', color: COLORS.cashFlowFill },
    { label: 'Ending Cash Balance', key: 'endingCash', color: COLORS.cashFlowFill },
  ];

  let rowNum = 6;
  yearlyRows.forEach(rowDef => {
    const row = ws1.getRow(rowNum);
    row.getCell(1).value = rowDef.label;

    if (rowDef.isHeader) {
      row.font = { bold: true };
      if (rowDef.color) {
        for (let c = 1; c <= 12; c++) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowDef.color } };
        }
      }
    } else if (rowDef.key) {
      financialData.yearly.forEach((yearData, idx) => {
        row.getCell(idx + 2).value = yearData.summary[rowDef.key];
        row.getCell(idx + 2).numFmt = '#,##0';
      });
      if (rowDef.color) {
        for (let c = 1; c <= 12; c++) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowDef.color } };
        }
      }
    }
    rowNum++;
  });

  ws1.getColumn(1).width = 30;
  for (let i = 2; i <= 12; i++) ws1.getColumn(i).width = 15;

  // ============================================
  // SHEET 2: MONTHLY DETAIL
  // ============================================
  const ws2 = workbook.addWorksheet('Monthly Detail', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 4 }]
  });

  const monthHeaders = ['Category', 'Line Item'];
  financialData.monthly.forEach(m => monthHeaders.push(m.label));

  ws2.getRow(1).values = ['AI SCHOOL BRAZIL - MONTHLY DETAIL | Private: REALISTIC | Public: OPTIMISTIC'];
  ws2.mergeCells('A1:BP1');
  ws2.getCell('A1').font = { bold: true, size: 14 };

  ws2.getRow(2).values = ['Marketing: 8% Y1-2 → 5% Y3-4 → 3% Y5+ | Technology Y1: R$300K/mo | Public costs: 20% | Tax: 34%'];
  ws2.mergeCells('A2:BP2');

  ws2.getRow(4).values = monthHeaders;
  ws2.getRow(4).font = { bold: true };

  const monthlyRowDefs = [
    // FUNDING
    { label: 'FUNDING (Loans & Grants)', isSection: true, color: COLORS.fundingHeader },
    { cat: '', label: 'Bridge Loan (R$10M)', dataPath: 'funding.bridge', color: COLORS.fundingFill },
    { cat: '', label: 'Desenvolve SP (R$30M)', dataPath: 'funding.desenvolveSP', color: COLORS.fundingFill },
    { cat: '', label: 'Innovation Loan (R$15M)', dataPath: 'funding.innovation', color: COLORS.fundingFill },
    { cat: '', label: 'Prefeitura Grant (R$6.25M)', dataPath: 'funding.prefeitura', color: COLORS.fundingFill },
    { label: 'TOTAL FUNDING', isTotal: true, dataPath: 'totalFunding', color: COLORS.fundingHeader },
    { isBlank: true },

    // REVENUE - PRIVATE
    { label: 'REVENUE - PRIVATE', isSection: true, color: COLORS.revenueHeader },
    { cat: '', label: 'Flagship Tuition (R$2,300/mo)', dataPath: 'revenue.flagship', color: COLORS.revenueFill },
    { cat: '', label: '  → Flagship Students', dataPath: 'students.flagship', color: COLORS.studentCount },
    { cat: '', label: 'Franchise Royalties (6%)', dataPath: 'revenue.franchiseRoyalty', color: COLORS.revenueFill },
    { cat: '', label: 'Franchise Marketing (0.5%)', dataPath: 'revenue.franchiseMarketing', color: COLORS.revenueFill },
    { cat: '', label: 'Franchise License Fees', dataPath: 'revenue.franchiseFees', color: COLORS.revenueFill },
    { cat: '', label: 'Private Adoption (R$15/mo)', dataPath: 'revenue.adoptionPrivate', color: COLORS.revenueFill },
    { cat: '', label: '  → Private Adoption Students', dataPath: 'students.adoptionPrivate', color: COLORS.studentCount },
    { cat: '', label: 'Kit Sales', dataPath: 'revenue.kits', color: COLORS.revenueFill },
    { isBlank: true },

    // REVENUE - PUBLIC
    { label: 'REVENUE - PUBLIC', isSection: true, color: COLORS.revenueHeader },
    { cat: '', label: 'Public Adoption (R$150/mo)', dataPath: 'revenue.adoptionPublic', color: COLORS.revenueFill },
    { cat: '', label: '  → Public Students', dataPath: 'students.adoptionPublic', color: COLORS.studentCount },
    { isBlank: true },

    { label: 'TOTAL REVENUE', isTotal: true, dataPath: 'totalRevenue', color: COLORS.revenueHeader },
    { isBlank: true },

    // EXPENSES - STAFF
    { label: 'EXPENSES - STAFF', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'Corporate Staff', dataPath: 'expenses.corporateStaff', color: COLORS.expenseFill },
    { cat: '', label: 'Flagship Staff', dataPath: 'expenses.flagshipStaff', color: COLORS.expenseFill },
    { cat: '', label: 'Teachers (R$8K/mo each)', dataPath: 'expenses.teachers', color: COLORS.expenseFill },
    { cat: '', label: '  → Teacher Count', dataPath: 'headcount.teachers', color: COLORS.studentCount },
    { cat: '', label: 'Franchise Support', dataPath: 'expenses.franchiseSupport', color: COLORS.expenseFill },
    { cat: '', label: 'Adoption Support', dataPath: 'expenses.adoptionSupport', color: COLORS.expenseFill },
    { isBlank: true },

    // EXPENSES - OPERATIONS
    { label: 'EXPENSES - OPERATIONS', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'Technology (Y1: R$300K, then 10%)', dataPath: 'expenses.technology', color: COLORS.expenseFill },
    { cat: '', label: 'Marketing (8%→5%→3%)', dataPath: 'expenses.marketing', color: COLORS.expenseFill },
    { cat: '', label: 'Facilities', dataPath: 'expenses.facilities', color: COLORS.expenseFill },
    { cat: '', label: 'Curriculum Development', dataPath: 'expenses.curriculum', color: COLORS.expenseFill },
    { cat: '', label: 'Teacher Training', dataPath: 'expenses.teacherTraining', color: COLORS.expenseFill },
    { cat: '', label: 'Student Support (R$40K×2^year)', dataPath: 'expenses.studentSupport', color: COLORS.expenseFill },
    { isBlank: true },

    // EXPENSES - COMPLIANCE
    { label: 'EXPENSES - COMPLIANCE', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'Quality Assurance', dataPath: 'expenses.qa', color: COLORS.expenseFill },
    { cat: '', label: 'Regulatory', dataPath: 'expenses.regulatory', color: COLORS.expenseFill },
    { cat: '', label: 'Data Management', dataPath: 'expenses.dataManagement', color: COLORS.expenseFill },
    { cat: '', label: 'Legal', dataPath: 'expenses.legal', color: COLORS.expenseFill },
    { cat: '', label: 'Insurance', dataPath: 'expenses.insurance', color: COLORS.expenseFill },
    { isBlank: true },

    // EXPENSES - OTHER
    { label: 'EXPENSES - OTHER', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'Parent Engagement', dataPath: 'expenses.parentEngagement', color: COLORS.expenseFill },
    { cat: '', label: 'Bad Debt (2%)', dataPath: 'expenses.badDebt', color: COLORS.expenseFill },
    { cat: '', label: 'Payment Processing (2.5%)', dataPath: 'expenses.paymentProcessing', color: COLORS.expenseFill },
    { cat: '', label: 'Platform R&D (6%)', dataPath: 'expenses.platformRD', color: COLORS.expenseFill },
    { cat: '', label: 'Content Development (4%)', dataPath: 'expenses.contentDev', color: COLORS.expenseFill },
    { cat: '', label: 'Travel', dataPath: 'expenses.travel', color: COLORS.expenseFill },
    { cat: '', label: 'Working Capital (1%)', dataPath: 'expenses.workingCapital', color: COLORS.expenseFill },
    { cat: '', label: 'Contingency (0.5%)', dataPath: 'expenses.contingency', color: COLORS.expenseFill },
    { cat: '', label: 'Public Sector Costs (20%)', dataPath: 'expenses.publicCosts', color: COLORS.expenseFill },
    { isBlank: true },

    // CAPEX
    { label: 'EXPENSES - CAPITAL', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'CAPEX (R$2M/mo after Aug 2026)', dataPath: 'expenses.capex', color: COLORS.expenseFill },
    { cat: '', label: 'Architect', dataPath: 'expenses.architect', color: COLORS.expenseFill },
    { isBlank: true },

    { label: 'TOTAL EXPENSES', isTotal: true, dataPath: 'totalExpenses', color: COLORS.expenseHeader },
    { isBlank: true },

    // DEBT SERVICE
    { label: 'DEBT SERVICE - BRIDGE', isSection: true, color: COLORS.debtHeader },
    { cat: '', label: 'Bridge Interest (2%/mo)', dataPath: 'debtService.bridgeInterest', color: COLORS.debtFill },
    { cat: '', label: 'Bridge Principal', dataPath: 'debtService.bridgePrincipal', color: COLORS.debtFill },
    { isBlank: true },

    { label: 'DEBT SERVICE - DESENVOLVE SP', isSection: true, color: COLORS.debtHeader },
    { cat: '', label: 'DSP Interest (12%/yr)', dataPath: 'debtService.dspInterest', color: COLORS.debtFill },
    { cat: '', label: 'DSP Principal', dataPath: 'debtService.dspPrincipal', color: COLORS.debtFill },
    { isBlank: true },

    { label: 'DEBT SERVICE - INNOVATION', isSection: true, color: COLORS.debtHeader },
    { cat: '', label: 'Innovation Interest (12%/yr)', dataPath: 'debtService.innovationInterest', color: COLORS.debtFill },
    { cat: '', label: 'Innovation Principal', dataPath: 'debtService.innovationPrincipal', color: COLORS.debtFill },
    { isBlank: true },

    { label: 'TOTAL DEBT SERVICE', isTotal: true, dataPath: 'totalDebtService', color: COLORS.debtHeader },
    { isBlank: true },

    // TAX
    { label: 'TAX', isSection: true, color: COLORS.expenseHeader },
    { cat: '', label: 'Corporate Tax (34%)', dataPath: 'tax.corporateTax', color: COLORS.expenseFill },
    { label: 'TOTAL TAX', isTotal: true, dataPath: 'totalTax', color: COLORS.expenseHeader },
    { isBlank: true },

    // CASH FLOW
    { label: 'CASH FLOW', isSection: true, color: COLORS.cashFlowHeader },
    { cat: '', label: 'Total Inflows', dataPath: 'totalInflows', color: COLORS.cashFlowFill },
    { cat: '', label: 'Total Outflows', dataPath: 'totalOutflows', color: COLORS.cashFlowFill },
    { cat: '', label: 'Net Cash Flow', dataPath: 'netCashFlow', color: COLORS.cashFlowFill },
    { cat: '', label: 'Cumulative Cash', dataPath: 'cumulativeCash', color: COLORS.cashFlowFill },
    { isBlank: true },

    // HEADCOUNT
    { label: 'HEADCOUNT', isSection: true, color: 'E2E2E2' },
    { cat: '', label: 'Teachers', dataPath: 'headcount.teachers' },
    { cat: '', label: 'Corporate', dataPath: 'headcount.corporate' },
    { cat: '', label: 'Franchise Team', dataPath: 'headcount.franchiseTeam' },
  ];

  const getValue = (obj, path) => {
    if (!path) return null;
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  };

  rowNum = 5;
  monthlyRowDefs.forEach(rowDef => {
    if (rowDef.isBlank) { rowNum++; return; }

    const row = ws2.getRow(rowNum);
    if (rowDef.isSection || rowDef.isTotal) {
      row.getCell(1).value = rowDef.label;
      row.getCell(1).font = { bold: true };
      if (rowDef.dataPath) {
        financialData.monthly.forEach((m, idx) => {
          row.getCell(idx + 3).value = getValue(m, rowDef.dataPath);
          row.getCell(idx + 3).numFmt = '#,##0';
        });
      }
    } else {
      row.getCell(1).value = rowDef.cat || '';
      row.getCell(2).value = rowDef.label;
      if (rowDef.dataPath) {
        financialData.monthly.forEach((m, idx) => {
          row.getCell(idx + 3).value = getValue(m, rowDef.dataPath);
          row.getCell(idx + 3).numFmt = '#,##0';
        });
      }
    }
    if (rowDef.color) {
      for (let c = 1; c <= 134; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowDef.color } };
      }
    }
    rowNum++;
  });

  ws2.getColumn(1).width = 30;
  ws2.getColumn(2).width = 35;
  for (let i = 3; i <= 134; i++) ws2.getColumn(i).width = 12;

  // ============================================
  // SHEET 3: ASSUMPTIONS
  // ============================================
  const ws3 = workbook.addWorksheet('Assumptions');

  const assumptions = [
    ['AI SCHOOL BRAZIL - MODEL ASSUMPTIONS'],
    [],
    ['SCENARIOS'],
    ['Private Sector', 'REALISTIC'],
    ['Public Sector', 'OPTIMISTIC'],
    [],
    ['FUNDING (Total R$61.25M)'],
    ['Bridge Loan', 'R$ 10,000,000', '2%/month', 'Repaid Aug 2026'],
    ['Desenvolve SP', 'R$ 30,000,000', '12%/year', '36mo grace + 5yr repay'],
    ['Innovation Loan', 'R$ 15,000,000', '12%/year', '36mo grace + 5yr repay'],
    ['Prefeitura Grant', 'R$ 6,250,000', 'Non-repayable', '25% of CAPEX'],
    [],
    ['PRIVATE REVENUE'],
    ['Flagship Tuition', 'R$ 2,300/month', '+6%/year'],
    ['Private Adoption', 'R$ 15/student/MONTH', '+6%/year'],
    ['Franchise Royalty', '6% of tuition'],
    ['Franchise Marketing', '0.5% of tuition'],
    ['Franchise Fee', 'R$ 180,000 per new'],
    ['Kit Sales', 'R$ 1,200 × 30%'],
    [],
    ['PUBLIC REVENUE (Optimistic)'],
    ['Fee', 'R$ 150/student/month'],
    ['Costs', '20% (sales & training)'],
    [],
    ['KEY RATES'],
    ['Technology Y1', 'R$ 300,000/month'],
    ['Technology Y2+', '10% of revenue'],
    ['Marketing Y1-2', '8% of revenue'],
    ['Marketing Y3-4', '5% of revenue'],
    ['Marketing Y5+', '3% of revenue'],
    ['Student Support', 'R$ 40K/mo × 2^year'],
    ['Corporate Tax', '34% on profit'],
    [],
    ['CAPEX SCHEDULE'],
    ['Aug-Dec 2026', 'R$ 2M/month (after bridge repay)'],
    ['Jan-Aug 2027', 'R$ 2M/month'],
    ['Total', 'R$ 25M'],
    [],
    ['Generated:', new Date().toISOString().split('T')[0]],
  ];

  assumptions.forEach((row, idx) => {
    ws3.getRow(idx + 1).values = row;
    if ([0, 2, 6, 12, 20, 24, 33].includes(idx)) {
      ws3.getRow(idx + 1).font = { bold: true };
    }
  });

  ws3.getColumn(1).width = 25;
  ws3.getColumn(2).width = 25;
  ws3.getColumn(3).width = 20;
  ws3.getColumn(4).width = 25;

  return workbook;
};

// ============================================
// MAIN
// ============================================

const main = async () => {
  console.log('Calculating financial data...');
  console.log('Private: REALISTIC | Public: OPTIMISTIC');
  const financialData = calculateFinancialData();

  console.log('\nRevenue Summary:');
  financialData.yearly.forEach(y => {
    console.log(`  ${y.calendarYear}: Private R$${(y.summary.totalPrivateRevenue/1000000).toFixed(1)}M + Public R$${(y.summary.totalPublicRevenue/1000000).toFixed(1)}M = R$${(y.summary.totalRevenue/1000000).toFixed(1)}M | Cash: R$${(y.summary.endingCash/1000000).toFixed(1)}M`);
  });

  console.log('\nCreating Excel workbook...');
  const workbook = await createWorkbook(financialData);

  const outputPath = '/Users/Raphael/BP K12/ai-school-financial-app/AI_School_Brazil_10Year_Financial_Plan.xlsx';
  await workbook.xlsx.writeFile(outputPath);

  console.log(`\nDone! File: ${outputPath}`);
};

main().catch(console.error);
