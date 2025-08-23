import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, TrendingUp, DollarSign, Target, Building, Lightbulb, BarChart3, PieChart, Presentation, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const PresentationMode = ({ financialData, competitiveCostData, className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { projection, summary } = financialData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Chart data
  const revenueGrowthData = projection.slice(1).map(year => ({
    year: year.year,
    revenue: year.revenue.total / 1000000,
    ebitda: year.ebitda / 1000000
  }));

  const revenueComposition = [
    { name: 'Adoption Licensing', value: 38, color: '#3b82f6' },
    { name: 'Kit Sales', value: 29, color: '#10b981' },
    { name: 'Franchise Revenue', value: 27, color: '#f59e0b' },
    { name: 'Flagship Tuition', value: 6, color: '#ef4444' }
  ];

  const marketPenetrationData = [
    { year: 1, students: 33250, share: 0.37 },
    { year: 3, students: 99000, share: 1.1 },
    { year: 5, students: 164000, share: 1.82 },
    { year: 10, students: 326500, share: 3.63 }
  ];

  const costComparisonData = [
    { category: 'Traditional School', cost: 22190000, costPerStudent: 11095 },
    { category: 'AI School Model', cost: 12650000, costPerStudent: 8433 }
  ];

  const slides = [
    // Slide 1: Executive Summary
    {
      title: "AI School Brazil",
      subtitle: "Transforming K-12 Education Through AI Innovation",
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-50 rounded-full">
              <Lightbulb className="w-6 h-6 text-primary-600" />
              <span className="text-primary-700 font-medium">AI-Powered Personalized Learning</span>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              First-mover advantage in AI education with Harvard expertise, targeting Brazil's R$100B education market
            </p>
            
            {/* Value Proposition */}
            <div className="bg-primary-50 p-6 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-primary-900 mb-4 text-center">Why Now? Why Brazil? Why AI School?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-primary-800">🚀 Market Timing</div>
                  <div className="text-primary-700">Post-COVID digital transformation + AI breakthrough</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary-800">🇧🇷 Brazil Advantage</div>
                  <div className="text-primary-700">200M population, growing middle class, education priority</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary-800">🤖 AI Differentiation</div>
                  <div className="text-primary-700">Harvard partnership, personalized learning at scale</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary-600">{formatCurrency(summary.year10Revenue)}</div>
              <div className="text-sm text-gray-600">Year 10 Revenue</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{formatPercentage(summary.irr)}</div>
              <div className="text-sm text-gray-600">10-Year IRR</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">{formatNumber(summary.year10Students)}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">{summary.flagshipBreakEvenMonths} months</div>
              <div className="text-sm text-gray-600">Flagship Break-even</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Problem & Solution
    {
      title: "The Problem",
      subtitle: "Brazilian Education System in Crisis",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">📚 Educational Challenges</h3>
                <ul className="space-y-3 text-red-700">
                  <li>• <strong>Poor Performance:</strong> Brazil ranks 70th globally in education</li>
                  <li>• <strong>High Dropout:</strong> 24% abandon school before completion</li>
                  <li>• <strong>Inequality:</strong> Private schools cost R$4,000+/month</li>
                  <li>• <strong>Outdated Methods:</strong> 19th-century model for 21st-century skills</li>
                  <li>• <strong>Teacher Shortage:</strong> 2.2M teachers needed by 2030</li>
                </ul>
              </div>
            </div>
            
            {/* Solution */}
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">🤖 Our AI Solution</h3>
                <ul className="space-y-3 text-green-700">
                  <li>• <strong>Personalized Learning:</strong> AI adapts to each student's pace</li>
                  <li>• <strong>Democratic Access:</strong> R$2,300/month vs R$4,000+ market</li>
                  <li>• <strong>Scalable Quality:</strong> Harvard expertise accessible to all</li>
                  <li>• <strong>Future Skills:</strong> AI literacy, critical thinking, creativity</li>
                  <li>• <strong>Teacher Augmentation:</strong> AI assists, doesn't replace</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Market Impact */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">🎯 Market Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{Math.round(summary.year10Students / 1000)}K</div>
                <div className="text-sm text-blue-700">Students Reached by 2035</div>
                <div className="text-xs text-blue-600 mt-1">{((summary.year10Students / 9090909) * 100).toFixed(1)}% market penetration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">50%</div>
                <div className="text-sm text-blue-700">Cost Reduction vs Traditional</div>
                <div className="text-xs text-blue-600 mt-1">Through AI efficiency</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">10x</div>
                <div className="text-sm text-blue-700">Learning Outcomes Improvement</div>
                <div className="text-xs text-blue-600 mt-1">Personalized AI education</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: Market Opportunity
    {
      title: "Market Opportunity",
      subtitle: "R$100B Brazilian Private K-12 Market",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Market Size</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Private K-12 Market</span>
                    <span className="font-bold text-blue-900">R$100 Billion</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Private Students</span>
                    <span className="font-bold text-blue-900">9 Million</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Average Annual Tuition</span>
                    <span className="font-bold text-blue-900">R$11,000/student</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Our Target Share</span>
                    <span className="font-bold text-blue-900">{((summary.year10Students / 9090909) * 100).toFixed(2)}% ({Math.round(summary.year10Students / 1000)}K of 9M)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Proven Model + Brazilian Advantages</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• <strong>Validated Technology:</strong> Alpha School (USA) proves 2.3x faster learning</li>
                  <li>• <strong>Cost Advantage:</strong> R$2,300 vs Alpha's $40,000+ (60% savings)</li>
                  <li>• <strong>Market Size:</strong> Brazil 10x larger than Alpha's addressable market</li>
                  <li>• <strong>Harvard Partnership:</strong> Same quality, Brazilian accessibility</li>
                  <li>• <strong>Local Expertise:</strong> Brazilian curriculum + cultural integration</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Market Penetration Timeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketPenetrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value), 'Students']} />
                    <Bar dataKey="students" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Business Model
    {
      title: "Business Model",
      subtitle: "Four Diversified Revenue Streams",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Flagship School</h4>
                  <p className="text-sm text-blue-700">Premium demonstration center</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{formatCurrency(projection[10]?.revenue?.flagship || 0)}</p>
                  <p className="text-xs text-blue-600">Year 10 Revenue</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900">Franchises</h4>
                  <p className="text-sm text-green-700">{projection[10]?.franchiseCount || 0} locations nationwide</p>
                  <p className="text-lg font-bold text-green-900 mt-2">
                    {formatCurrency((projection[10]?.revenue?.franchiseRoyalty || 0) + (projection[10]?.revenue?.franchiseMarketing || 0) + (projection[10]?.revenue?.franchiseFees || 0))}
                  </p>
                  <p className="text-xs text-green-600">Year 10 Revenue</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900">Adoption</h4>
                  <p className="text-sm text-purple-700">{formatNumber(projection[10]?.students?.adoption || 0)} existing school students</p>
                  <p className="text-lg font-bold text-purple-900 mt-2">{formatCurrency(projection[10]?.revenue?.adoption || 0)}</p>
                  <p className="text-xs text-purple-600">Year 10 Revenue</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-orange-900">Kit Sales</h4>
                  <p className="text-sm text-orange-700">Universal across all students</p>
                  <p className="text-lg font-bold text-orange-900 mt-2">{formatCurrency(projection[10]?.revenue?.kits || 0)}</p>
                  <p className="text-xs text-orange-600">Year 10 Revenue</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Composition (Year 10)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={revenueComposition}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {revenueComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Key Business Model Benefits</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 85%+ recurring revenue</li>
                  <li>• Asset-light scaling model</li>
                  <li>• Technology platform leverage</li>
                  <li>• Multiple market segments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Financial Projections
    {
      title: "Financial Projections",
      subtitle: "Exceptional Growth & Profitability",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(summary.year10Revenue)}</div>
              <div className="text-green-700 font-medium">Year 10 Revenue</div>
              <div className="text-sm text-green-600 mt-1">40%+ CAGR</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">82%</div>
              <div className="text-blue-700 font-medium">EBITDA Margin</div>
              <div className="text-sm text-blue-600 mt-1">Best-in-class profitability</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(summary.cumulativeEbitda)}</div>
              <div className="text-purple-700 font-medium">Cumulative EBITDA</div>
              <div className="text-sm text-purple-600 mt-1">10-year total</div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toFixed(0)}M`, '']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="ebitda" stroke="#10b981" strokeWidth={3} name="EBITDA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },

    // Slide 6: Flagship Economics & Break-even
    {
      title: "Flagship School Economics",
      subtitle: "Realistic Break-even Analysis for Franchisee Confidence",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Break-even Analysis */}
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">📊 Flagship Break-even Timeline</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Initial CAPEX</span>
                    <span className="font-bold text-blue-900">{formatCurrency(summary.capexScenario.initialCapex)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Monthly Tuition</span>
                    <span className="font-bold text-blue-900">R$2,300/student</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Target Students</span>
                    <span className="font-bold text-blue-900">1,200 (Year 3)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-blue-700 font-medium">Break-even Point</span>
                    <span className="font-bold text-blue-900 text-lg">{summary.flagshipBreakEvenMonths} months</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💡 Franchisee Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Proven flagship model with realistic timelines</li>
                  <li>• Monthly tuition provides steady cash flow</li>
                  <li>• Higher marketing costs in Year 1, then efficiency</li>
                  <li>• Alpha School validates 2.3x learning outcomes</li>
                </ul>
              </div>
            </div>
            
            {/* Monthly Ramp-up */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Student Enrollment Ramp-up</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Months 1-6</span>
                  <span className="font-semibold text-gray-900">50-300 students</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Months 7-12</span>
                  <span className="font-semibold text-gray-900">300-600 students</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Months 13-24</span>
                  <span className="font-semibold text-gray-900">600-1,200 students</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Year 3+</span>
                  <span className="font-semibold text-green-600">Steady state profitability</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Key Cost Considerations</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Marketing: 15% of revenue in ramp-up phase</li>
                  <li>• Facilities: R${(summary.capexScenario.annualFacilityCost/1000000).toFixed(1)}M/year operational</li>
                  <li>• Staff: Scales with student growth</li>
                  <li>• Corporate support included in franchise fees</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Revenue Separation */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Stream Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="font-bold text-blue-900">Years 1-2</div>
                <div className="text-sm text-blue-700">Flagship Only</div>
                <div className="text-xs text-blue-600 mt-1">Prove the model</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="font-bold text-green-900">Year 3+</div>
                <div className="text-sm text-green-700">+ Franchises</div>
                <div className="text-xs text-green-600 mt-1">Scale the network</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="font-bold text-purple-900">Year 3+</div>
                <div className="text-sm text-purple-700">+ Adoption</div>
                <div className="text-xs text-purple-600 mt-1">Market penetration</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Cost Advantage
    {
      title: "Competitive Cost Advantage",
      subtitle: "43% Lower Operating Costs Through AI Innovation",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Cost Comparison</h3>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 font-medium">Traditional School</span>
                    <span className="text-2xl font-bold text-red-900">{formatCurrency(22190000)}</span>
                  </div>
                  <div className="text-sm text-red-600 mt-1">R$11,095 per student</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">AI School Model</span>
                    <span className="text-2xl font-bold text-green-900">{formatCurrency(12650000)}</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">R$8,433 per student</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Annual Savings</span>
                    <span className="text-2xl font-bold text-blue-900">{formatCurrency(9540000)}</span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">43% cost reduction</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Key Cost Savings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Teaching Staff (1:25 vs 1:15 ratio)</span>
                  <span className="font-semibold text-green-600">40.5% savings</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Facilities (AI learning efficiency)</span>
                  <span className="font-semibold text-green-600">55.6% savings</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Materials (Digital AI curriculum)</span>
                  <span className="font-semibold text-green-600">75% savings</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Administration (AI automation)</span>
                  <span className="font-semibold text-green-600">41.4% savings</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Strategic Impact</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Democratic pricing with superior margins</li>
                  <li>• R$9.54M annual reinvestment capacity</li>
                  <li>• Sustainable competitive advantage</li>
                  <li>• Scalable technology platform</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Investment Scenarios
    {
      title: "Investment Scenarios",
      subtitle: "Flexible CAPEX Options with Strong Returns",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-green-600 font-bold text-sm mb-2">RECOMMENDED</div>
                <h3 className="text-xl font-bold text-green-900 mb-4">Government Partnership</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(5000000)}</div>
                  <div className="text-sm text-green-700">Initial Investment</div>
                  <div className="text-2xl font-bold text-green-600">{formatPercentage(summary.irr)}</div>
                  <div className="text-sm text-green-700">IRR</div>
                  <div className="text-lg font-bold text-green-600">{summary.paybackPeriod} years</div>
                  <div className="text-sm text-green-700">Payback Period</div>
                </div>
                <div className="mt-4 text-xs text-green-600">
                  R$5M renovation + 30-year building use
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Built-to-Suit</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(3000000)}</div>
                  <div className="text-sm text-blue-700">Initial Investment</div>
                  <div className="text-2xl font-bold text-blue-600">42-45%</div>
                  <div className="text-sm text-blue-700">IRR</div>
                  <div className="text-lg font-bold text-blue-600">{summary.paybackPeriod + 1}-{summary.paybackPeriod + 2} years</div>
                  <div className="text-sm text-blue-700">Payback Period</div>
                </div>
                <div className="mt-4 text-xs text-blue-600">
                  Fund builds + rent + purchase option
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-orange-900 mb-4">Direct Investment</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-orange-600">{formatCurrency(28000000)}</div>
                  <div className="text-sm text-orange-700">Initial Investment</div>
                  <div className="text-2xl font-bold text-orange-600">35-38%</div>
                  <div className="text-sm text-orange-700">IRR</div>
                  <div className="text-lg font-bold text-orange-600">{summary.paybackPeriod + 2}-{summary.paybackPeriod + 3} years</div>
                  <div className="text-sm text-orange-700">Payback Period</div>
                </div>
                <div className="mt-4 text-xs text-orange-600">
                  R$25M construction + full ownership
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Superior Economics vs Alpha School Model</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPercentage(summary.irr)}</div>
                <div className="text-sm text-gray-600">IRR</div>
                <div className="text-xs text-gray-500 mt-1">vs Alpha's ~25%</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{summary.paybackPeriod}yr</div>
                <div className="text-sm text-gray-600">Payback Period</div>
                <div className="text-xs text-gray-500 mt-1">Faster break-even</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.npv / 1000000000)}B</div>
                <div className="text-sm text-gray-600">NPV</div>
                <div className="text-xs text-gray-500 mt-1">10x market size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">60%</div>
                <div className="text-sm text-gray-600">Cost Advantage</div>
                <div className="text-xs text-gray-500 mt-1">vs Alpha pricing</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="text-center text-sm text-blue-800">
                <strong>Proven Model:</strong> Alpha School validates AI education works • <strong>Better Economics:</strong> Brazilian cost structure + larger market
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Exit Strategy & Returns
    {
      title: "Exit Strategy & Investor Returns",
      subtitle: "Multiple Exit Pathways with Compelling Returns",
      content: (
        <div className="space-y-8">
          {/* Exit Strategy Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Strategic Acquisition</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-blue-600">10-12x</div>
                  <div className="text-sm text-blue-700">Revenue Multiple</div>
                  <div className="text-lg font-bold text-blue-600">Year 7-10</div>
                  <div className="text-sm text-blue-700">Exit Timeline</div>
                </div>
                <div className="mt-4 text-xs text-blue-600">
                  Pearson, Cengage, McGraw-Hill
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-green-600 font-bold text-sm mb-2">RECOMMENDED</div>
                <h3 className="text-xl font-bold text-green-900 mb-4">IPO</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-green-600">8-10x</div>
                  <div className="text-sm text-green-700">Revenue Multiple</div>
                  <div className="text-lg font-bold text-green-600">Year 8-12</div>
                  <div className="text-sm text-green-700">Exit Timeline</div>
                </div>
                <div className="mt-4 text-xs text-green-600">
                  NASDAQ/B3 listing
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-purple-900 mb-4">Private Equity</h3>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-purple-600">9-12x</div>
                  <div className="text-sm text-purple-700">Revenue Multiple</div>
                  <div className="text-lg font-bold text-purple-600">Year 5-8</div>
                  <div className="text-sm text-purple-700">Exit Timeline</div>
                </div>
                <div className="mt-4 text-xs text-purple-600">
                  KKR, Carlyle, Advent
                </div>
              </div>
            </div>
          </div>
          
          {/* Valuation Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Projected Exit Valuations (Based on Year 10 Revenue: {formatCurrency(summary.year10Revenue)})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(summary.year10Revenue * 8)}
                </div>
                <div className="text-sm text-gray-600">Conservative (8x Revenue)</div>
                <div className="text-xs text-gray-500 mt-1">35x IRR to investors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(summary.year10Revenue * 10)}
                </div>
                <div className="text-sm text-gray-600">Realistic (10x Revenue)</div>
                <div className="text-xs text-gray-500 mt-1">52x IRR to investors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(summary.year10Revenue * 12)}
                </div>
                <div className="text-sm text-gray-600">Optimistic (12x Revenue)</div>
                <div className="text-xs text-gray-500 mt-1">72x IRR to investors</div>
              </div>
            </div>
          </div>
          
          {/* Industry Comparables */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benchmark: Alpha School vs Our Model</h3>
            
            {/* Alpha School Comparison */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">🇺🇸 Alpha School (USA)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Tuition: $40,000-$65,000/year</li>
                    <li>• Target: Premium US market</li>
                    <li>• Teachers: $100,000+ salaries</li>
                    <li>• Expansion: 3 campuses</li>
                    <li>• Proven: 2.3x faster learning</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-3">🇧🇷 AI School Brazil (Our Model)</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Tuition: R$27,600/year (60% lower!)</li>
                    <li>• Target: Accessible Brazilian market</li>
                    <li>• Teachers: Brazilian talent at scale</li>
                    <li>• Expansion: 30+ franchise network</li>
                    <li>• Enhanced: Harvard + local expertise</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <div className="text-center">
                  <div className="font-bold text-green-900">🎯 Our Competitive Advantage</div>
                  <div className="text-sm text-green-800 mt-1">
                    Same proven AI model • 60% lower cost • 10x larger addressable market • Harvard partnership
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other Industry Comparables */}
            <h4 className="text-md font-medium text-gray-700 mb-3">Other EdTech Valuations</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-base font-bold text-gray-900">Coursera</div>
                <div className="text-sm text-gray-600">12.5x Revenue</div>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">2U Inc</div>
                <div className="text-sm text-gray-600">8.2x Revenue</div>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Chegg</div>
                <div className="text-sm text-gray-600">15.8x Revenue</div>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Duolingo</div>
                <div className="text-sm text-gray-600">22.4x Revenue</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9: Call to Action
    {
      title: "Investment Opportunity",
      subtitle: "Join Us in Transforming Brazilian Education",
      content: (
        <div className="space-y-8 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-primary-900 mb-4">Why Invest Now?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto" />
                <div className="text-lg font-bold text-gray-900">Massive Market</div>
                <div className="text-sm text-gray-600">R$9B addressable market with democratic access strategy</div>
              </div>
              <div className="space-y-2">
                <Lightbulb className="w-8 h-8 text-blue-600 mx-auto" />
                <div className="text-lg font-bold text-gray-900">First-Mover</div>
                <div className="text-sm text-gray-600">Harvard AI expertise with Brazilian curriculum integration</div>
              </div>
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto" />
                <div className="text-lg font-bold text-gray-900">Exceptional Returns</div>
                <div className="text-sm text-gray-600">38-49% IRR with multiple exit pathways</div>
              </div>
              <div className="space-y-2">
                <Target className="w-8 h-8 text-orange-600 mx-auto" />
                <div className="text-lg font-bold text-gray-900">Proven Model</div>
                <div className="text-sm text-gray-600">Technology platform with 4 diversified revenue streams</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-primary-200 p-6 rounded-lg">
                <div className="text-primary-600 font-bold text-lg mb-2">Phase 1</div>
                <h4 className="font-semibold text-gray-900 mb-2">Due Diligence</h4>
                <p className="text-sm text-gray-600">Technology platform demo, Harvard partnership verification, market validation</p>
              </div>
              <div className="bg-white border-2 border-primary-200 p-6 rounded-lg">
                <div className="text-primary-600 font-bold text-lg mb-2">Phase 2</div>
                <h4 className="font-semibold text-gray-900 mb-2">Investment Close</h4>
                <p className="text-sm text-gray-600">Series A funding, government partnerships, team assembly</p>
              </div>
              <div className="bg-white border-2 border-primary-200 p-6 rounded-lg">
                <div className="text-primary-600 font-bold text-lg mb-2">Phase 3</div>
                <h4 className="font-semibold text-gray-900 mb-2">Launch Execution</h4>
                <p className="text-sm text-gray-600">Flagship school launch, franchise development, adoption program</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Ready to Transform Education?</h3>
            <p className="mb-4">Join us in democratizing world-class AI education for Brazilian students</p>
            <div className="text-2xl font-bold">Contact us today to begin the investment process</div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Professional Header Stamp - Fixed at top */}
      <div className="bg-white border-b-2 border-red-200 p-3 no-print sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 border-2 border-red-400 px-3 py-1 rounded-lg">
              <div className="text-red-700 font-bold text-xs">CONFIDENTIAL</div>
            </div>
            <div className="text-gray-700">
              <div className="font-semibold text-xs">Project Owner: Raphael Ruiz</div>
              <div className="text-xs text-gray-500">AI School Brazil - Investor Presentation</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      {/* Presentation Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
        <div className="flex items-center gap-4">
          <button onClick={prevSlide} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            {currentSlide + 1} / {slides.length}
          </span>
          <button onClick={nextSlide} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Presentation className="w-4 h-4 mr-2 inline" />
            Fullscreen
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Print/PDF
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="p-8 lg:p-12 min-h-screen flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600">
            {slides[currentSlide].subtitle}
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Slide Navigation Dots */}
        <div className="flex justify-center mt-8 no-print">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide 
                    ? 'bg-primary-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;