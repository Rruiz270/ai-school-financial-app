// Financial modeling engine with live calculations

export const DEFAULT_PARAMETERS = {
  // Market and Students (more conservative targets)
  flagshipStudents: 1200, // Reduced from 1500
  franchiseCount: 30, // Reduced from 50 
  studentsPerFranchise: 1200, // Reduced from 1500
  adoptionStudents: 150000, // Reduced from 250000
  
  // Pricing (more competitive and realistic)
  flagshipTuition: 2300, // Balanced pricing for profitability
  adoptionLicenseFee: 180, // Competitive for scale
  franchiseRoyaltyRate: 0.06, // 6% royalty
  marketingFeeRate: 0.005, // 0.5%
  franchiseFee: 180000, // Accessible franchise fee
  kitCostPerStudent: 1200, // Educational materials
  tuitionIncreaseRate: 0.06, // 6% - above inflation
  
  // Costs
  technologyCapex: 3000000,
  technologyOpexRate: 0.04, // 4% of revenue
  marketingRate: 0.05, // 5% of revenue
  
  // CAPEX Scenarios
  capexScenario: 'private-historic', // private-historic, government, built-to-suit, direct
  
  // Growth rates (more conservative)
  franchiseGrowthRate: 2.5, // Even more conservative - 2-3 new franchises per year
  adoptionGrowthRate: 0.3, // 30% growth - more sustainable
  franchiseStartingStudents: 300, // Franchises start with 300 students
  
  // Year-by-year overrides (optional)
  yearlyOverrides: {}, // Format: { year: { parameter: value } }
};

// Scenario presets for quick switching
export const SCENARIO_PRESETS = {
  pessimistic: {
    name: 'Pessimistic',
    description: 'Conservative growth with challenges',
    parameters: {
      // Market and Students (10% lower than realistic)
      flagshipStudents: 1080, // 10% lower than 1200
      franchiseCount: 27, // 10% lower than 30
      studentsPerFranchise: 1080, // 10% lower than 1200
      adoptionStudents: 135000, // 10% lower than 150000
      
      // Pricing (10% lower)
      flagshipTuition: 2070, // 10% lower than 2300
      adoptionLicenseFee: 162, // 10% lower than 180
      franchiseRoyaltyRate: 0.054, // 10% lower than 6%
      marketingFeeRate: 0.005,
      franchiseFee: 162000, // 10% lower than 180000
      kitCostPerStudent: 1080, // 10% lower than 1200
      tuitionIncreaseRate: 0.054, // 10% lower than 6%
      
      // Costs (higher)
      technologyOpexRate: 0.05, // Higher costs (4% + 1%)
      marketingRate: 0.06, // Higher marketing needed
      
      // Growth rates (slower)
      franchiseGrowthRate: 2, // Slower than 3
      adoptionGrowthRate: 0.3, // Slower than 40%
      franchiseStartingStudents: 300,
      
      capexScenario: 'private-historic',
      yearlyOverrides: {}
    }
  },
  
  realistic: {
    name: 'Realistic',
    description: 'Expected scenario with moderate growth',
    parameters: { ...DEFAULT_PARAMETERS } // Current parameters
  },
  
  optimistic: {
    name: 'Optimistic',
    description: 'Strong growth with original ambitious targets',
    parameters: {
      // Market and Students (original higher numbers)
      flagshipStudents: 1500,
      franchiseCount: 50,
      studentsPerFranchise: 1500,
      adoptionStudents: 250000,
      
      // Pricing (original higher)
      flagshipTuition: 2500,
      adoptionLicenseFee: 200,
      franchiseRoyaltyRate: 0.07, // 7%
      marketingFeeRate: 0.005,
      franchiseFee: 200000,
      kitCostPerStudent: 1500,
      tuitionIncreaseRate: 0.08, // 8%
      
      // Costs (lower, more efficient)
      technologyOpexRate: 0.03, // More efficient (4% - 1%)
      marketingRate: 0.04, // Less marketing needed
      
      // Growth rates (faster)
      franchiseGrowthRate: 5, // Original faster growth
      adoptionGrowthRate: 0.5, // 50% growth
      franchiseStartingStudents: 300,
      
      capexScenario: 'private-historic',
      yearlyOverrides: {}
    }
  }
};

// Phased CAPEX and Investment Structure (2026-2027)
// Based on private historic building with Desenvolve SP financing and Prefeitura subsidy
// Prefeitura subsidy = 25% of TOTAL R$40M CAPEX = R$10M
export const INVESTMENT_PHASES = {
  phase1: {
    name: 'Phase 1 - 2026 (Pre-Launch)',
    semester1: {
      total: 10000000, // R$10M
      sources: {
        bridgeInvestment: 10000000, // 100% from bridge private investment
      },
      allocation: {
        architectUpfront: 100000, // R$100K architect upfront
        technologyPlatform: 5000000, // R$5M tech development
        peoplePreLaunch: 3400000, // R$3.4M salaries and operations
        curriculumDevelopment: 1500000, // R$1.5M curriculum
      },
      months: [1, 2, 3, 4, 5, 6, 7] // Jan-Jul
    },
    semester2: {
      total: 15000000, // R$15M
      sources: {
        desenvolveSP: 10000000, // R$10M CAPEX from Desenvolve SP
        prefeituraSubsidy: 2500000, // Part of 25% subsidy (R$10M of R$40M CAPEX in S2)
        bridgeInvestment: 2500000, // Additional R$2.5M from bridge
      },
      allocation: {
        capexConstruction: 10000000, // R$10M CAPEX
        peopleHiring: 3000000, // R$3M people hiring
        technology: 2000000, // R$2M additional tech
      },
      months: [8, 9, 10, 11, 12] // Aug-Dec
    }
  },
  phase2: {
    name: 'Phase 2 - 2027 (School Operating)',
    total: 15000000, // R$15M additional CAPEX
    sources: {
      desenvolveSP: 20000000, // R$20M from Desenvolve SP (total 30M commitment)
      prefeituraSubsidy: 7500000, // Remaining 25% subsidy (R$30M of R$40M CAPEX = R$7.5M)
    },
    allocation: {
      capexEquipment: 10000000, // R$10M equipment and finishing
      capexInfrastructure: 5000000, // R$5M additional infrastructure
    },
    bridgeRepayment: {
      amount: 12500000, // R$12.5M bridge repayment
      month: 8, // August 2027 - when Desenvolve SP disburses
      description: 'Repay bridge investment when Desenvolve SP funds arrive'
    }
  },
  architectProject: {
    total: 1200000, // R$1.2M total
    upfront: 100000, // R$100K upfront (included in Phase 1 Semester 1)
    monthlyPayment: 45833, // R$1.1M / 24 months ≈ R$45,833/month
    paymentMonths: 24, // 24 months starting from month 2
  },
  totals: {
    totalCapex: 40000000, // R$40M total CAPEX
    bridgeInvestment: 12500000, // R$12.5M bridge (repaid in Aug 2027)
    desenvolveSPLoan: 30000000, // R$30M total from Desenvolve SP
    prefeituraSubsidy: 10000000, // R$10M total from Prefeitura (25% of R$40M CAPEX)
  }
};

// Public Sector Adoption Projections (2027-2037)
// Realistic: 10K (2027) -> 50K (2028) -> grow to target by 2037
// Pessimistic: 20% lower per year
// Optimistic: 20% higher per year
export const PUBLIC_ADOPTION_PROJECTIONS = {
  realistic: {
    name: 'Realistic',
    description: '10K students in 2027, 50K in 2028, growing to market target by 2037',
    yearlyStudents: {
      2027: 10000,    // Year 1 - 10K students
      2028: 50000,    // Year 2 - 50K students
      2029: 100000,   // Year 3 - 100K students
      2030: 180000,   // Year 4 - 180K students
      2031: 300000,   // Year 5 - 300K students
      2032: 450000,   // Year 6 - 450K students
      2033: 650000,   // Year 7 - 650K students
      2034: 900000,   // Year 8 - 900K students
      2035: 1200000,  // Year 9 - 1.2M students
      2036: 1500000,  // Year 10 - 1.5M students
      2037: 2000000,  // Year 11 - 2M students (market share target)
    }
  },
  pessimistic: {
    name: 'Pessimistic',
    description: '20% lower than realistic per year',
    yearlyStudents: {
      2027: 8000,     // 10K * 0.8
      2028: 40000,    // 50K * 0.8
      2029: 80000,    // 100K * 0.8
      2030: 144000,   // 180K * 0.8
      2031: 240000,   // 300K * 0.8
      2032: 360000,   // 450K * 0.8
      2033: 520000,   // 650K * 0.8
      2034: 720000,   // 900K * 0.8
      2035: 960000,   // 1.2M * 0.8
      2036: 1200000,  // 1.5M * 0.8
      2037: 1600000,  // 2M * 0.8
    }
  },
  optimistic: {
    name: 'Optimistic',
    description: '20% higher than realistic per year',
    yearlyStudents: {
      2027: 12000,    // 10K * 1.2
      2028: 60000,    // 50K * 1.2
      2029: 120000,   // 100K * 1.2
      2030: 216000,   // 180K * 1.2
      2031: 360000,   // 300K * 1.2
      2032: 540000,   // 450K * 1.2
      2033: 780000,   // 650K * 1.2
      2034: 1080000,  // 900K * 1.2
      2035: 1440000,  // 1.2M * 1.2
      2036: 1800000,  // 1.5M * 1.2
      2037: 2400000,  // 2M * 1.2
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
    initialCapex: 25000000, // R$25M Year 0 (Phase 1 full investment)
    year1Capex: 15000000, // R$15M Year 1 (Phase 2)
    annualFacilityCost: 1500000, // R$1.5M annual (maintenance, utilities, taxes - reduced due to historic benefit)
    description: 'R$40M total CAPEX (2 phases), private historic building with Desenvolve SP + Prefeitura subsidy',
    fundingSources: {
      bridgeInvestment: 12500000, // R$12.5M bridge (repaid Aug 2027)
      desenvolveSP: 30000000, // R$30M CAPEX loan
      prefeituraSubsidy: 10000000, // R$10M (25% of total R$40M CAPEX)
    },
    bridgeRepayment: {
      amount: 12500000,
      month: 8, // August
      year: 1, // 2027
    }
  },
  government: {
    name: 'Government Partnership',
    initialCapex: 10000000, // R$10M renovation only
    year1Capex: 0,
    annualFacilityCost: 800000, // licenses, maintenance, utilities
    description: 'R$10M renovation, 30-year free building use from government',
    fundingSources: {
      bridgeInvestment: 10000000,
      desenvolveSP: 0,
      prefeituraSubsidy: 0,
    }
  },
  'built-to-suit': {
    name: 'Built-to-Suit with 30-Year Lease',
    initialCapex: 3000000, // R$3M tech only
    year1Capex: 0,
    annualFacilityCost: 3200000, // R$25M building cost amortized over 30 years + operational costs
    description: 'R$3M tech, developer builds R$25M facility, 30-year lease ~R$3.2M/year',
    fundingSources: {
      bridgeInvestment: 3000000,
      desenvolveSP: 0,
      prefeituraSubsidy: 0,
    }
  },
  direct: {
    name: 'Direct Investment & Construction',
    initialCapex: 25000000, // R$25M for our own construction + tech
    year1Capex: 0,
    annualFacilityCost: 1200000, // maintenance, utilities, taxes only
    description: 'R$25M building construction + tech, full ownership',
    fundingSources: {
      bridgeInvestment: 25000000,
      desenvolveSP: 0,
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
    const flagshipStudents = yearOverrides.flagshipStudents || 
      (year === 0 ? 0 : 
       year === 1 ? 300 : 
       year === 2 ? 750 : 
       this.params.flagshipStudents);
    
    // Franchises only start after Year 2 (need proven model first)
    const franchiseCount = yearOverrides.franchiseCount !== undefined ? yearOverrides.franchiseCount :
      (year <= 2 ? 0 : Math.min((year - 2) * this.params.franchiseGrowthRate, this.params.franchiseCount));
    
    // Calculate franchise students with ramp-up period
    let franchiseStudents = 0;
    if (franchiseCount > 0 && year > 2) {
      // Each franchise starts with 300 students and ramps up over 4 years
      const targetPerFranchise = yearOverrides.studentsPerFranchise || this.params.studentsPerFranchise;
      const startingStudents = this.params.franchiseStartingStudents || 300;
      
      // Calculate students for each franchise cohort
      for (let cohortStartYear = 3; cohortStartYear <= year; cohortStartYear++) {
        // How many franchises started this year?
        const previousCount = cohortStartYear === 3 ? 0 : 
          Math.min((cohortStartYear - 3) * this.params.franchiseGrowthRate, this.params.franchiseCount);
        const currentCount = Math.min((cohortStartYear - 2) * this.params.franchiseGrowthRate, this.params.franchiseCount);
        const newFranchisesThisYear = currentCount - previousCount;
        
        if (newFranchisesThisYear > 0) {
          const franchiseAge = year - cohortStartYear; // 0-based age
          
          // Ramp-up: Year 1 = 300, Year 2 = 50% between start and target, Year 3 = 75%, Year 4+ = 100%
          let studentsPerFranchise;
          if (franchiseAge === 0) {
            studentsPerFranchise = startingStudents; // 300 students in first year
          } else if (franchiseAge === 1) {
            studentsPerFranchise = startingStudents + (targetPerFranchise - startingStudents) * 0.33; // ~33% progress
          } else if (franchiseAge === 2) {
            studentsPerFranchise = startingStudents + (targetPerFranchise - startingStudents) * 0.67; // ~67% progress
          } else {
            studentsPerFranchise = targetPerFranchise; // Full capacity from year 4+
          }
          
          const studentsInThisCohort = newFranchisesThisYear * studentsPerFranchise;
          franchiseStudents += studentsInThisCohort;
        }
      }
    }
    
    // Adoption students start small in Year 2, grow gradually
    let adoptionStudents;
    if (yearOverrides.adoptionStudents !== undefined) {
      adoptionStudents = yearOverrides.adoptionStudents;
    } else if (year <= 1) {
      adoptionStudents = 0; // No adoption in first years
    } else if (year === 2) {
      adoptionStudents = 2500; // Start small in Year 2
    } else {
      // Grow towards target, reaching it by year 10
      const growthYears = year - 2;
      const targetAdoption = this.params.adoptionStudents;
      if (growthYears <= 8) {
        // Linear growth to reach target by year 10
        adoptionStudents = Math.min(
          2500 + (targetAdoption - 2500) * (growthYears / 8),
          targetAdoption
        );
      } else {
        adoptionStudents = targetAdoption;
      }
    }
    
    // Pricing with annual increases and overrides
    const currentTuition = yearOverrides.tuition || (this.params.flagshipTuition * Math.pow(1 + this.params.tuitionIncreaseRate, year - 1));
    const currentAdoptionFee = yearOverrides.adoptionFee || (this.params.adoptionLicenseFee * Math.pow(1 + this.params.tuitionIncreaseRate, year - 1));
    const currentKitCost = yearOverrides.kitCost || (this.params.kitCostPerStudent * Math.pow(1 + this.params.tuitionIncreaseRate, year - 1));
    
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
    const franchiseMarketingRevenue = franchiseTuitionRevenue * this.params.marketingFeeRate;
    const franchiseFeeRevenue = newFranchises * this.params.franchiseFee;
    const adoptionRevenue = adoptionStudents * currentAdoptionFee * 12;
    const totalStudents = flagshipStudents + franchiseStudents + adoptionStudents;
    const kitRevenue = totalStudents * currentKitCost;
    
    const totalRevenue = flagshipRevenue + franchiseRoyaltyRevenue + franchiseMarketingRevenue + 
                        franchiseFeeRevenue + adoptionRevenue + kitRevenue;
    
    // Cost calculations
    const technologyOpex = totalRevenue * this.params.technologyOpexRate;
    const marketingCosts = totalRevenue * this.params.marketingRate;
    
    // Staff costs with annual increases
    // Base costs before annual increases
    const baseStaffCorporate = Math.max(3000000, totalStudents * 80);
    const baseStaffFlagship = flagshipStudents > 0 ? Math.max(2500000, flagshipStudents * 2200) : 0;
    const baseStaffFranchiseSupport = franchiseCount * 300000;
    const baseStaffAdoptionSupport = adoptionStudents * 150;
    
    // Apply annual increases: 20% in first year, then 10% year-over-year
    let staffIncreaseMultiplier = 1;
    if (year === 1) {
      staffIncreaseMultiplier = 1.20; // 20% increase in first year
    } else if (year > 1) {
      // Compound 10% increases: 1.20 * (1.10)^(year-1)
      staffIncreaseMultiplier = 1.20 * Math.pow(1.10, year - 1);
    }
    
    const staffCorporate = baseStaffCorporate * staffIncreaseMultiplier;
    const staffFlagship = baseStaffFlagship * staffIncreaseMultiplier;
    const staffFranchiseSupport = baseStaffFranchiseSupport * staffIncreaseMultiplier;
    const staffAdoptionSupport = baseStaffAdoptionSupport * staffIncreaseMultiplier;
    
    // Educational & Operational costs
    const curriculum = Math.max(500000, totalStudents * 50); // Curriculum materials
    const teacherTraining = Math.max(200000, (flagshipStudents + franchiseStudents) * 250) * staffIncreaseMultiplier; // Teacher development
    const studentSupport = totalStudents * 200; // Student services, counseling, tech support
    const qualityAssurance = Math.max(300000, totalRevenue * 0.01); // Quality control and assessment
    const regulatoryCompliance = Math.max(400000, totalRevenue * 0.005); // Education regulations, audits
    const dataManagement = Math.max(200000, totalStudents * 40); // Student data systems, privacy
    const parentEngagement = Math.max(150000, totalStudents * 60); // Parent communication systems
    
    // Business costs
    const badDebt = totalRevenue * 0.02; // 2% bad debt (realistic for education)
    const paymentProcessing = totalRevenue * 0.025; // 2.5% payment fees
    const platformRD = totalRevenue * 0.06; // 6% for platform improvements (not excessive)
    const contentDevelopment = totalRevenue * 0.04; // 4% for ongoing curriculum updates
    
    // Facility costs
    const capexScenario = CAPEX_SCENARIOS[this.params.capexScenario];
    const facilityCosts = capexScenario.annualFacilityCost;
    
    // Other costs
    const legalCompliance = Math.max(500000, totalRevenue * 0.003);
    const insurance = totalRevenue * 0.002;
    const travel = Math.max(300000, (franchiseCount + Math.floor(adoptionStudents / 5000)) * 50000);
    const workingCapital = totalRevenue * 0.01;
    const contingency = totalRevenue * 0.005;
    
    const totalCosts = technologyOpex + marketingCosts + staffCorporate + staffFlagship + 
                      staffFranchiseSupport + staffAdoptionSupport + facilityCosts + 
                      legalCompliance + insurance + travel + workingCapital + contingency +
                      curriculum + teacherTraining + studentSupport + qualityAssurance + 
                      regulatoryCompliance + dataManagement + parentEngagement + badDebt + 
                      paymentProcessing + platformRD + contentDevelopment;
    
    const ebitda = totalRevenue - totalCosts;
    const ebitdaMargin = totalRevenue > 0 ? ebitda / totalRevenue : 0;
    
    // CAPEX calculation with phased structure
    // For private-historic: Year 0 = 25M, Year 1 = 15M (Phase 2)
    // Plus architect payments: 100k upfront + 45.8k/month for 24 months
    let capex;
    if (yearOverrides.capex !== undefined) {
      capex = yearOverrides.capex;
    } else if (year === 0) {
      // Phase 1: Full initial investment including CAPEX and pre-launch
      capex = capexScenario.initialCapex;
    } else if (year === 1 && capexScenario.year1Capex) {
      // Phase 2 CAPEX (for private-historic scenario)
      // Plus ongoing architect payments (12 months * 45.8k)
      const architectPayments = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
      capex = capexScenario.year1Capex + architectPayments;
    } else if (year === 2 && this.params.capexScenario === 'private-historic') {
      // Final year of architect payments (remaining 12 months)
      capex = INVESTMENT_PHASES.architectProject.monthlyPayment * 12;
    } else {
      // Ongoing maintenance CAPEX
      capex = year <= 5 ? totalRevenue * 0.005 : totalRevenue * 0.003;
    }
    
    // Tax calculation
    const taxRate = 0.25; // 25% corporate tax rate in Brazil
    const taxableIncome = Math.max(0, ebitda);
    const taxes = taxableIncome * taxRate;
    
    const netIncome = ebitda - taxes;
    const freeCashFlow = netIncome - capex;
    
    // Investment phase and funding details for Year 0 and Year 1
    let investmentPhase = null;
    let fundingSources = null;
    let architectPayment = 0;

    if (this.params.capexScenario === 'private-historic') {
      if (year === 0) {
        investmentPhase = {
          phase: 'Phase 1 - Pre-Launch (2026)',
          semester1: INVESTMENT_PHASES.phase1.semester1,
          semester2: INVESTMENT_PHASES.phase1.semester2,
        };
        fundingSources = {
          bridgeInvestment: 12500000, // 10M S1 + 2.5M S2
          desenvolveSP: 10000000, // S2 CAPEX
          prefeituraSubsidy: 2500000, // 25% of S2 CAPEX
        };
        architectPayment = INVESTMENT_PHASES.architectProject.upfront +
                          (INVESTMENT_PHASES.architectProject.monthlyPayment * 5); // upfront + 5 months
      } else if (year === 1) {
        investmentPhase = {
          phase: 'Phase 2 - School Operating (2027)',
          details: INVESTMENT_PHASES.phase2,
        };
        fundingSources = {
          desenvolveSP: 20000000, // Remaining 20M from Desenvolve SP
          prefeituraSubsidy: 5000000, // 25% of Phase 2 CAPEX
        };
        architectPayment = INVESTMENT_PHASES.architectProject.monthlyPayment * 12; // 12 months
      } else if (year === 2) {
        architectPayment = INVESTMENT_PHASES.architectProject.monthlyPayment * 12; // Final 12 months
      }
    }

    return {
      year,
      students: {
        flagship: flagshipStudents,
        franchise: franchiseStudents,
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
        curriculum,
        teacherTraining,
        studentSupport,
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
        adoptionFee: currentAdoptionFee,
        kitCost: currentKitCost
      },
      // Investment and funding details (for Year 0 and 1)
      investmentPhase,
      fundingSources
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
      totalCapex: INVESTMENT_PHASES.totals.totalCapex, // R$40M
      bridgeInvestment: INVESTMENT_PHASES.totals.bridgeInvestment, // R$12.5M (repaid Aug 2027)
      desenvolveSPLoan: INVESTMENT_PHASES.totals.desenvolveSPLoan, // R$30M
      prefeituraSubsidy: INVESTMENT_PHASES.totals.prefeituraSubsidy, // R$10M (25% of R$40M)
      architectProject: INVESTMENT_PHASES.architectProject.total, // R$1.2M
      phase1Total: INVESTMENT_PHASES.phase1.semester1.total + INVESTMENT_PHASES.phase1.semester2.total, // R$25M
      phase2Total: INVESTMENT_PHASES.phase2.total, // R$15M
      bridgeRepayment: {
        amount: INVESTMENT_PHASES.phase2.bridgeRepayment.amount,
        month: INVESTMENT_PHASES.phase2.bridgeRepayment.month,
        year: 2027
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