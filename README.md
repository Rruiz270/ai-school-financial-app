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

## Financial Model Highlights

**Year 10 Projections:**
- Revenue: R$1.68B (40%+ CAGR)
- EBITDA: R$1.38B (82% margin)
- Students: 326,500 (5% market share)
- IRR: 38-49% (depending on CAPEX scenario)

**Key Business Model:**
- **Adoption Licensing:** R$648M (38% of revenue) - 250K students at R$200/month
- **Kit Sales:** R$495M (29% of revenue) - Universal across all students
- **Franchise Revenue:** R$451M (27% of revenue) - 50 franchises
- **Flagship Tuition:** R$90M (5% of revenue) - Premium demonstration center

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
