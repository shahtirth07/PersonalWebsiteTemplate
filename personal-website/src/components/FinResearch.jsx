import React, { useState, useEffect, useRef } from 'react';
import './FinResearch.css';

const FinResearch = () => {
  const [selectedDashboard, setSelectedDashboard] = useState('trading');
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('line');
  const chartRefs = {
    trading: useRef(null),
    analytics: useRef(null),
    ml: useRef(null),
    network: useRef(null)
  };

  const renderDashboardIconGraphic = (dashboardId, strokeColor = '#ffffff') => {
    switch (dashboardId) {
      case 'analytics':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="12" width="4" height="8" rx="1" fill={strokeColor} opacity="0.9" />
            <rect x="10" y="6" width="4" height="14" rx="1" fill={strokeColor} opacity="0.75" />
            <rect x="17" y="9" width="4" height="11" rx="1" fill={strokeColor} opacity="0.6" />
          </svg>
        );
      case 'ml':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="12" r="2.2" stroke={strokeColor} strokeWidth="2" fill="none" />
            <circle cx="12" cy="6" r="2.2" stroke={strokeColor} strokeWidth="2" fill="none" />
            <circle cx="12" cy="18" r="2.2" stroke={strokeColor} strokeWidth="2" fill="none" />
            <circle cx="18" cy="12" r="2.2" stroke={strokeColor} strokeWidth="2" fill="none" />
            <line x1="7.9" y1="10.5" x2="10.2" y2="7.7" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="7.9" y1="13.5" x2="10.2" y2="16.3" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="16.1" y1="10.5" x2="13.8" y2="7.7" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="16.1" y1="13.5" x2="13.8" y2="16.3" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );
      case 'network':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="18" r="2.3" fill={strokeColor} opacity="0.85" />
            <circle cx="6" cy="6" r="2.3" fill={strokeColor} opacity="0.55" />
            <circle cx="18" cy="12" r="2.3" fill={strokeColor} opacity="0.85" />
            <line x1="7.2" y1="5.2" x2="16" y2="10.6" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
            <line x1="7.2" y1="18.8" x2="16" y2="13.4" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
            <line x1="6" y1="8.3" x2="6" y2="15.7" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline
              points="2 18 7 12 12 14 16 8 22 10"
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="2 14 6 10 11 8 15 9 22 4"
              stroke={strokeColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </svg>
        );
    }
  };

  // Generate sample data
  const generateTimeSeriesData = (days = 30) => {
    const data = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.random() * 100 + 50,
        value2: Math.random() * 80 + 40,
        value3: Math.random() * 90 + 45
      });
    }
    return data;
  };

  const generateBarData = () => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      label: day,
      value: Math.random() * 100,
      value2: Math.random() * 80
    }));
  };

  const generatePieData = () => {
    return [
      { label: 'Desktop', value: 45, color: '#00d4ff' },
      { label: 'Mobile', value: 30, color: '#ff6384' },
      { label: 'Tablet', value: 15, color: '#ffce56' },
      { label: 'Other', value: 10, color: '#4bc0c0' }
    ];
  };

  useEffect(() => {
    // Load Chart.js from CDN
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => initializeCharts();
      document.head.appendChild(script);
    } else {
      initializeCharts();
    }

    return () => {
      // Cleanup charts
      Object.values(chartRefs).forEach(ref => {
        if (ref.current && ref.current.chart) {
          ref.current.chart.destroy();
        }
      });
    };
  }, [selectedDashboard, timeRange, chartType]);

  const initializeCharts = () => {
    if (!window.Chart) return;

    // Trading Dashboard Chart
    if (chartRefs.trading.current && selectedDashboard === 'trading') {
      const ctx = chartRefs.trading.current.getContext('2d');
      if (chartRefs.trading.current.chart) {
        chartRefs.trading.current.chart.destroy();
      }
      
      const data = generateTimeSeriesData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);
      
      // Handle area chart type (Chart.js uses line with fill)
      const isAreaChart = chartType === 'area';
      const chartTypeToUse = isAreaChart ? 'line' : chartType;
      
      chartRefs.trading.current.chart = new window.Chart(ctx, {
        type: chartTypeToUse,
        data: {
          labels: data.map(d => d.date),
          datasets: [
            {
              label: 'PX_LAST',
              data: data.map(d => d.value),
              borderColor: '#00d4ff',
              backgroundColor: isAreaChart ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 212, 255, 0.1)',
              tension: 0.4,
              fill: isAreaChart || chartType === 'line',
              pointRadius: chartType === 'bar' ? 0 : 4,
              pointHoverRadius: chartType === 'bar' ? 0 : 6,
              borderWidth: chartType === 'bar' ? 0 : 2
            },
            {
              label: 'Heston Price',
              data: data.map(d => d.value2),
              borderColor: '#ff6384',
              backgroundColor: isAreaChart ? 'rgba(255, 99, 132, 0.3)' : 'rgba(255, 99, 132, 0.1)',
              tension: 0.4,
              fill: isAreaChart || chartType === 'line',
              pointRadius: chartType === 'bar' ? 0 : 4,
              pointHoverRadius: chartType === 'bar' ? 0 : 6,
              borderWidth: chartType === 'bar' ? 0 : 2
            },
            {
              label: 'Market Price',
              data: data.map(d => d.value3),
              borderColor: '#4bc0c0',
              backgroundColor: isAreaChart ? 'rgba(75, 192, 192, 0.3)' : 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              fill: isAreaChart || chartType === 'line',
              pointRadius: chartType === 'bar' ? 0 : 4,
              pointHoverRadius: chartType === 'bar' ? 0 : 6,
              borderWidth: chartType === 'bar' ? 0 : 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#e0e0e0',
                font: { size: 12, weight: '600' },
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#00d4ff',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' }
            },
            y: {
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' },
              beginAtZero: false
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          }
        }
      });
    }

    // Analytics Dashboard Chart
    if (chartRefs.analytics.current && selectedDashboard === 'analytics') {
      const ctx = chartRefs.analytics.current.getContext('2d');
      if (chartRefs.analytics.current.chart) {
        chartRefs.analytics.current.chart.destroy();
      }
      
      const barData = generateBarData();
      
      chartRefs.analytics.current.chart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: barData.map(d => d.label),
          datasets: [
            {
              label: 'Revenue',
              data: barData.map(d => d.value),
              backgroundColor: 'rgba(0, 212, 255, 0.8)',
              borderColor: '#00d4ff',
              borderWidth: 2,
              borderRadius: 8
            },
            {
              label: 'Engagement',
              data: barData.map(d => d.value2),
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              borderColor: '#ff6384',
              borderWidth: 2,
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#e0e0e0',
                font: { size: 12, weight: '600' },
                padding: 15
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#00d4ff',
              borderWidth: 1,
              padding: 12
            }
          },
          scales: {
            x: {
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' }
            },
            y: {
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' },
              beginAtZero: true
            }
          },
          animation: {
            duration: 1000
          }
        }
      });
    }

    // ML Dashboard Chart
    if (chartRefs.ml.current && selectedDashboard === 'ml') {
      const ctx = chartRefs.ml.current.getContext('2d');
      if (chartRefs.ml.current.chart) {
        chartRefs.ml.current.chart.destroy();
      }
      
      const pieData = generatePieData();
      
      chartRefs.ml.current.chart = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: pieData.map(d => d.label),
          datasets: [{
            data: pieData.map(d => d.value),
            backgroundColor: pieData.map(d => d.color),
            borderWidth: 3,
            borderColor: 'rgba(15, 23, 42, 0.8)',
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'right',
              labels: {
                color: '#e0e0e0',
                font: { size: 12, weight: '600' },
                padding: 15,
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      return {
                        text: `${label}: ${value}%`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#00d4ff',
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          }
        }
      });
    }

    // Network Dashboard Chart
    if (chartRefs.network.current && selectedDashboard === 'network') {
      const ctx = chartRefs.network.current.getContext('2d');
      if (chartRefs.network.current.chart) {
        chartRefs.network.current.chart.destroy();
      }
      
      const data = generateTimeSeriesData(24);
      
      chartRefs.network.current.chart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((d, i) => `${i}:00`),
          datasets: [
            {
              label: 'Throughput (Gbps)',
              data: data.map(d => d.value / 10),
              borderColor: '#00d4ff',
              backgroundColor: 'rgba(0, 212, 255, 0.2)',
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5,
              yAxisID: 'y'
            },
            {
              label: 'Latency (ms)',
              data: data.map(d => d.value2 / 2),
              borderColor: '#ff6384',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#e0e0e0',
                font: { size: 12, weight: '600' },
                padding: 15
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#00d4ff',
              borderWidth: 1,
              padding: 12
            }
          },
          scales: {
            x: {
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { color: 'rgba(0, 212, 255, 0.1)' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              ticks: { color: '#a0a0a0', font: { size: 11 } },
              grid: { drawOnChartArea: false }
            }
          },
          animation: {
            duration: 1000
          }
        }
      });
    }
  };

  const dashboards = [
    {
      id: 'trading',
      title: 'Options Trading Analytics',
      category: 'Financial Analytics',
      color: '#00d4ff',
      gradient: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)',
      description: 'Real-time options trading visualization with interactive charts, strike analysis, and comprehensive trade logs.',
      stats: { trades: 47, pnl: 1234.56, return: 12.5, data: 1250 }
    },
    {
      id: 'analytics',
      title: 'Business Intelligence',
      category: 'Business Analytics',
      color: '#ff6384',
      gradient: 'linear-gradient(135deg, #ff6384 0%, #cc4e6a 100%)',
      description: 'Comprehensive BI dashboard with multi-dimensional analysis, interactive filters, and real-time KPIs.',
      stats: { users: 12500, engagement: 87.3, growth: 23.5, revenue: 450000 }
    },
    {
      id: 'ml',
      title: 'ML Model Performance',
      category: 'ML/AI Analytics',
      color: '#ffce56',
      gradient: 'linear-gradient(135deg, #ffce56 0%, #cc9e45 100%)',
      description: 'ML model tracking with performance metrics, training curves, and A/B testing comparisons.',
      stats: { accuracy: 94.2, precision: 91.8, recall: 89.5, f1: 90.6 }
    },
    {
      id: 'network',
      title: 'Network Performance',
      category: 'Network Analytics',
      color: '#4bc0c0',
      gradient: 'linear-gradient(135deg, #4bc0c0 0%, #3c9a9a 100%)',
      description: 'Real-time network monitoring with traffic analysis, latency tracking, and security alerts.',
      stats: { throughput: 2.4, latency: 12.3, uptime: 99.9, alerts: 3 }
    }
  ];

  const currentDashboard = dashboards.find(d => d.id === selectedDashboard);

  return (
    <section id="fin-research" className="fin-research-section">
      <h2 className="fin-research-title">Interactive Data Visualization Dashboards</h2>
      <p className="section-subtitle">
        Explore interactive dashboards with real-time charts, filters, and dynamic data visualization
      </p>
      
      <div className="dashboards-container">
        {/* Dashboard Selector */}
        <div className="dashboard-selector">
          {dashboards.map((dashboard) => (
            <button
              key={dashboard.id}
              className={`dashboard-selector-btn ${selectedDashboard === dashboard.id ? 'active' : ''}`}
              onClick={() => setSelectedDashboard(dashboard.id)}
              style={{
                '--dashboard-color': dashboard.color,
                '--dashboard-gradient': dashboard.gradient
              }}
            >
              <span className="dashboard-icon" style={{ background: dashboard.gradient }}>
                {renderDashboardIconGraphic(dashboard.id)}
              </span>
              <div className="dashboard-selector-content">
                <span className="dashboard-selector-category">{dashboard.category}</span>
                <span className="dashboard-selector-title">{dashboard.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Dashboard Display */}
        {currentDashboard && (
          <div className="active-dashboard" style={{ '--dashboard-color': currentDashboard.color }}>
            <div className="dashboard-header">
              <div className="dashboard-header-left">
                <span className="dashboard-category-badge" style={{ background: currentDashboard.gradient }}>
                  {currentDashboard.category}
                </span>
                <h3>{currentDashboard.title}</h3>
                <p className="dashboard-description">{currentDashboard.description}</p>
              </div>
              <div className="dashboard-header-stats">
                {Object.entries(currentDashboard.stats).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="header-stat">
                    <div className="header-stat-value">
                      {typeof value === 'number' && value < 1000 
                        ? value.toFixed(1) 
                        : typeof value === 'number' && value >= 1000
                        ? value.toLocaleString()
                        : value}
                      {key === 'return' || key === 'engagement' || key === 'growth' || key === 'accuracy' || key === 'precision' || key === 'recall' || key === 'f1' || key === 'uptime' ? '%' : ''}
                      {key === 'pnl' || key === 'revenue' ? '$' : ''}
                      {key === 'throughput' ? ' Gbps' : ''}
                      {key === 'latency' ? ' ms' : ''}
                    </div>
                    <div className="header-stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            {(selectedDashboard === 'trading' || selectedDashboard === 'network') && (
              <div className="dashboard-controls">
                <div className="control-group">
                  <label>Time Range</label>
                  <div className="control-buttons">
                    {['7d', '30d', '90d'].map(range => (
                      <button
                        key={range}
                        className={`control-btn ${timeRange === range ? 'active' : ''}`}
                        onClick={() => setTimeRange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDashboard === 'trading' && (
                  <div className="control-group">
                    <label>Chart Type</label>
                    <div className="control-buttons">
                      {['line', 'bar', 'area'].map(type => (
                        <button
                          key={type}
                          className={`control-btn ${chartType === type ? 'active' : ''}`}
                          onClick={() => setChartType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chart Container */}
            <div className="chart-wrapper">
              <canvas 
                ref={chartRefs[selectedDashboard]}
                className="dashboard-chart"
              ></canvas>
            </div>

            {/* Additional Metrics */}
            <div className="dashboard-metrics">
              {Object.entries(currentDashboard.stats).map(([key, value]) => (
                <div key={key} className="metric-card" style={{ '--metric-color': currentDashboard.color }}>
                  <div className="metric-icon">
                    {renderDashboardIconGraphic(currentDashboard.id, currentDashboard.color)}
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {typeof value === 'number' && value < 1000 
                        ? value.toFixed(1) 
                        : typeof value === 'number' && value >= 1000
                        ? value.toLocaleString()
                        : value}
                      {key === 'return' || key === 'engagement' || key === 'growth' || key === 'accuracy' || key === 'precision' || key === 'recall' || key === 'f1' || key === 'uptime' ? '%' : ''}
                      {key === 'pnl' || key === 'revenue' ? '$' : ''}
                      {key === 'throughput' ? ' Gbps' : ''}
                      {key === 'latency' ? ' ms' : ''}
                    </div>
                    <div className="metric-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FinResearch;
