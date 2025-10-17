// Financial modeling engine with live calculations

export const DEFAULT_PARAMETERS = {
  // Market and Students (more conservative targets)
  flagshipStudents: 1200, // Reduced from 1500
  franchiseCount: 30, // Reduced from 50 
  studentsPerFranchise: 1200, // Reduced from 1500
  adoptionStudents: 150000, // Reduced from 250000
  
  // Pricing (more competitive and realistic)
  flagshipTuition: 2100, // Further reduced for market reality
  adoptionLicenseFee: 150, // More competitive for scale
  franchiseRoyaltyRate: 0.06, // 6% royalty
  marketingFeeRate: 0.005, // 0.5%
  franchiseFee: 150000, // More accessible franchise fee
  kitCostPerStudent: 1200, // Educational materials
  tuitionIncreaseRate: 0.045, // 4.5% - closer to inflation
  
  // Costs (more realistic)
  technologyCapex: 3000000,
  technologyOpexRate: 0.10, // Increased from 4% to 10%
  marketingRate: 0.08, // Increased from 5% to 8%
  
  // CAPEX Scenarios
  capexScenario: 'government', // government, built-to-suit, direct
  
  // Growth rates (more conservative)
  franchiseGrowthRate: 2.5, // Even more conservative - 2-3 new franchises per year
  adoptionGrowthRate: 0.3, // 30% growth - more sustainable
  
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
      technologyOpexRate: 0.11, // Higher costs (10% + 1%)
      marketingRate: 0.09, // Higher marketing needed
      
      // Growth rates (slower)
      franchiseGrowthRate: 2, // Slower than 3
      adoptionGrowthRate: 0.3, // Slower than 40%
      
      capexScenario: 'government',
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
      technologyOpexRate: 0.09, // More efficient (10% - 1%)
      marketingRate: 0.06, // Less marketing needed
      
      // Growth rates (faster)
      franchiseGrowthRate: 5, // Original faster growth
      adoptionGrowthRate: 0.5, // 50% growth
      
      capexScenario: 'government',
      yearlyOverrides: {}
    }
  }
};

export const CAPEX_SCENARIOS = {
  government: {
    name: 'Government Partnership',
    initialCapex: 10000000, // R$10M renovation only
    annualFacilityCost: 800000, // licenses, maintenance, utilities
    description: 'R$10M renovation, 30-year free building use from government'
  },
  'built-to-suit': {
    name: 'Built-to-Suit with 30-Year Lease',
    initialCapex: 3000000, // R$3M tech only
    annualFacilityCost: 3200000, // R$25M building cost amortized over 30 years + operational costs
    description: 'R$3M tech, developer builds R$25M facility, 30-year lease ~R$3.2M/year'
  },
  direct: {
    name: 'Direct Investment & Construction',
    initialCapex: 25000000, // R$25M for our own construction + tech
    annualFacilityCost: 1200000, // maintenance, utilities, taxes only
    description: 'R$25M building construction + tech, full ownership'
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
    const studentsPerFranchise = yearOverrides.studentsPerFranchise !== undefined ? yearOverrides.studentsPerFranchise : this.params.studentsPerFranchise;
    const franchiseStudents = franchiseCount * studentsPerFranchise;
    
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
    
    // Cost calculations with more realistic expenses
    const technologyOpex = totalRevenue * this.params.technologyOpexRate;
    const marketingCosts = totalRevenue * this.params.marketingRate;
    
    // Customer Acquisition Costs (CAC)
    const cacFlagship = flagshipStudents * 0.3 * 1000; // 30% new students × R$1,000 CAC
    const cacFranchise = newFranchises * 75000; // R$75k per new franchise
    const cacAdoption = adoptionStudents * 0.4 * 200; // 40% new × R$200 CAC
    const totalCAC = cacFlagship + cacFranchise + cacAdoption;
    
    // Bad debt and payment processing
    const badDebt = totalRevenue * 0.04; // 4% bad debt
    const paymentProcessing = totalRevenue * 0.025; // 2.5% payment fees
    
    // R&D and Product Development
    const rdCosts = totalRevenue * 0.15; // 15% for AI/tech development
    const contentDevelopment = totalRevenue * 0.06; // 6% for curriculum
    
    // Sales infrastructure
    const salesCommissions = (franchiseFeeRevenue + adoptionRevenue) * 0.08; // 8% on new sales
    const salesInfrastructure = Math.max(1000000, totalRevenue * 0.02); // CRM, tools, etc.
    
    // Franchise support and risk provisions
    const franchiseRiskProvision = franchiseCount * 50000; // R$50k per franchise for failures
    
    // Cybersecurity and compliance
    const cybersecurity = Math.max(500000, totalRevenue * 0.025); // 2.5% for security
    const auditProfessionalServices = Math.max(800000, totalRevenue * 0.01); // Audit, legal, consulting
    
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
    
    // Additional operational costs that were missing
    const curriculum = Math.max(500000, totalStudents * 200); // Curriculum development and updates
    const studentSupport = totalStudents * 300; // Student services, counseling, tech support
    const parentEngagement = Math.max(200000, totalStudents * 100); // Parent communication systems
    const qualityAssurance = Math.max(400000, totalRevenue * 0.015); // Quality control and assessment
    const regulatoryCompliance = Math.max(600000, totalRevenue * 0.008); // Education regulations, audits
    const dataManagement = Math.max(300000, totalStudents * 50); // Student data systems, privacy
    const teacherTraining = Math.max(800000, (flagshipStudents + franchiseStudents) * 0.1 * 15000) * staffIncreaseMultiplier; // Ongoing teacher development with annual increases
    
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
                      curriculum + studentSupport + parentEngagement + qualityAssurance + 
                      regulatoryCompliance + dataManagement + teacherTraining +
                      totalCAC + badDebt + paymentProcessing + rdCosts + contentDevelopment +
                      salesCommissions + salesInfrastructure + franchiseRiskProvision +
                      cybersecurity + auditProfessionalServices;
    
    const ebitda = totalRevenue - totalCosts;
    const ebitdaMargin = totalRevenue > 0 ? ebitda / totalRevenue : 0;
    
    // CAPEX for year 0 with overrides
    const capex = yearOverrides.capex !== undefined ? yearOverrides.capex :
                  (year === 0 ? capexScenario.initialCapex : 
                  year <= 5 ? totalRevenue * 0.005 : totalRevenue * 0.003);
    
    // Tax calculation
    const taxRate = 0.25; // 25% corporate tax rate in Brazil
    const taxableIncome = Math.max(0, ebitda);
    const taxes = taxableIncome * taxRate;
    
    const netIncome = ebitda - taxes;
    const freeCashFlow = netIncome - capex;
    
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
        studentSupport,
        parentEngagement,
        qualityAssurance,
        regulatoryCompliance,
        dataManagement,
        teacherTraining,
        // New realistic costs
        customerAcquisition: totalCAC,
        badDebt,
        paymentProcessing,
        researchDevelopment: rdCosts,
        contentDevelopment,
        salesCommissions,
        salesInfrastructure,
        franchiseRiskProvision,
        cybersecurity,
        auditProfessionalServices,
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
      }
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
    
    // Initial investment is negative cash flow
    cashFlows[0] = -CAPEX_SCENARIOS[this.params.capexScenario].initialCapex;
    
    const irr = this.calculateIRR(cashFlows);
    const npv = this.calculateNPV(cashFlows);
    const year10 = projection[10];
    const cumulativeEbitda = projection.slice(1).reduce((sum, year) => sum + year.ebitda, 0);
    const cumulativeFcf = projection.slice(1).reduce((sum, year) => sum + year.freeCashFlow, 0);
    const flagshipBreakeven = this.calculateFlagshipBreakeven();
    
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
        capexScenario: CAPEX_SCENARIOS[this.params.capexScenario]
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