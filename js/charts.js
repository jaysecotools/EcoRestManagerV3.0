// Chart Functions
function initCharts() {
  try {
    const statusCtx = document.getElementById('project-status-chart');
    if (statusCtx) {
      state.charts.statusChart = new Chart(statusCtx.getContext('2d'), {
        type: 'doughnut',
        data: { 
          labels: ['Active', 'Planned', 'Completed', 'On Hold'], 
          datasets: [{
            data: [0, 0, 0, 0], 
            backgroundColor: ['#2e7d32', '#ff8f00', '#0288d1', '#d32f2f']
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
    }
    
    const typesCtx = document.getElementById('restoration-types-chart');
    if (typesCtx) {
      state.charts.typesChart = new Chart(typesCtx.getContext('2d'), {
        type: 'bar',
        data: { 
          labels: [], 
          datasets: [{
            label: 'Projects', 
            data: [], 
            backgroundColor: '#2e7d32'
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
    
    const timelineCtx = document.getElementById('project-timeline-chart');
    if (timelineCtx) {
      state.charts.timelineChart = new Chart(timelineCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Project Timeline',
            data: [],
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Projects'
              }
            }
          }
        }
      });
    }
    
    const frequencyCtx = document.getElementById('monitoring-frequency-chart');
    if (frequencyCtx) {
      state.charts.frequencyChart = new Chart(frequencyCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Observations per Month',
            data: [],
            backgroundColor: '#ff8f00'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Observations'
              }
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

function updateCharts() {
  try {
    if (state.charts.statusChart) {
      const statusCounts = {
        active: state.projects.filter(p => p.status === 'active').length,
        planned: state.projects.filter(p => p.status === 'planned').length,
        completed: state.projects.filter(p => p.status === 'completed').length,
        'on-hold': state.projects.filter(p => p.status === 'on-hold').length
      };
      
      state.charts.statusChart.data.datasets[0].data = [
        statusCounts.active,
        statusCounts.planned,
        statusCounts.completed,
        statusCounts['on-hold']
      ];
      state.charts.statusChart.update();
    }
    
    if (state.charts.typesChart) {
      const typeCounts = {};
      state.projects.forEach(project => {
        typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
      });
      
      state.charts.typesChart.data.labels = Object.keys(typeCounts).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1));
      state.charts.typesChart.data.datasets[0].data = Object.values(typeCounts);
      state.charts.typesChart.update();
    }
    
    if (state.charts.timelineChart) {
      const monthlyData = {};
      state.projects.forEach(project => {
        const month = project.startDate.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      
      const sortedMonths = Object.keys(monthlyData).sort();
      state.charts.timelineChart.data.labels = sortedMonths;
      state.charts.timelineChart.data.datasets[0].data = sortedMonths.map(month => monthlyData[month]);
      state.charts.timelineChart.update();
    }
    
    if (state.charts.frequencyChart) {
      const observationCounts = {};
      state.monitoringPoints.forEach(point => {
        if (point.observations) {
          point.observations.forEach(obs => {
            const month = obs.date.substring(0, 7);
            observationCounts[month] = (observationCounts[month] || 0) + 1;
          });
        }
      });
      
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toISOString().substring(0, 7));
      }
      
      state.charts.frequencyChart.data.labels = months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      
      state.charts.frequencyChart.data.datasets[0].data = months.map(month => 
        observationCounts[month] || 0
      );
      state.charts.frequencyChart.update();
    }
    
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}