// Financial modeling engine with live calculations

export const DEFAULT_PARAMETERS = {
  // Market and Students (realistic targets)
  flagshipStudents: 1200, // 30 students/class, morning+afternoon shifts, 3,500m2 building
  franchiseCount: 24, // 3 new franchises/year starting Year 3 (8 years × 3)
  studentsPerFranchise: 1200, // Same model as flagship
  adoptionStudents: 150000, // Private adoption students by Year 10
  churnRate: 0.05, // 5% annual student churn (K-12 standard)

  // Pricing (competitive and realistic)
  flagshipTuition: 2300, // R$2,300/month
  adoptionLicenseFeeMonthly: 180, // R$180/month for private adoption (R$2,160/year)
  franchiseRoyaltyRate: 0.06, // 6% royalty
  franchiseMarketingFeeRate: 0.02, // 2% marketing fund (industry standard)
  franchiseFee: 180000, // R$180K franchise fee
  kitCostPerStudent: 1200, // R$100/month × 12 = R$1,200/year (for all students)
  tuitionIncreaseRate: 0.06, // 6% annual increase

  // Costs
  technologyCapex: 3000000,
  technologyOpexRate: 0.04, // 4% of revenue
  marketingRate: 0.05, // 5% of revenue

  // CAPEX Scenarios
  capexScenario: 'private-historic',

  // Growth rates
  franchiseGrowthRate: 3, // 3 new franchises per year starting Year 3
  adoptionGrowthRate: 0.3, // 30% growth
  franchiseStartingStudents: 300, // Franchises start with 300 students

  // Year-by-year overrides (optional)
  yearlyOverrides: {},
};

// Scenario presets for quick switching
export const SCENARIO_PRESETS = {
  pessimistic: {
    name: 'Pessimistic',
    description: 'Conservative growth with challenges',
    parameters: {
      // Market and Students (10% lower than realistic)
      flagshipStudents: 1080, // 10% lower than 1200
      franchiseCount: 21, // ~10% lower than 24
      studentsPerFranchise: 1080, // 10% lower than 1200
      adoptionStudents: 135000, // 10% lower than 150000
      churnRate: 0.07, // 7% churn (higher than realistic)

      // Pricing (10% lower)
      flagshipTuition: 2070, // 10% lower than 2300
      adoptionLicenseFeeMonthly: 162, // R$162/month (10% lower)
      franchiseRoyaltyRate: 0.054, // 10% lower than 6%
      franchiseMarketingFeeRate: 0.02,
      franchiseFee: 162000, // 10% lower than 180000
      kitCostPerStudent: 1080, // 10% lower than 1200
      tuitionIncreaseRate: 0.054, // 10% lower than 6%

      // Costs (higher)
      technologyOpexRate: 0.05, // Higher costs
      marketingRate: 0.06, // Higher marketing needed

      // Growth rates (slower)
      franchiseGrowthRate: 2.5, // Slower
      adoptionGrowthRate: 0.25,
      franchiseStartingStudents: 300,

      capexScenario: 'private-historic',
      yearlyOverrides: {}
    }
  },

  realistic: {
    name: 'Realistic',
    description: 'Expected scenario with moderate growth',
    parameters: { ...DEFAULT_PARAMETERS }
  },

  optimistic: {
    name: 'Optimistic',
    description: 'Strong growth with ambitious targets',
    parameters: {
      // Market and Students (higher numbers)
      flagshipStudents: 1500,
      franchiseCount: 30, // ~4 per year
      studentsPerFranchise: 1500,
      adoptionStudents: 250000,
      churnRate: 0.03, // 3% churn (lower)

      // Pricing (higher)
      flagshipTuition: 2500,
      adoptionLicenseFeeMonthly: 200, // R$200/month
      franchiseRoyaltyRate: 0.07, // 7%
      franchiseMarketingFeeRate: 0.02,
      franchiseFee: 200000,
      kitCostPerStudent: 1500,
      tuitionIncreaseRate: 0.08, // 8%

      // Costs (lower, more efficient)
      technologyOpexRate: 0.03,
      marketingRate: 0.04,

      // Growth rates (faster)
      franchiseGrowthRate: 4,
      adoptionGrowthRate: 0.5,
      franchiseStartingStudents: 300,

      capexScenario: 'private-historic',
      yearlyOverrides: {}
    }
  }
};

// Phased CAPEX and Investment Structure (2026-2027)
// Based on private historic building with Desenvolve SP + Innovation financing and Prefeitura subsidy
// CAPEX = R$25M total, Prefeitura subsidy = 25% of R$25M = R$6.25M
export const INVESTMENT_PHASES = {
  phase1: {
    name: 'Phase 1 - 2026 (Pre-Launch)',
    semester1: {
      total: 10000000, // R$10M
      sources: {
        bridgeInvestment: 10000000, // R$10M from bridge private investment
      },
      allocation: {
        architectUpfront: 100000, // R$100K architect upfront
        technologyPlatform: 5000000, // R$5M tech development
        peoplePreLaunch: 3400000, // R$3.4M salaries and operations
        contentDevelopment: 500000, // R$500K content (R$100K/mo for 5 months S2)
      },
      months: [1, 2, 3, 4, 5, 6, 7] // Jan-Jul
    },
    semester2: {
      total: 15000000, // R$15M
      sources: {
        desenvolveSP: 20000000, // R$20M from Desenvolve SP
        innovationLoan: 15000000, // R$15M Innovation loan
        prefeituraSubsidy: 5000000, // Part of 25% subsidy (R$5M in 2026)
      },
      allocation: {
        capexConstruction: 10000000, // R$10M CAPEX
        peopleHiring: 3000000, // R$3M people hiring
        technology: 2000000, // R$2M additional tech
      },
      months: [8, 9, 10, 11, 12], // Aug-Dec
      bridgeRepayment: {
        amount: 10000000, // R$10M bridge repayment in Oct 2026
        month: 10, // October 2026
        interestPaid: 1800000, // ~2% × 9 months (Jan-Oct) ≈ R$1.8M interest
      }
    }
  },
  phase2: {
    name: 'Phase 2 - 2027 (School Operating)',
    total: 5000000, // R$5M additional CAPEX
    sources: {
      desenvolveSP: 10000000, // R$10M more from Desenvolve SP (total 30M)
      prefeituraSubsidy: 1250000, // Remaining 25% subsidy (R$1.25M)
    },
    allocation: {
      capexEquipment: 3000000, // R$3M equipment and finishing
      capexInfrastructure: 2000000, // R$2M additional infrastructure
    },
  },
  architectProject: {
    total: 1200000, // R$1.2M total
    upfront: 100000, // R$100K upfront (included in Phase 1 Semester 1)
    monthlyPayment: 45833, // R$1.1M / 24 months ≈ R$45,833/month
    paymentMonths: 24, // 24 months starting from month 2
  },
  // Loan details for debt service calculations
  loans: {
    bridge: {
      amount: 10000000, // R$10M
      interestRate: 0.02, // 2% per month
      disbursementMonth: 1, // January 2026
      repaymentMonth: 10, // October 2026
    },
    desenvolveSP: {
      total: 30000000, // R$30M total
      year2026: 20000000, // R$20M in Aug 2026
      year2027: 10000000, // R$10M in Jan 2027
      interestRate: 0.12, // 12% per year
      gracePeriodMonths: 36, // 3 years grace
      repaymentYears: 5, // 5 year amortization after grace
    },
    innovation: {
      amount: 15000000, // R$15M
      disbursementMonth: 8, // August 2026 with Desenvolve SP
      interestRate: 0.12, // Same terms as Desenvolve SP
      gracePeriodMonths: 36,
      repaymentYears: 5,
    },
  },
  totals: {
    totalCapex: 25000000, // R$25M total CAPEX
    bridgeInvestment: 10000000, // R$10M bridge (repaid Aug 2026)
    desenvolveSPLoan: 30000000, // R$30M total from Desenvolve SP
    innovationLoan: 15000000, // R$15M Innovation loan
    prefeituraSubsidy: 6250000, // R$6.25M total from Prefeitura (25% of R$25M CAPEX)
    totalDebt: 45000000, // R$30M DSP + R$15M Innovation
  }
};

// Public Sector Adoption Projections (2028-2037)
// NO PUBLIC in 2027 - starts in 2028
// Realistic: 0 (2027) -> 10K (2028) -> 50K (2029) -> grow to target by 2037
// Pessimistic: 20% lower per year
// Optimistic: 20% higher per year
export const PUBLIC_ADOPTION_PROJECTIONS = {
  realistic: {
    name: 'Realistic',
    description: 'No public in 2027, 10K in 2028, 50K in 2029, growing to 2M by 2037',
    yearlyStudents: {
      2027: 0,        // Year 1 - NO PUBLIC
      2028: 10000,    // Year 2 - 10K students (first year)
      2029: 50000,    // Year 3 - 50K students
      2030: 100000,   // Year 4 - 100K students
      2031: 180000,   // Year 5 - 180K students
      2032: 300000,   // Year 6 - 300K students
      2033: 450000,   // Year 7 - 450K students
      2034: 650000,   // Year 8 - 650K students
      2035: 900000,   // Year 9 - 900K students
      2036: 1200000,  // Year 10 - 1.2M students
      2037: 1500000,  // Year 11 - 1.5M students (market share target)
    }
  },
  pessimistic: {
    name: 'Pessimistic',
    description: '20% lower than realistic per year',
    yearlyStudents: {
      2027: 0,        // NO PUBLIC
      2028: 8000,     // 10K * 0.8
      2029: 40000,    // 50K * 0.8
      2030: 80000,    // 100K * 0.8
      2031: 144000,   // 180K * 0.8
      2032: 240000,   // 300K * 0.8
      2033: 360000,   // 450K * 0.8
      2034: 520000,   // 650K * 0.8
      2035: 720000,   // 900K * 0.8
      2036: 960000,   // 1.2M * 0.8
      2037: 1200000,  // 1.5M * 0.8
    }
  },
  optimistic: {
    name: 'Optimistic',
    description: '20% higher than realistic per year',
    yearlyStudents: {
      2027: 0,        // NO PUBLIC
      2028: 12000,    // 10K * 1.2
      2029: 60000,    // 50K * 1.2
      2030: 120000,   // 100K * 1.2
      2031: 216000,   // 180K * 1.2
      2032: 360000,   // 300K * 1.2
      2033: 540000,   // 450K * 1.2
      2034: 780000,   // 650K * 1.2
      2035: 1080000,  // 900K * 1.2
      2036: 1440000,  // 1.2M * 1.2
      2037: 1800000,  // 1.5M * 1.2
    }
  }
};

// Helper function to get public adoption students for a given year and scenario
export const getPublicAdoptionStudents = (year, scenario = 'realistic') => {
  const calendarYear = 2026 + year; // Year 0 = 2026, Year 1 = 2027, etc.
  const projections = PUBLIC_ADOPTION_PROJECTIONS[scenario] || PUBLIC_ADOPTION_PROJECTIONS.realistic;
  return projections.yearlyStudents[calendarYear] || 0;
};

export const CAPEX_SCENARIOS = {
  'private-historic': {
    name: 'Private Historic Building',
    initialCapex: 20000000, // R$20M Year 0 (Phase 1 CAPEX portion)
    year1Capex: 5000000, // R$5M Year 1 (Phase 2)
    baseFacilityCost: 1500000, // R$1.5M Year 1 (maintenance, utilities, taxes)
    facilityInflationRate: 0.05, // 5% annual inflation
    description: 'R$25M total CAPEX, historic building with Desenvolve SP + Innovation + Prefeitura subsidy',
    fundingSources: {
      bridgeInvestment: 10000000, // R$10M bridge (repaid Aug 2026)
      desenvolveSP: 30000000, // R$30M CAPEX loan
      innovationLoan: 15000000, // R$15M Innovation loan
      prefeituraSubsidy: 6250000, // R$6.25M (25% of R$25M CAPEX)
    },
    bridgeRepayment: {
      amount: 10000000,
      interestPaid: 1800000, // ~2% × 9 months (Jan-Oct)
      month: 10, // October
      year: 0, // 2026
    }
  },
  government: {
    name: 'Government Partnership',
    initialCapex: 10000000, // R$10M renovation only
    year1Capex: 0,
    baseFacilityCost: 800000,
    facilityInflationRate: 0.05,
    description: 'R$10M renovation, 30-year free building use from government',
    fundingSources: {
      bridgeInvestment: 10000000,
      desenvolveSP: 0,
      innovationLoan: 0,
      prefeituraSubsidy: 0,
    }
  },
  'built-to-suit': {
    name: 'Built-to-Suit with 30-Year Lease',
    initialCapex: 3000000, // R$3M tech only
    year1Capex: 0,
    baseFacilityCost: 3200000, // R$25M building cost amortized over 30 years + operational costs
    facilityInflationRate: 0.05,
    description: 'R$3M tech, developer builds R$25M facility, 30-year lease ~R$3.2M/year',
    fundingSources: {
      bridgeInvestment: 3000000,
      desenvolveSP: 0,
      innovationLoan: 0,
      prefeituraSubsidy: 0,
    }
  },
  direct: {
    name: 'Direct Investment & Construction',
    initialCapex: 25000000, // R$25M for our own construction + tech
    year1Capex: 0,
    baseFacilityCost: 1200000,
    facilityInflationRate: 0.05,
    description: 'R$25M building construction + tech, full ownership',
    fundingSources: {
      bridgeInvestment: 25000000,
      desenvolveSP: 0,
      innovationLoan: 0,
      prefeituraSubsidy: 0,
    }
  }
};

export class FinancialModel {
  constructor(parameters = DEFAULT_PARAMETERS) {
    this.params = { ...DEFAULT_PARAMETERS, ...parameters };
  }

  updateParameters(newParams) {
    this.params = { ...this.params, ...newParams };
  }

  calculateYearData(year) {
    const yearIndex = year - 1;

    // Check for yearly overrides
    const yearOverrides = this.params.yearlyOverrides?.[year] || {};

    // Student calculations with overrides and realistic ramp-up
    // Apply churn rate (5% default for K-12)
    const churnRate = this.params.churnRate || 0.05;
    const retentionFactor = year > 1 ? (1 - churnRate) : 1;

    let flagshipStudents = yearOverrides.flagshipStudents ||
      (year === 0 ? 0 :
       year === 1 ? 300 :
       year === 2 ? 750 :
       this.params.flagshipStudents);

    // Apply churn to returning students (not new ones)
    if (year > 2) {
      flagshipStudents = Math.round(flagshipStudents * retentionFactor + this.params.flagshipStudents * churnRate);
    }

    // Franchises only start after Year 2 (need proven model first)
    // 3 new franchises per year starting Year 3
    const franchiseCount = yearOverrides.franchiseCount !== undefined ? yearOverrides.franchiseCount :
      (year <= 2 ? 0 : Math.min((year - 2) * this.params.franchiseGrowthRate, this.params.franchiseCount));

    // Calculate franchise students with ramp-up period
    let franchiseStudents = 0;
    if (franchiseCount > 0 && year > 2) {
      const targetPerFranchise = yearOverrides.studentsPerFranchise || this.params.studentsPerFranchise;
      const startingStudents = this.params.franchiseStartingStudents || 300;

      for (let cohortStartYear = 3; cohortStartYear <= year; cohortStartYear++) {
        const previousCount = cohortStartYear === 3 ? 0 :
          Math.min((cohortStartYear - 3) * this.params.franchiseGrowthRate, this.params.franchiseCount);
        const currentCount = Math.min((cohortStartYear - 2) * this.params.franchiseGrowthRate, this.params.franchiseCount);
        const newFranchisesThisYear = currentCount - previousCount;

        if (newFranchisesThisYear > 0) {
          const franchiseAge = year - cohortStartYear;
          let studentsPerFranchise;
          if (franchiseAge === 0) {
            studentsPerFranchise = startingStudents;
          } else if (franchiseAge === 1) {
            studentsPerFranchise = startingStudents + (targetPerFranchise - startingStudents) * 0.33;
          } else if (franchiseAge === 2) {
            studentsPerFranchise = startingStudents + (targetPerFranchise - startingStudents) * 0.67;
          } else {
            studentsPerFranchise = targetPerFranchise;
          }
          franchiseStudents += newFranchisesThisYear * studentsPerFranchise * retentionFactor;
        }
      }
    }

    // Adoption students start small in Year 2, grow gradually
    let adoptionStudents;
    if (yearOverrides.adoptionStudents !== undefined) {
      adoptionStudents = yearOverrides.adoptionStudents;
    } else if (year <= 1) {
      adoptionStudents = 0;
    } else if (year === 2) {
      adoptionStudents = 2500;
    } else {
      const growthYears = year - 2;
      const targetAdoption = this.params.adoptionStudents;
      if (growthYears <= 8) {
        adoptionStudents = Math.min(
          2500 + (targetAdoption - 2500) * (growthYears / 8),
          targetAdoption
        );
      } else {
        adoptionStudents = targetAdoption;
      }
      // Apply churn
      adoptionStudents = adoptionStudents * retentionFactor;
    }

    // Pricing with annual increases
    const currentTuition = yearOverrides.tuition || (this.params.flagshipTuition * Math.pow(1 + this.params.tuitionIncreaseRate, Math.max(0, year - 1)));
    // Private adoption fee is R$180/MONTH (adoptionLicenseFeeMonthly)
    const monthlyAdoptionFee = this.params.adoptionLicenseFeeMonthly || 180;
    const currentAdoptionFeeMonthly = yearOverrides.adoptionFee || (monthlyAdoptionFee * Math.pow(1 + this.params.tuitionIncreaseRate, Math.max(0, year - 1)));
    const currentKitCost = yearOverrides.kitCost || (this.params.kitCostPerStudent * Math.pow(1 + this.params.tuitionIncreaseRate, Math.max(0, year - 1)));

    // Calculate NEW franchises this year for franchise fees
    const previousYear = year - 1;
    const previousYearOverrides = this.params.yearlyOverrides?.[previousYear] || {};
    const previousFranchiseCount = previousYear <= 2 ? 0 :
      (previousYearOverrides.franchiseCount !== undefined ? previousYearOverrides.franchiseCount :
       Math.min((previousYear - 2) * this.params.franchiseGrowthRate, this.params.franchiseCount));
    const newFranchises = Math.max(0, franchiseCount - previousFranchiseCount);

    // Revenue calculations
    const flagshipRevenue = flagshipStudents * currentTuition * 12;
    const franchiseTuitionRevenue = franchiseStudents * currentTuition * 12;
    const franchiseRoyaltyRevenue = franchiseTuitionRevenue * this.params.franchiseRoyaltyRate;
    // Use franchiseMarketingFeeRate (2%) instead of old marketingFeeRate (0.5%)
    const franchiseMarketingFeeRate = this.params.franchiseMarketingFeeRate || 0.02;
    const franchiseMarketingRevenue = franchiseTuitionRevenue * franchiseMarketingFeeRate;
    const franchiseFeeRevenue = newFranchises * this.params.franchiseFee;
    // Adoption revenue: R$180/month × 12 = R$2,160/year per student
    const adoptionRevenue = adoptionStudents * currentAdoptionFeeMonthly * 12;
    const totalStudents = flagshipStudents + franchiseStudents + adoptionStudents;
    // Kit revenue for ALL students (flagship + franchise + adoption)
    const kitRevenue = totalStudents * currentKitCost;

    const totalRevenue = flagshipRevenue + franchiseRoyaltyRevenue + franchiseMarketingRevenue +
                        franchiseFeeRevenue + adoptionRevenue + kitRevenue;

    // Cost calculations
    const technologyOpex = totalRevenue * this.params.technologyOpexRate;
    const marketingCosts = totalRevenue * this.params.marketingRate;

    // Staff costs with SENSIBLE annual increases (5% inflation only, not compound)
    const inflationMultiplier = Math.pow(1.05, Math.max(0, year - 1)); // 5% annual inflation

    const baseStaffCorporate = Math.max(3000000, totalStudents * 80);
    const baseStaffFlagship = flagshipStudents > 0 ? Math.max(2500000, flagshipStudents * 2200) : 0;
    const baseStaffFranchiseSupport = franchiseCount * 300000;

    // Adoption support: 1 person (R$10K salary) per 20 schools
    // Schools = adoptionStudents / 500 (avg school size)
    const adoptionSchools = Math.ceil(adoptionStudents / 500);
    const adoptionSupportStaff = Math.ceil(adoptionSchools / 20);
    const baseStaffAdoptionSupport = adoptionSupportStaff * 10000 * 12; // R$10K/month × 12

    const staffCorporate = baseStaffCorporate * inflationMultiplier;
    const staffFlagship = baseStaffFlagship * inflationMultiplier;
    const staffFranchiseSupport = baseStaffFranchiseSupport * inflationMultiplier;
    const staffAdoptionSupport = baseStaffAdoptionSupport * inflationMultiplier;

    // Educational & Operational costs
    // Teacher training: base cost without crazy multiplier
    const teacherTraining = Math.max(200000, (flagshipStudents + franchiseStudents) * 250) * inflationMultiplier;
    const qualityAssurance = Math.max(300000, totalRevenue * 0.01);
    const regulatoryCompliance = Math.max(400000, totalRevenue * 0.005);
    const dataManagement = Math.max(200000, totalStudents * 40);
    const parentEngagement = Math.max(150000, totalStudents * 60);

    // Business costs
    const badDebt = totalRevenue * 0.02; // 2%
    const paymentProcessing = totalRevenue * 0.025; // 2.5%
    const platformRD = totalRevenue * 0.06; // 6% for platform R&D
    // Content development: 4% of revenue (removed separate curriculum line)
    const contentDevelopment = totalRevenue * 0.04;

    // Facility costs with 5% annual inflation
    const capexScenario = CAPEX_SCENARIOS[this.params.capexScenario];
    const baseFacilityCost = capexScenario.baseFacilityCost || 1500000;
    const facilityInflation = capexScenario.facilityInflationRate || 0.05;
    const facilityCosts = baseFacilityCost * Math.pow(1 + facilityInflation, Math.max(0, year - 1));

    // Other costs
    const legalCompliance = Math.max(500000, totalRevenue * 0.003);
    const insurance = totalRevenue * 0.005; // 0.5% (market rate for education)
    const travel = Math.max(300000, (franchiseCount + Math.floor(adoptionStudents / 5000)) * 50000);
    const workingCapital = totalRevenue * 0.01;
    const contingency = totalRevenue * 0.005;

    const totalCosts = technologyOpex + marketingCosts + staffCorporate + staffFlagship +
                      staffFranchiseSupport + staffAdoptionSupport + facilityCosts +
                      legalCompliance + insurance + travel + workingCapital + contingency +
                      teacherTraining + qualityAssurance +
                      regulatoryCompliance + dataManagement + parentEngagement + badDebt +
                      paymentProcessing + platformRD + contentDevelopment;
    
    const ebitda = totalRevenue - totalCosts;
    const ebitdaMargin = totalRevenue > 0 ? ebitda / totalRevenue : 0;

    // CAPEX calculation with phased structure
    // For private-historic: Year 0 = R$20M, Year 1 = R$5M (Phase 2)
    // Plus architect payments: R$100k upfront + R$45.8k/month for 24 months
    let capex;
    if (yearOverrides.capex !== undefined) {
      capex = yearOverrides.capex;
    } else if (year === 0) {
      // Phase 1: Initial CAPEX (R$20M for private-historic)
      capex = capexScenario.initialCapex;
    } else if (year === 1 && capexScenario.year1Capex) {
      // Phase 2 CAPEX (R$5M for private-historic)
      // Plus ongoing architect payments (12 months × R$45.8k)
      const architectPayments = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
      capex = capexScenario.year1Capex + architectPayments;
    } else if (year === 2 && this.params.capexScenario === 'private-historic') {
      // Final year of architect payments (remaining 12 months)
      capex = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
    } else {
      // Ongoing maintenance CAPEX
      capex = year <= 5 ? totalRevenue * 0.005 : totalRevenue * 0.003;
    }

    // Tax calculation - Brazil corporate tax (IRPJ + CSLL) = 34%
    const taxRate = 0.34;
    const taxableIncome = Math.max(0, ebitda);
    const taxes = taxableIncome * taxRate;
    
    const netIncome = ebitda - taxes;
    const freeCashFlow = netIncome - capex;
    
    // Investment phase and funding details for Year 0 and Year 1
    let investmentPhase = null;
    let fundingSources = null;
    let architectPayment = 0;
    let debtService = null;

    if (this.params.capexScenario === 'private-historic') {
      if (year === 0) {
        investmentPhase = {
          phase: 'Phase 1 - Pre-Launch (2026)',
          semester1: INVESTMENT_PHASES.phase1.semester1,
          semester2: INVESTMENT_PHASES.phase1.semester2,
        };
        fundingSources = {
          bridgeInvestment: 10000000, // R$10M in January
          desenvolveSP: 20000000, // R$20M in August
          innovationLoan: 15000000, // R$15M in August
          prefeituraSubsidy: 5000000, // R$5M in August
        };
        // Bridge repaid in Aug 2026 when funding arrives
        debtService = {
          bridgeRepayment: 10000000, // R$10M principal
          bridgeInterest: 1400000, // ~2% × 7 months
        };
        architectPayment = INVESTMENT_PHASES.architectProject.upfront +
                          (INVESTMENT_PHASES.architectProject.monthlyPayment * 11); // upfront + 11 months
      } else if (year === 1) {
        investmentPhase = {
          phase: 'Phase 2 - School Operating (2027)',
          details: INVESTMENT_PHASES.phase2,
        };
        fundingSources = {
          desenvolveSP: 10000000, // Remaining R$10M from Desenvolve SP
          prefeituraSubsidy: 1250000, // R$1.25M
        };
        // Quarterly interest on DSP R$30M + Innovation R$15M = R$45M × 12% / 4 = R$1.35M/quarter
        debtService = {
          dspInterest: 30000000 * 0.12, // R$3.6M/year
          innovationInterest: 15000000 * 0.12, // R$1.8M/year
        };
        architectPayment = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
      } else if (year === 2) {
        architectPayment = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
        // Interest only (still in grace period)
        debtService = {
          dspInterest: 30000000 * 0.12,
          innovationInterest: 15000000 * 0.12,
        };
      } else if (year >= 3) {
        // Grace period ends Aug 2029 (36 months from Aug 2026)
        // Principal repayment starts Year 4 (2030)
        const graceEndYear = 4; // Year 4 = 2030
        if (year >= graceEndYear) {
          // 5-year amortization: R$45M / 5 = R$9M/year principal
          const yearsSinceGraceEnd = year - graceEndYear;
          const remainingPrincipal = 45000000 - (yearsSinceGraceEnd * 9000000);
          if (remainingPrincipal > 0) {
            debtService = {
              principal: 9000000, // R$9M/year
              interest: remainingPrincipal * 0.12, // Interest on remaining
            };
          }
        } else {
          // Still in grace - interest only
          debtService = {
            dspInterest: 30000000 * 0.12,
            innovationInterest: 15000000 * 0.12,
          };
        }
      }
    }

    return {
      year,
      students: {
        flagship: Math.round(flagshipStudents),
        franchise: Math.round(franchiseStudents),
        adoption: Math.round(adoptionStudents),
        total: Math.round(totalStudents)
      },
      franchiseCount: Math.round(franchiseCount),
      revenue: {
        flagship: flagshipRevenue,
        franchiseRoyalty: franchiseRoyaltyRevenue,
        franchiseMarketing: franchiseMarketingRevenue,
        franchiseFees: franchiseFeeRevenue,
        adoption: adoptionRevenue,
        kits: kitRevenue,
        total: totalRevenue
      },
      costs: {
        technologyOpex,
        marketing: marketingCosts,
        staffCorporate,
        staffFlagship,
        staffFranchiseSupport,
        staffAdoptionSupport,
        facilities: facilityCosts,
        legal: legalCompliance,
        insurance,
        travel,
        workingCapital,
        contingency,
        teacherTraining,
        qualityAssurance,
        regulatoryCompliance,
        dataManagement,
        parentEngagement,
        badDebt,
        paymentProcessing,
        platformRD,
        contentDevelopment,
        architectPayment,
        total: totalCosts
      },
      capex,
      ebitda,
      ebitdaMargin,
      taxes,
      netIncome,
      freeCashFlow,
      pricing: {
        tuition: currentTuition,
        adoptionFeeMonthly: currentAdoptionFeeMonthly,
        kitCost: currentKitCost
      },
      // Investment and funding details
      investmentPhase,
      fundingSources,
      debtService,
      // Churn info
      churnRate: churnRate,
    };
  }

  calculateProjection(years = 11) {
    const projection = [];
    for (let year = 0; year <= years; year++) {
      projection.push(this.calculateYearData(year));
    }
    return projection;
  }

  calculateIRR(cashFlows) {
    // Simple IRR calculation using bisection method
    let rate = 0.1;
    let high = 1.0;
    let low = -0.99;
    
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
      }
      
      if (Math.abs(npv) < 1000) break;
      
      if (npv > 0) {
        low = rate;
      } else {
        high = rate;
      }
      rate = (low + high) / 2;
    }
    
    return rate;
  }

  calculateNPV(cashFlows, discountRate = 0.1) {
    return cashFlows.reduce((npv, cashFlow, year) => {
      return npv + cashFlow / Math.pow(1 + discountRate, year);
    }, 0);
  }

  calculateFlagshipBreakeven() {
    // Calculate flagship-only break-even (excluding franchises and adoption)
    const flagshipBreakeven = [];
    let monthlyRevenue = 0;
    let monthlyOperatingCosts = 0;
    let cumulativeResult = 0;
    let breakEvenMonth = null;
    
    for (let month = 1; month <= 24; month++) { // Check first 24 months
      const students = month <= 6 ? Math.min(50 + (month - 1) * 25, 300) : 
                     month <= 12 ? Math.min(300 + (month - 6) * 45, 600) :
                     Math.min(600 + (month - 12) * 75, 1200);
      
      monthlyRevenue = students * this.params.flagshipTuition;
      
      // Monthly costs for flagship only
      const staffCosts = Math.max(400000, students * 350); // Teachers, admin
      const facilityCosts = CAPEX_SCENARIOS[this.params.capexScenario].annualFacilityCost / 12;
      const marketingCosts = monthlyRevenue * 0.15; // Higher marketing for flagship ramp-up
      const operationalCosts = monthlyRevenue * 0.08; // Materials, utilities, etc
      const corporateCosts = 250000; // Monthly corporate overhead
      
      monthlyOperatingCosts = staffCosts + facilityCosts + marketingCosts + operationalCosts + corporateCosts;
      
      const monthlyResult = monthlyRevenue - monthlyOperatingCosts;
      cumulativeResult += monthlyResult;
      
      flagshipBreakeven.push({
        month,
        students,
        monthlyRevenue,
        monthlyOperatingCosts,
        monthlyResult,
        cumulativeResult
      });
      
      if (cumulativeResult > 0 && !breakEvenMonth) {
        breakEvenMonth = month;
      }
    }
    
    return {
      breakEvenMonth: breakEvenMonth || 24,
      monthlyData: flagshipBreakeven
    };
  }

  getFinancialSummary() {
    const projection = this.calculateProjection(10);
    const cashFlows = projection.map(year => year.freeCashFlow);

    // For private-historic, use the total equity investment from bridge (not including financing)
    const capexScenario = CAPEX_SCENARIOS[this.params.capexScenario];
    if (this.params.capexScenario === 'private-historic') {
      // Only count bridge investment as equity outflow (financing is not equity)
      cashFlows[0] = -capexScenario.fundingSources.bridgeInvestment;
      // Year 1 gets Desenvolve SP funding which offsets CAPEX
      // Net cash impact is reduced by the funding received
    } else {
      // Initial investment is negative cash flow
      cashFlows[0] = -capexScenario.initialCapex;
    }

    const irr = this.calculateIRR(cashFlows);
    const npv = this.calculateNPV(cashFlows);
    const year10 = projection[10];
    const cumulativeEbitda = projection.slice(1).reduce((sum, year) => sum + year.ebitda, 0);
    const cumulativeFcf = projection.slice(1).reduce((sum, year) => sum + year.freeCashFlow, 0);
    const flagshipBreakeven = this.calculateFlagshipBreakeven();

    // Investment summary for new structure
    const investmentSummary = this.params.capexScenario === 'private-historic' ? {
      totalCapex: INVESTMENT_PHASES.totals.totalCapex, // R$25M
      bridgeInvestment: INVESTMENT_PHASES.totals.bridgeInvestment, // R$10M (repaid Aug 2026)
      desenvolveSPLoan: INVESTMENT_PHASES.totals.desenvolveSPLoan, // R$30M
      innovationLoan: INVESTMENT_PHASES.totals.innovationLoan, // R$15M
      prefeituraSubsidy: INVESTMENT_PHASES.totals.prefeituraSubsidy, // R$6.25M (25% of R$25M)
      totalDebt: INVESTMENT_PHASES.totals.totalDebt, // R$45M (DSP + Innovation)
      architectProject: INVESTMENT_PHASES.architectProject.total, // R$1.2M
      phase1Total: INVESTMENT_PHASES.phase1.semester1.total + INVESTMENT_PHASES.phase1.semester2.total, // R$25M
      phase2Total: INVESTMENT_PHASES.phase2.total, // R$5M
      bridgeRepayment: {
        amount: INVESTMENT_PHASES.phase1.semester2.bridgeRepayment.amount,
        interestPaid: INVESTMENT_PHASES.phase1.semester2.bridgeRepayment.interestPaid,
        month: INVESTMENT_PHASES.phase1.semester2.bridgeRepayment.month,
        year: 2026
      },
      debtTerms: {
        gracePeriodMonths: 36, // 3 years grace
        repaymentYears: 5, // 5 year amortization
        interestRate: 0.12, // 12% per year
        principalStartYear: 2030, // Year 4
      }
    } : null;

    return {
      projection,
      flagshipBreakeven,
      summary: {
        year10Revenue: year10.revenue.total,
        year10Ebitda: year10.ebitda,
        year10Students: year10.students.total,
        cumulativeEbitda,
        cumulativeFcf,
        irr,
        npv,
        paybackPeriod: this.calculatePaybackPeriod(cashFlows),
        flagshipBreakEvenMonths: flagshipBreakeven.breakEvenMonth,
        capexScenario: capexScenario,
        investmentSummary
      }
    };
  }

  calculatePaybackPeriod(cashFlows) {
    let cumulative = 0;
    
    // Skip year 0 as it's pre-launch investment only
    for (let i = 0; i < cashFlows.length; i++) {
      cumulative += cashFlows[i];
      if (cumulative > 0) {
        // If payback happens in year 0 or 1, it's unrealistic due to our ramp-up
        // Minimum realistic payback is 2 years given flagship break-even timeline
        return Math.max(i, 2);
      }
    }
    return cashFlows.length;
  }

  // Sensitivity analysis
  performSensitivityAnalysis(parameter, variations = [-0.2, -0.1, 0, 0.1, 0.2]) {
    const baseParams = { ...this.params };
    const results = [];
    
    variations.forEach(variation => {
      const newValue = baseParams[parameter] * (1 + variation);
      this.updateParameters({ [parameter]: newValue });
      const summary = this.getFinancialSummary();
      results.push({
        variation: variation * 100,
        value: newValue,
        irr: summary.summary.irr,
        npv: summary.summary.npv,
        year10Revenue: summary.summary.year10Revenue,
        year10Ebitda: summary.summary.year10Ebitda
      });
    });
    
    // Restore original parameters
    this.updateParameters(baseParams);
    
    return results;
  }

  // Scenario comparison
  compareScenarios() {
    const scenarios = Object.keys(CAPEX_SCENARIOS);
    const results = {};
    
    scenarios.forEach(scenario => {
      this.updateParameters({ capexScenario: scenario });
      const summary = this.getFinancialSummary();
      results[scenario] = {
        name: CAPEX_SCENARIOS[scenario].name,
        irr: summary.summary.irr,
        npv: summary.summary.npv,
        initialCapex: CAPEX_SCENARIOS[scenario].initialCapex,
        year10Revenue: summary.summary.year10Revenue,
        paybackPeriod: summary.summary.paybackPeriod
      };
    });
    
    return results;
  }
}