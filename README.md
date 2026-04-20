# AI School Brazil - Financial Model & Business Plan

Interactive financial modeling application for AI-powered K-12 education venture in Brazil.

## Features

### 📊 Interactive Financial Dashboard
- Real-time financial projections with 10-year outlook
- Revenue breakdown by 4 business streams (Flagship, Franchises, Adoption, Kit Sales)
- EBITDA margins and profitability analysis
- Student growth tracking and market penetration metrics
- 3 CAPEX scenario comparisons

### 🎛️ Dynamic Parameter Controls
- Live model updates with slider controls
- Student enrollment and pricing adjustments
- Growth rate and cost structure modifications
- CAPEX scenario selection (Government/Built-to-Suit/Direct Investment)
- Sensitivity analysis and scenario modeling

### 🎯 Investor Presentation Mode
- Professional slide deck with 7 key slides
- Fullscreen presentation capability
- Print/PDF export functionality
- Executive summary and financial highlights
- Market opportunity and competitive analysis

## Financial Model Highlights (Post-Audit 2026-04)

**Year 10 Projections (Private Realistic + Public Optimistic, fully loaded):**
- Gross Revenue: R$3.49B | Net Revenue (after indirect taxes): R$3.06B
- EBITDA: ~R$1.33B (**~38% gross margin / ~44% net margin**)
- Students: ~1.6M total (150K private adoption + 1.2M-1.4M public sector)
- Cash ending Y10: ~R$3.0B positive
- Break-even: Y3 (2029)

**Key Business Model (audited):**
- **Private Adoption Licensing:** R$180/student/month B2B (150K students by Y10)
- **Public Sector:** R$150/student/month via municipal/state contracts (optimistic path)
- **Franchise Network:** 24 franchises × 1,200 students, R$180K fee, 6% royalty, 2% marketing fund
- **Flagship School (SP):** 1,200 students at R$2,300/mo — demonstration center
- **Kit Sales:** R$1,200/student/year universally

**Audit-applied corrections (see BUSINESS_PLAN_AUDIT.md):**
- Indirect taxes on revenue: PIS/COFINS 9.25% + ISS 3%
- CLT labor burden: 1.80× multiplier on base salaries (INSS, FGTS, 13th, vacation)
- LLM/AI variable cost: R$150/student/year (OpenAI/Anthropic tokens)
- Segmented bad debt: B2C 8% (Fenep benchmark) / B2B 2%
- Dedicated B2B sales team separate from brand marketing
- LGPD uplift (R$800K base + R$80/student) + MEC authorization upfront
- CAPEX 20% contingency for historic building retrofit
- Juros Desenvolve SP + Innovation sincronizados a 12%/a.a.
- Corporate/parent-engagement scaled to private students only (not public B2B)
- EBITDA margin target realigned from aspirational 82% to defensible 38-44%


## Technology Stack

- **Frontend:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts library
- **Icons:** Lucide React
- **Financial Engine:** Custom JavaScript modeling

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/Raphael/Desktop/BP\ K12/ai-school-financial-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser to:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Application Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main financial dashboard
│   ├── ParameterControl.jsx   # Interactive parameter controls
│   └── PresentationMode.jsx   # Investor presentation slides
├── utils/
│   └── financialModel.js      # Core financial modeling engine
├── App.jsx                    # Main application component
├── main.jsx                   # Application entry point
└── index.css                  # Global styles and Tailwind
```

## Key Features Explained

### Financial Modeling Engine
- **Real-time Calculations:** All metrics update instantly when parameters change
- **Scenario Analysis:** Compare different CAPEX and growth scenarios
- **IRR & NPV Calculations:** Professional-grade financial analysis
- **Sensitivity Testing:** Understand impact of key variable changes

### Dashboard Components
- **KPI Cards:** High-level metrics with trend indicators
- **Revenue Growth Chart:** Stacked bar chart showing revenue streams over time
- **Student Growth Visualization:** Growth trajectory by channel
- **Profitability Analysis:** EBITDA margins and cash flow projections

### Parameter Controls
- **Market Parameters:** Student counts, market penetration rates
- **Pricing Controls:** Tuition, licensing fees, franchise rates
- **Growth Assumptions:** Expansion rates, market adoption curves
- **Cost Structure:** Technology investment, operational costs

### Presentation Mode
- **Slide Navigation:** Professional presentation with slide controls
- **Fullscreen Support:** Optimized for investor presentations
- **Print/PDF Export:** Generate presentation materials
- **Interactive Charts:** Live data visualization in presentation

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub repository
2. Connect Vercel to GitHub repo
3. Deploy automatically with zero configuration

### Option 2: Local Network Sharing
```bash
npm run dev -- --host
```
Access via local IP address for demo purposes

### Option 3: Static Hosting
```bash
npm run build
```
Deploy the `dist` folder to any static hosting service

## Business Model Integration

The application integrates all key elements from the comprehensive business plan:

- **Market Analysis:** R$9B Brazilian private K-12 education market
- **Competitive Advantage:** 43% cost savings through AI optimization
- **Revenue Diversification:** 4 distinct revenue streams
- **Financial Projections:** 10-year detailed financial model
- **Risk Analysis:** Scenario modeling and sensitivity analysis
- **Implementation Roadmap:** Clear execution timeline

## Usage Instructions

### For Financial Analysis
1. Start with the **Dashboard** tab to see overall financial picture
2. Adjust parameters in the **Parameters** tab to test scenarios
3. Watch real-time updates to all financial metrics
4. Compare different CAPEX scenarios using radio buttons

### For Investor Presentations
1. Switch to **Presentation** mode for fullscreen slides
2. Use arrow keys or click navigation for slide control
3. Print or save as PDF for distribution
4. Return to dashboard for Q&A and detailed analysis

### For Scenario Planning
1. Create base case with default parameters
2. Adjust key variables to test sensitivity
3. Compare IRR, NPV, and payback periods
4. Document different scenarios for decision making

## Support and Customization

The application is designed to be easily customizable:

- **Parameters:** Modify `DEFAULT_PARAMETERS` in `financialModel.js`
- **Styling:** Update Tailwind classes for design changes
- **Charts:** Extend Recharts components for additional visualizations
- **Slides:** Add/modify slides in `PresentationMode.jsx`

## License

© 2024 AI School Brazil Financial Model. All rights reserved.# Integration Dashboard Update Tue Oct 21 00:27:44 -03 2025
