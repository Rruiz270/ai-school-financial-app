import React, { useState, useMemo } from 'react';
import { X, Users, Building, Laptop, Megaphone, BookOpen, CreditCard, Shield, Plane, PiggyBank, HardHat, Landmark, Edit2, Save, Plus, Trash2, Calendar, ArrowRight } from 'lucide-react';

// Detailed breakdown definitions for each expense type
const EXPENSE_BREAKDOWNS = {
  // STAFF - CORPORATE
  // Formula: Max(R$3M/year, students × R$80) × inflation
  // Monthly minimum: R$3M / 12 = R$250K/month
  'staff.corporate': {
    icon: Users,
    color: 'blue',
    title: 'Corporate Staff Breakdown',
    getItems: (monthValue, yearIndex) => {
      const inflationMultiplier = Math.pow(1.05, Math.max(0, yearIndex - 1));
      // Reduced salaries to fit within R$3M/year = R$250K/month budget
      const baseItems = [
        { role: 'CEO', quantity: 1, monthlySalary: 45000, department: 'Executive', type: 'Leadership' },
        { role: 'CFO', quantity: 1, monthlySalary: 35000, department: 'Executive', type: 'Leadership' },
        { role: 'COO', quantity: 1, monthlySalary: 32000, department: 'Executive', type: 'Leadership' },
        { role: 'CTO', quantity: 1, monthlySalary: 30000, department: 'Technology', type: 'Leadership' },
        { role: 'CMO', quantity: 1, monthlySalary: 28000, department: 'Marketing', type: 'Leadership' },
        { role: 'HR Director', quantity: 1, monthlySalary: 18000, department: 'Human Resources', type: 'Management' },
        { role: 'Legal Counsel', quantity: 1, monthlySalary: 20000, department: 'Legal', type: 'Professional' },
        { role: 'Finance Manager', quantity: 2, monthlySalary: 10000, department: 'Finance', type: 'Management' },
        { role: 'HR Analyst', quantity: 1, monthlySalary: 6000, department: 'Human Resources', type: 'Analyst' },
        { role: 'Administrative Assistant', quantity: 2, monthlySalary: 4000, department: 'Admin', type: 'Support' },
        { role: 'IT Support', quantity: 1, monthlySalary: 6000, department: 'Technology', type: 'Support' },
        { role: 'Receptionist', quantity: 1, monthlySalary: 3000, department: 'Admin', type: 'Support' },
      ];
      // Total: 45+35+32+30+28+18+20+20+6+8+6+3 = R$251K/month (close to R$250K formula)

      const items = baseItems.map(item => ({
        ...item,
        monthlySalary: Math.round(item.monthlySalary * inflationMultiplier),
        total: Math.round(item.quantity * item.monthlySalary * inflationMultiplier),
      }));

      // Calculate actual salaries total
      const actualSalariesTotal = items.reduce((sum, item) => sum + item.total, 0);

      // Adjust to match monthValue exactly
      if (monthValue > 0 && Math.abs(monthValue - actualSalariesTotal) > 100) {
        const adjustment = monthValue - actualSalariesTotal;
        if (adjustment > 0) {
          items.push({
            role: 'Corporate Reserve & Benefits',
            quantity: 1,
            monthlySalary: adjustment,
            department: 'Administration',
            type: 'Reserve',
            total: adjustment,
            isOverhead: true,
          });
        } else {
          // Scale down salaries proportionally
          const scaleFactor = monthValue / actualSalariesTotal;
          items.forEach(item => {
            item.monthlySalary = Math.round(item.monthlySalary * scaleFactor);
            item.total = Math.round(item.quantity * item.monthlySalary);
          });
        }
      }

      return items;
    },
  },

  // STAFF - FLAGSHIP (Teachers + Admin)
  // Formula: Max(R$5M/year, flagshipStudents × R$4,400) × inflation
  // Monthly minimum: R$5M / 12 = ~R$416.7K/month
  'staff.flagship': {
    icon: Users,
    color: 'blue',
    title: 'Flagship School Staff Breakdown',
    getItems: (monthValue, yearIndex) => {
      const inflationMultiplier = Math.pow(1.05, Math.max(0, yearIndex - 1));
      // Scaled staffing to fit within R$5M/year = ~R$417K/month budget
      const baseItems = [
        { role: 'School Director', quantity: 1, monthlySalary: 25000, department: 'Administration', type: 'Leadership' },
        { role: 'Academic Coordinator', quantity: 2, monthlySalary: 15000, department: 'Academic', type: 'Management' },
        { role: 'AI/Tech Lead Teacher', quantity: 2, monthlySalary: 12000, department: 'Teaching - STEM', type: 'Teacher' },
        { role: 'Math Teacher', quantity: 4, monthlySalary: 8000, department: 'Teaching - STEM', type: 'Teacher' },
        { role: 'Science Teacher', quantity: 4, monthlySalary: 8000, department: 'Teaching - STEM', type: 'Teacher' },
        { role: 'Portuguese Teacher', quantity: 3, monthlySalary: 7500, department: 'Teaching - Languages', type: 'Teacher' },
        { role: 'English Teacher', quantity: 3, monthlySalary: 8500, department: 'Teaching - Languages', type: 'Teacher' },
        { role: 'History/Geography Teacher', quantity: 2, monthlySalary: 7000, department: 'Teaching - Humanities', type: 'Teacher' },
        { role: 'Arts/Music Teacher', quantity: 2, monthlySalary: 6500, department: 'Teaching - Arts', type: 'Teacher' },
        { role: 'Physical Education Teacher', quantity: 2, monthlySalary: 6000, department: 'Teaching - PE', type: 'Teacher' },
        { role: 'Teaching Assistant', quantity: 6, monthlySalary: 3500, department: 'Teaching Support', type: 'Support' },
        { role: 'School Psychologist', quantity: 1, monthlySalary: 8000, department: 'Student Services', type: 'Professional' },
        { role: 'Librarian', quantity: 1, monthlySalary: 4500, department: 'Academic Support', type: 'Support' },
        { role: 'Lab Technician', quantity: 1, monthlySalary: 4000, department: 'STEM Support', type: 'Support' },
        { role: 'Administrative Staff', quantity: 3, monthlySalary: 3500, department: 'Administration', type: 'Support' },
        { role: 'Security', quantity: 2, monthlySalary: 2500, department: 'Operations', type: 'Support' },
        { role: 'Cleaning Staff', quantity: 4, monthlySalary: 2200, department: 'Operations', type: 'Support' },
        { role: 'Cafeteria Staff', quantity: 3, monthlySalary: 2500, department: 'Operations', type: 'Support' },
      ];
      // Approximate total: 25+30+24+32+32+22.5+25.5+14+13+12+21+8+4.5+4+10.5+5+8.8+7.5 = ~R$319K
      // Plus reserve to reach ~R$417K

      const items = baseItems.map(item => ({
        ...item,
        monthlySalary: Math.round(item.monthlySalary * inflationMultiplier),
        total: Math.round(item.quantity * item.monthlySalary * inflationMultiplier),
      }));

      // Calculate actual salaries total
      const actualSalariesTotal = items.reduce((sum, item) => sum + item.total, 0);

      // Adjust to match monthValue exactly
      if (monthValue > 0 && Math.abs(monthValue - actualSalariesTotal) > 100) {
        const adjustment = monthValue - actualSalariesTotal;
        if (adjustment > 0) {
          items.push({
            role: 'School Reserve & Benefits',
            quantity: 1,
            monthlySalary: adjustment,
            department: 'Administration',
            type: 'Reserve',
            total: adjustment,
            isOverhead: true,
          });
        } else {
          // Scale down salaries proportionally
          const scaleFactor = monthValue / actualSalariesTotal;
          items.forEach(item => {
            item.monthlySalary = Math.round(item.monthlySalary * scaleFactor);
            item.total = Math.round(item.quantity * item.monthlySalary);
          });
        }
      }

      return items;
    },
  },

  // STAFF - FRANCHISE SUPPORT
  // Formula: franchiseCount × R$300K/year × inflation
  // Monthly: franchiseCount × R$25K/month × inflation
  'staff.franchiseSupport': {
    icon: Users,
    color: 'blue',
    title: 'Franchise Support Staff Breakdown',
    getItems: (monthValue, yearIndex) => {
      const inflationMultiplier = Math.pow(1.05, Math.max(0, yearIndex - 1));
      const franchiseCount = yearIndex <= 2 ? 0 : Math.min((yearIndex - 2) * 3, 24);

      if (monthValue === 0 || (franchiseCount === 0 && monthValue === 0)) {
        return [];
      }

      // Scale team size based on franchise count
      const baseItems = [
        { role: 'Franchise Director', quantity: 1, monthlySalary: 18000, department: 'Franchise Ops', type: 'Leadership' },
        { role: 'Regional Manager', quantity: Math.max(1, Math.ceil(franchiseCount / 8)), monthlySalary: 12000, department: 'Franchise Ops', type: 'Management' },
        { role: 'Training Coordinator', quantity: Math.max(1, Math.ceil(franchiseCount / 10)), monthlySalary: 8000, department: 'Training', type: 'Specialist' },
        { role: 'Quality Auditor', quantity: Math.max(1, Math.ceil(franchiseCount / 12)), monthlySalary: 7000, department: 'Quality', type: 'Specialist' },
        { role: 'Franchise Support Analyst', quantity: Math.max(1, Math.ceil(franchiseCount / 6)), monthlySalary: 5000, department: 'Support', type: 'Analyst' },
        { role: 'Implementation Specialist', quantity: Math.max(1, Math.ceil(franchiseCount / 10)), monthlySalary: 6000, department: 'Implementation', type: 'Specialist' },
      ];

      const items = baseItems.map(item => ({
        ...item,
        monthlySalary: Math.round(item.monthlySalary * inflationMultiplier),
        total: Math.round(item.quantity * item.monthlySalary * inflationMultiplier),
      }));

      // Calculate actual salaries total
      const actualSalariesTotal = items.reduce((sum, item) => sum + item.total, 0);

      // Adjust to match monthValue exactly
      if (monthValue > 0 && Math.abs(monthValue - actualSalariesTotal) > 100) {
        const adjustment = monthValue - actualSalariesTotal;
        if (adjustment > 0) {
          items.push({
            role: 'Franchise Reserve & Benefits',
            quantity: 1,
            monthlySalary: adjustment,
            department: 'Administration',
            type: 'Reserve',
            total: adjustment,
            isOverhead: true,
          });
        } else {
          // Scale down salaries proportionally
          const scaleFactor = monthValue / actualSalariesTotal;
          items.forEach(item => {
            item.monthlySalary = Math.round(item.monthlySalary * scaleFactor);
            item.total = Math.round(item.quantity * item.monthlySalary);
          });
        }
      }

      return items;
    },
  },

  // STAFF - ADOPTION SUPPORT
  // Formula: (adoptionSchools ÷ 20) × R$10K/mo × 12 × inflation
  // This means 1 support person per 20 schools at R$10K/month
  'staff.adoptionSupport': {
    icon: Users,
    color: 'blue',
    title: 'Adoption Support Staff Breakdown',
    getItems: (monthValue, yearIndex) => {
      const inflationMultiplier = Math.pow(1.05, Math.max(0, yearIndex - 1));
      // Calculate adoption schools from students
      const adoptionStudents = yearIndex <= 1 ? 0 : yearIndex === 2 ? 2500 : 2500 + (150000 - 2500) * ((yearIndex - 2) / 8);
      const adoptionSchools = Math.ceil(adoptionStudents / 500);
      const supportStaff = Math.ceil(adoptionSchools / 20);

      if (monthValue === 0) return [];

      // Scale team based on support staff count
      const baseItems = [
        { role: 'Adoption Director', quantity: 1, monthlySalary: 15000, department: 'Adoption Ops', type: 'Leadership' },
        { role: 'Account Manager', quantity: Math.max(1, Math.ceil(supportStaff * 0.35)), monthlySalary: 8000, department: 'Account Management', type: 'Management' },
        { role: 'Implementation Specialist', quantity: Math.max(1, Math.ceil(supportStaff * 0.25)), monthlySalary: 7000, department: 'Implementation', type: 'Specialist' },
        { role: 'Technical Support', quantity: Math.max(1, Math.ceil(supportStaff * 0.25)), monthlySalary: 6000, department: 'Support', type: 'Support' },
        { role: 'Training Specialist', quantity: Math.max(1, Math.ceil(supportStaff * 0.15)), monthlySalary: 6500, department: 'Training', type: 'Specialist' },
      ];

      const items = baseItems.map(item => ({
        ...item,
        monthlySalary: Math.round(item.monthlySalary * inflationMultiplier),
        total: Math.round(item.quantity * item.monthlySalary * inflationMultiplier),
      }));

      // Calculate actual salaries total
      const actualSalariesTotal = items.reduce((sum, item) => sum + item.total, 0);

      // Adjust to match monthValue exactly
      if (monthValue > 0 && Math.abs(monthValue - actualSalariesTotal) > 100) {
        const adjustment = monthValue - actualSalariesTotal;
        if (adjustment > 0) {
          items.push({
            role: 'Adoption Reserve & Benefits',
            quantity: 1,
            monthlySalary: adjustment,
            department: 'Administration',
            type: 'Reserve',
            total: adjustment,
            isOverhead: true,
          });
        } else {
          // Scale down salaries proportionally
          const scaleFactor = monthValue / actualSalariesTotal;
          items.forEach(item => {
            item.monthlySalary = Math.round(item.monthlySalary * scaleFactor);
            item.total = Math.round(item.quantity * item.monthlySalary);
          });
        }
      }

      return items;
    },
  },

  // TECHNOLOGY
  // Y0: R$2M from Bridge loan (Feb-Jul = 6 months, ~R$333k/month)
  // Y1+: Revenue × 4%
  'operational.technology': {
    icon: Laptop,
    color: 'green',
    title: 'Technology Costs Breakdown',
    getItems: (monthValue, yearIndex, monthIndex) => {
      // Y0 special case: Bridge loan funds tech Feb-Jul
      if (yearIndex === 0) {
        const isBridgePeriod = monthIndex >= 1 && monthIndex <= 6; // Feb-Jul (1-6)
        const monthlyBudget = isBridgePeriod ? (2000000 / 6) : 0; // R$2M / 6 months = ~R$333K

        if (!isBridgePeriod) {
          return [
            { item: 'No Technology Spending', category: 'N/A', percentage: 0, amount: 0, note: 'Bridge tech funding covers Feb-Jul only' },
          ];
        }

        return [
          { item: 'Cloud Infrastructure (AWS/GCP)', category: 'Infrastructure', percentage: 25, amount: monthlyBudget * 0.25 },
          { item: 'AI/ML Services (OpenAI, etc)', category: 'AI Services', percentage: 20, amount: monthlyBudget * 0.20 },
          { item: 'Learning Management System', category: 'Platform', percentage: 15, amount: monthlyBudget * 0.15 },
          { item: 'Database Services', category: 'Infrastructure', percentage: 10, amount: monthlyBudget * 0.10 },
          { item: 'CDN & Media Streaming', category: 'Infrastructure', percentage: 8, amount: monthlyBudget * 0.08 },
          { item: 'Security & Monitoring', category: 'Security', percentage: 7, amount: monthlyBudget * 0.07 },
          { item: 'Software Licenses (Office, etc)', category: 'Licenses', percentage: 5, amount: monthlyBudget * 0.05 },
          { item: 'Development Tools', category: 'Tools', percentage: 5, amount: monthlyBudget * 0.05 },
          { item: 'Technical Support Tools', category: 'Support', percentage: 5, amount: monthlyBudget * 0.05 },
        ];
      }

      // Y1+: Use monthValue (4% of revenue / 12)
      return [
        { item: 'Cloud Infrastructure (AWS/GCP)', category: 'Infrastructure', percentage: 25, amount: monthValue * 0.25 },
        { item: 'AI/ML Services (OpenAI, etc)', category: 'AI Services', percentage: 20, amount: monthValue * 0.20 },
        { item: 'Learning Management System', category: 'Platform', percentage: 15, amount: monthValue * 0.15 },
        { item: 'Database Services', category: 'Infrastructure', percentage: 10, amount: monthValue * 0.10 },
        { item: 'CDN & Media Streaming', category: 'Infrastructure', percentage: 8, amount: monthValue * 0.08 },
        { item: 'Security & Monitoring', category: 'Security', percentage: 7, amount: monthValue * 0.07 },
        { item: 'Software Licenses (Office, etc)', category: 'Licenses', percentage: 5, amount: monthValue * 0.05 },
        { item: 'Development Tools', category: 'Tools', percentage: 5, amount: monthValue * 0.05 },
        { item: 'Technical Support Tools', category: 'Support', percentage: 5, amount: monthValue * 0.05 },
      ];
    },
  },

  // MARKETING
  'operational.marketing': {
    icon: Megaphone,
    color: 'green',
    title: 'Marketing & Sales Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Digital Advertising (Google, Meta)', category: 'Digital', percentage: 30, amount: monthValue * 0.30 },
      { item: 'Content Marketing & SEO', category: 'Content', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Social Media Management', category: 'Digital', percentage: 10, amount: monthValue * 0.10 },
      { item: 'Events & Conferences', category: 'Events', percentage: 12, amount: monthValue * 0.12 },
      { item: 'PR & Communications', category: 'PR', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Brand & Creative', category: 'Brand', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Sales Collateral & Materials', category: 'Sales', percentage: 7, amount: monthValue * 0.07 },
      { item: 'Partnerships & Sponsorships', category: 'Partnerships', percentage: 5, amount: monthValue * 0.05 },
      { item: 'Marketing Tools & Analytics', category: 'Tools', percentage: 5, amount: monthValue * 0.05 },
    ],
  },

  // FACILITIES
  'operational.facilities': {
    icon: Building,
    color: 'green',
    title: 'Facilities Costs Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Building Rent/Lease', category: 'Rent', percentage: 40, amount: monthValue * 0.40 },
      { item: 'Electricity', category: 'Utilities', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Water & Sewage', category: 'Utilities', percentage: 5, amount: monthValue * 0.05 },
      { item: 'Internet & Communications', category: 'Utilities', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Maintenance & Repairs', category: 'Maintenance', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Security Services', category: 'Security', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Cleaning Services', category: 'Services', percentage: 6, amount: monthValue * 0.06 },
      { item: 'Property Insurance', category: 'Insurance', percentage: 4, amount: monthValue * 0.04 },
      { item: 'Waste Management', category: 'Services', percentage: 2, amount: monthValue * 0.02 },
    ],
  },

  // TEACHER TRAINING
  'educational.teacherTraining': {
    icon: BookOpen,
    color: 'purple',
    title: 'Teacher Training Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'AI & Technology Training Programs', category: 'Training', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Pedagogy & Methodology Workshops', category: 'Training', percentage: 20, amount: monthValue * 0.20 },
      { item: 'External Certifications', category: 'Certification', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Training Materials & Resources', category: 'Materials', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Guest Speakers & Experts', category: 'External', percentage: 10, amount: monthValue * 0.10 },
      { item: 'Online Learning Platforms', category: 'Platform', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Conference Attendance', category: 'Events', percentage: 5, amount: monthValue * 0.05 },
      { item: 'Training Facility Costs', category: 'Facilities', percentage: 5, amount: monthValue * 0.05 },
    ],
  },

  // QUALITY ASSURANCE
  'educational.qualityAssurance': {
    icon: Shield,
    color: 'purple',
    title: 'Quality Assurance Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Assessment Development', category: 'Assessment', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Quality Audits', category: 'Audit', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Student Outcome Tracking', category: 'Analytics', percentage: 18, amount: monthValue * 0.18 },
      { item: 'Curriculum Review', category: 'Review', percentage: 15, amount: monthValue * 0.15 },
      { item: 'External Evaluations', category: 'External', percentage: 12, amount: monthValue * 0.12 },
      { item: 'QA Tools & Software', category: 'Tools', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // REGULATORY COMPLIANCE
  'educational.regulatoryCompliance': {
    icon: Shield,
    color: 'purple',
    title: 'Regulatory Compliance Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'MEC Compliance & Reporting', category: 'Government', percentage: 30, amount: monthValue * 0.30 },
      { item: 'Accreditation Fees', category: 'Accreditation', percentage: 20, amount: monthValue * 0.20 },
      { item: 'LGPD/Data Privacy Compliance', category: 'Data Privacy', percentage: 18, amount: monthValue * 0.18 },
      { item: 'Educational Standards Audit', category: 'Audit', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Legal Consulting', category: 'Legal', percentage: 10, amount: monthValue * 0.10 },
      { item: 'Documentation & Filing', category: 'Admin', percentage: 7, amount: monthValue * 0.07 },
    ],
  },

  // DATA MANAGEMENT
  'educational.dataManagement': {
    icon: Laptop,
    color: 'purple',
    title: 'Data Management Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Student Information System', category: 'System', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Data Storage & Backup', category: 'Infrastructure', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Analytics & Reporting Tools', category: 'Analytics', percentage: 18, amount: monthValue * 0.18 },
      { item: 'Data Security', category: 'Security', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Integration Services', category: 'Integration', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Data Quality Management', category: 'Quality', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // PARENT ENGAGEMENT
  'educational.parentEngagement': {
    icon: Users,
    color: 'purple',
    title: 'Parent Engagement Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Parent Portal Platform', category: 'Platform', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Communication Tools (App, SMS)', category: 'Communication', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Parent Events & Meetings', category: 'Events', percentage: 18, amount: monthValue * 0.18 },
      { item: 'Parent Education Programs', category: 'Programs', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Feedback & Survey Systems', category: 'Feedback', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Support Staff for Parents', category: 'Support', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // CONTENT DEVELOPMENT
  'educational.contentDevelopment': {
    icon: BookOpen,
    color: 'purple',
    title: 'Content Development Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Curriculum Writers', category: 'Content Creation', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Instructional Designers', category: 'Design', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Video Production', category: 'Media', percentage: 18, amount: monthValue * 0.18 },
      { item: 'Interactive Content Development', category: 'Interactive', percentage: 15, amount: monthValue * 0.15 },
      { item: 'AI Content Tools', category: 'AI', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Content Review & QA', category: 'Quality', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // BAD DEBT
  'business.badDebt': {
    icon: CreditCard,
    color: 'orange',
    title: 'Bad Debt Provision Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Tuition Default Provision', category: 'Tuition', percentage: 60, amount: monthValue * 0.60 },
      { item: 'Kit/Materials Default', category: 'Materials', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Franchise Fee Default Reserve', category: 'Franchise', percentage: 10, amount: monthValue * 0.10 },
      { item: 'Collection Agency Fees', category: 'Collection', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // PAYMENT PROCESSING
  'business.paymentProcessing': {
    icon: CreditCard,
    color: 'orange',
    title: 'Payment Processing Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Credit Card Fees (2.5%)', category: 'Card Fees', percentage: 50, amount: monthValue * 0.50 },
      { item: 'PIX/Bank Transfer Fees', category: 'Bank Fees', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Boleto Processing', category: 'Boleto', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Payment Gateway Fees', category: 'Gateway', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Chargeback Handling', category: 'Chargebacks', percentage: 8, amount: monthValue * 0.08 },
    ],
  },

  // PLATFORM R&D
  'business.platformRD': {
    icon: Laptop,
    color: 'orange',
    title: 'Platform R&D Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Software Development Team', category: 'Development', percentage: 40, amount: monthValue * 0.40 },
      { item: 'AI/ML Research & Development', category: 'AI R&D', percentage: 25, amount: monthValue * 0.25 },
      { item: 'UX/UI Design', category: 'Design', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Quality Assurance & Testing', category: 'QA', percentage: 10, amount: monthValue * 0.10 },
      { item: 'DevOps & Infrastructure', category: 'DevOps', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Research Tools & Resources', category: 'Tools', percentage: 5, amount: monthValue * 0.05 },
    ],
  },

  // LEGAL
  'other.legal': {
    icon: Shield,
    color: 'gray',
    title: 'Legal & Compliance Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'External Legal Counsel', category: 'Legal', percentage: 35, amount: monthValue * 0.35 },
      { item: 'Contract Management', category: 'Contracts', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Intellectual Property', category: 'IP', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Regulatory Filings', category: 'Regulatory', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Compliance Software', category: 'Software', percentage: 10, amount: monthValue * 0.10 },
      { item: 'Legal Training', category: 'Training', percentage: 8, amount: monthValue * 0.08 },
    ],
  },

  // INSURANCE
  'other.insurance': {
    icon: Shield,
    color: 'gray',
    title: 'Insurance Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'General Liability Insurance', category: 'Liability', percentage: 30, amount: monthValue * 0.30 },
      { item: 'Professional Liability (E&O)', category: 'Professional', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Property Insurance', category: 'Property', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Cyber Insurance', category: 'Cyber', percentage: 15, amount: monthValue * 0.15 },
      { item: "Workers' Compensation", category: 'Workers', percentage: 10, amount: monthValue * 0.10 },
    ],
  },

  // TRAVEL
  'other.travel': {
    icon: Plane,
    color: 'gray',
    title: 'Travel & Logistics Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Airfare', category: 'Transportation', percentage: 35, amount: monthValue * 0.35 },
      { item: 'Accommodation', category: 'Lodging', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Ground Transportation', category: 'Transportation', percentage: 15, amount: monthValue * 0.15 },
      { item: 'Meals & Per Diem', category: 'Meals', percentage: 12, amount: monthValue * 0.12 },
      { item: 'Event Registration', category: 'Events', percentage: 8, amount: monthValue * 0.08 },
      { item: 'Travel Insurance', category: 'Insurance', percentage: 5, amount: monthValue * 0.05 },
    ],
  },

  // WORKING CAPITAL
  'other.workingCapital': {
    icon: PiggyBank,
    color: 'gray',
    title: 'Working Capital Reserve Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Operating Cash Reserve', category: 'Cash', percentage: 40, amount: monthValue * 0.40 },
      { item: 'Accounts Receivable Buffer', category: 'AR', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Inventory/Materials Buffer', category: 'Inventory', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Seasonal Cash Flow Buffer', category: 'Seasonal', percentage: 15, amount: monthValue * 0.15 },
    ],
  },

  // CONTINGENCY
  'other.contingency': {
    icon: Shield,
    color: 'gray',
    title: 'Contingency Reserve Breakdown',
    getItems: (monthValue, yearIndex) => [
      { item: 'Emergency Fund', category: 'Emergency', percentage: 40, amount: monthValue * 0.40 },
      { item: 'Unexpected Repairs', category: 'Repairs', percentage: 25, amount: monthValue * 0.25 },
      { item: 'Legal Contingencies', category: 'Legal', percentage: 20, amount: monthValue * 0.20 },
      { item: 'Market Disruption Buffer', category: 'Market', percentage: 15, amount: monthValue * 0.15 },
    ],
  },

  // CAPEX
  'capex.amount': {
    icon: HardHat,
    color: 'red',
    title: 'CAPEX Breakdown',
    getItems: (monthValue, yearIndex) => {
      if (yearIndex === 0) {
        return [
          { item: 'Building Renovation/Construction', category: 'Construction', percentage: 45, amount: monthValue * 0.45 },
          { item: 'Classroom Equipment & Furniture', category: 'Equipment', percentage: 15, amount: monthValue * 0.15 },
          { item: 'Technology Infrastructure', category: 'Technology', percentage: 15, amount: monthValue * 0.15 },
          { item: 'Science & AI Labs', category: 'Labs', percentage: 12, amount: monthValue * 0.12 },
          { item: 'Sports & Recreation Facilities', category: 'Sports', percentage: 8, amount: monthValue * 0.08 },
          { item: 'Safety & Security Systems', category: 'Security', percentage: 5, amount: monthValue * 0.05 },
        ];
      }
      return [
        { item: 'Equipment Upgrades', category: 'Equipment', percentage: 35, amount: monthValue * 0.35 },
        { item: 'Technology Refresh', category: 'Technology', percentage: 30, amount: monthValue * 0.30 },
        { item: 'Facility Improvements', category: 'Facilities', percentage: 20, amount: monthValue * 0.20 },
        { item: 'New Lab Equipment', category: 'Labs', percentage: 15, amount: monthValue * 0.15 },
      ];
    },
  },

  // ARCHITECT
  'capex.architectPayment': {
    icon: Building,
    color: 'red',
    title: 'Architect Project Payments',
    getItems: (monthValue, yearIndex, monthIndex) => {
      if (yearIndex === 0 && monthIndex === 0) {
        return [
          { item: 'Upfront Design Fee', category: 'Design', percentage: 100, amount: 100000 },
        ];
      }
      return [
        { item: 'Monthly Project Fee', category: 'Project', percentage: 70, amount: monthValue * 0.70 },
        { item: 'Site Supervision', category: 'Supervision', percentage: 20, amount: monthValue * 0.20 },
        { item: 'Documentation', category: 'Documentation', percentage: 10, amount: monthValue * 0.10 },
      ];
    },
  },

  // DEBT SERVICE
  'debtService.bridgeInterest': {
    icon: Landmark,
    color: 'yellow',
    title: 'Bridge Loan Interest',
    getItems: (monthValue, yearIndex) => [
      { item: 'Bridge Loan Interest (2%/month)', category: 'Interest', percentage: 100, amount: monthValue, note: 'R$10M × 2% × 9 months = R$1.8M' },
    ],
  },

  'debtService.bridgeRepayment': {
    icon: Landmark,
    color: 'yellow',
    title: 'Bridge Loan Repayment',
    getItems: (monthValue, yearIndex) => [
      { item: 'Principal Repayment', category: 'Principal', percentage: 100, amount: monthValue, note: 'Full repayment in October 2026' },
    ],
  },

  'debtService.dspInterest': {
    icon: Landmark,
    color: 'yellow',
    title: 'Desenvolve SP Interest',
    getItems: (monthValue, yearIndex) => [
      { item: 'Quarterly Interest Payment', category: 'Interest', percentage: 100, amount: monthValue, note: 'R$30M × 8.4%/year = R$2.52M/year (0.7%/month)' },
    ],
  },

  'debtService.innovationInterest': {
    icon: Landmark,
    color: 'yellow',
    title: 'Innovation Loan Interest',
    getItems: (monthValue, yearIndex) => [
      { item: 'Quarterly Interest Payment', category: 'Interest', percentage: 100, amount: monthValue, note: 'R$15M × 8.4%/year = R$1.26M/year (0.7%/month)' },
    ],
  },

  'debtService.principal': {
    icon: Landmark,
    color: 'yellow',
    title: 'Principal Payments',
    getItems: (monthValue, yearIndex) => [
      { item: 'Desenvolve SP Principal', category: 'DSP', percentage: 67, amount: monthValue * 0.67, note: 'R$6M/year (R$30M over 5 years)' },
      { item: 'Innovation Loan Principal', category: 'Innovation', percentage: 33, amount: monthValue * 0.33, note: 'R$3M/year (R$15M over 5 years)' },
    ],
  },
};

// Helper function to get staff breakdown total for a given expense
// This is exported so ExpenseDetailModal can use it for consistent calculations
export const getStaffBreakdownTotal = (expenseId, yearIndex, monthIndex = 0) => {
  const breakdown = EXPENSE_BREAKDOWNS[expenseId];
  if (!breakdown) return null;

  // Only calculate for staff breakdowns
  if (!expenseId.startsWith('staff.')) return null;

  const items = breakdown.getItems(0, yearIndex, monthIndex);
  if (!items || items.length === 0) return null;

  return items.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
};

// Export EXPENSE_BREAKDOWNS for use in other components
export { EXPENSE_BREAKDOWNS };

const MonthDetailModal = ({
  isOpen,
  onClose,
  expenseId,
  expenseLabel,
  monthIndex,
  monthValue,
  yearIndex,
  calendarYear,
  onSave,
  savedItems,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const breakdown = EXPENSE_BREAKDOWNS[expenseId];

  const items = useMemo(() => {
    // Use saved items if available (persisted overrides)
    if (savedItems && savedItems.length > 0) {
      return savedItems;
    }
    // Otherwise calculate from defaults
    if (!breakdown) return [];
    const result = breakdown.getItems(monthValue, yearIndex, monthIndex);
    return result;
  }, [breakdown, monthValue, yearIndex, monthIndex, savedItems]);

  // Initialize editedItems when entering edit mode
  const handleStartEdit = () => {
    setEditedItems(items.map(item => ({ ...item })));
    setIsEditing(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditedItems([]);
    setIsEditing(false);
  };

  // Calculate the delta between original and edited items
  const calculateDelta = () => {
    const originalTotal = items.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
    const editedTotal = editedItems.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
    return editedTotal - originalTotal;
  };

  // Handle save for this month only
  const handleSaveThisMonth = () => {
    const delta = calculateDelta();
    const editedTotal = editedItems.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
    if (onSave) {
      onSave({
        expenseId,
        monthIndex,
        yearIndex,
        items: editedItems,
        newTotal: editedTotal,
        delta, // Pass the change amount so parent can apply to scaled value
        applyToRestOfYear: false,
      });
    }
    setIsEditing(false);
  };

  // Handle save for rest of year (from this month onwards)
  const handleSaveRestOfYear = () => {
    const delta = calculateDelta();
    const editedTotal = editedItems.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
    if (onSave) {
      onSave({
        expenseId,
        monthIndex,
        yearIndex,
        items: editedItems,
        newTotal: editedTotal,
        delta, // Pass the change amount so parent can apply to scaled value
        applyToRestOfYear: true,
      });
    }
    setIsEditing(false);
  };

  // Update staff item - allow empty input for easier editing
  const handleStaffChange = (index, field, value) => {
    setEditedItems(prev => {
      const newItems = [...prev];
      // Allow empty string for typing, treat as 0 for calculations
      const numValue = value === '' ? '' : (parseInt(value) || 0);
      const calcValue = value === '' ? 0 : (parseInt(value) || 0);

      newItems[index] = {
        ...newItems[index],
        [field]: numValue,
        total: field === 'quantity'
          ? calcValue * (newItems[index].monthlySalary === '' ? 0 : newItems[index].monthlySalary)
          : (newItems[index].quantity === '' ? 0 : newItems[index].quantity) * calcValue,
      };
      return newItems;
    });
  };

  // Update generic item - allow empty input for easier editing
  const handleItemChange = (index, field, value) => {
    setEditedItems(prev => {
      const newItems = [...prev];
      // Allow empty string for typing
      const numValue = value === '' ? '' : (parseFloat(value) || 0);
      newItems[index] = {
        ...newItems[index],
        [field]: numValue,
      };
      return newItems;
    });
  };

  // Get display items (edited or original)
  const displayItems = isEditing ? editedItems : items;

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  const Icon = breakdown?.icon || Shield;
  const color = breakdown?.color || 'gray';
  const title = breakdown?.title || 'Expense Breakdown';

  // Check if this is a staff breakdown (has role field)
  const isStaffBreakdown = displayItems.length > 0 && displayItems[0].role;

  const totalFromItems = displayItems.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${color}-600 to-${color}-700 text-white px-6 py-4`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Icon className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className={`text-${color}-100 text-sm mt-1`}>
                  {months[monthIndex]} {calendarYear} • {expenseLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-b">
          <div>
            <span className="text-gray-600">Month Total:</span>
            <span className="ml-2 text-xl font-bold text-gray-800">{formatCurrency(totalFromItems)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {displayItems.length} line items
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isStaffBreakdown ? (
            // Staff Table View
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Department</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Monthly Salary</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.role}</div>
                        <div className="text-xs text-gray-500">{item.type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.department}</td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleStaffChange(index, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1 border border-blue-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.monthlySalary}
                            onChange={(e) => handleStaffChange(index, 'monthlySalary', e.target.value)}
                            className="w-28 px-2 py-1 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step="100"
                          />
                        ) : (
                          formatCurrency(item.monthlySalary)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 text-white">
                    <td colSpan="2" className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {displayItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {formatCurrency(totalFromItems)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            // Generic Item Table View
            <div className="space-y-3">
              {displayItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.item}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs bg-${color}-100 text-${color}-700 px-2 py-0.5 rounded-full`}>
                        {item.category}
                      </span>
                      {item.note && (
                        <span className="text-xs text-gray-500">{item.note}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {isEditing ? (
                      <div className="flex flex-col items-end space-y-1">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          className="w-32 px-2 py-1 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-lg font-bold text-gray-800">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.percentage}%
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg mt-4">
                <div className="font-semibold">Total</div>
                <div className="text-xl font-bold">{formatCurrency(totalFromItems)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isEditing ? (
                <span className="text-blue-600 font-medium">✏️ Editing Mode - Changes will update the total</span>
              ) : (
                <>Year {yearIndex} ({calendarYear}) • {months[monthIndex]}</>
              )}
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveThisMonth}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title={`Save changes only for ${months[monthIndex]}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Save This Month</span>
                  </button>
                  <button
                    onClick={handleSaveRestOfYear}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title={`Apply these values from ${months[monthIndex]} through December`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Save {months[monthIndex]} → Dec</span>
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
                    onClick={handleStartEdit}
                    className={`flex items-center space-x-2 px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors`}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>
                </>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="mt-3 text-xs text-gray-500 text-right">
              <span className="font-medium">Save This Month:</span> Changes apply only to {months[monthIndex]} |
              <span className="font-medium ml-2">Save {months[monthIndex]} → Dec:</span> Apply to {months[monthIndex]} and all months after
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthDetailModal;
