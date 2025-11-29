// Data Management Functions
function loadData() {
  try {
    const savedProjects = localStorage.getItem('erpm-projects');
    const savedMonitoring = localStorage.getItem('erpm-monitoring');
    const savedActivities = localStorage.getItem('erpm-activities');
    const savedTeam = localStorage.getItem('erpm-team');
    
    if (savedProjects) state.projects = JSON.parse(savedProjects);
    if (savedMonitoring) state.monitoringPoints = JSON.parse(savedMonitoring);
    if (savedActivities) state.activities = JSON.parse(savedActivities);
    if (savedTeam) state.teamMembers = JSON.parse(savedTeam);
    
    // Load sample data if no data exists
    if (state.projects.length === 0) {
      state.projects = [
        {
          id: '1',
          name: 'Riverside Wetland Restoration',
          type: 'wetland',
          status: 'active',
          location: {
            name: 'Smith River, NSW',
            coords: [-33.8688, 151.2093]
          },
          description: 'Restoring 5ha of degraded wetland habitat with native vegetation and improving water quality.',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          area: 5.2,
          budget: 125000,
          photos: [],
          milestones: [
            {
              id: '1',
              name: 'Site Assessment',
              date: '2023-01-15',
              completed: true,
              description: 'Initial ecological assessment completed'
            },
            {
              id: '2',
              name: 'Planting Phase 1',
              date: '2023-03-20',
              completed: true,
              description: 'Planted 200 native sedges and 50 trees'
            },
            {
              id: '3',
              name: 'Planting Phase 2',
              date: '2023-06-15',
              completed: false,
              description: 'Plant remaining vegetation'
            }
          ]
        }
      ];
      saveData();
    }
    
    if (state.monitoringPoints.length === 0) {
      state.monitoringPoints = [
        {
          id: 'monitoring-1',
          projectId: '1',
          name: 'Wetland Vegetation Plot A',
          type: 'vegetation',
          coords: [-33.8690, 151.2095],
          photos: [],
          observations: []
        }
      ];
      saveData();
    }
    
    if (state.teamMembers.length === 0) {
      state.teamMembers = [
        {
          id: 'member-1',
          name: 'John Smith',
          role: 'project-manager',
          email: 'john.smith@example.com',
          phone: '+61 412 345 678',
          status: 'active',
          projects: ['1']
        }
      ];
      saveData();
    }
    
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('Error loading saved data: ' + error.message, 'error');
  }
}

function saveData() {
  try {
    localStorage.setItem('erpm-projects', JSON.stringify(state.projects));
    localStorage.setItem('erpm-monitoring', JSON.stringify(state.monitoringPoints));
    localStorage.setItem('erpm-activities', JSON.stringify(state.activities));
    localStorage.setItem('erpm-team', JSON.stringify(state.teamMembers));
  } catch (error) {
    console.error('Error saving data:', error);
    showToast('Error saving data: ' + error.message, 'error');
  }
}

function exportData() {
  try {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      projects: state.projects,
      monitoringPoints: state.monitoringPoints,
      activities: state.activities,
      teamMembers: state.teamMembers
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `erpm-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('Error exporting data: ' + error.message, 'error');
  }
}

function backupData() {
  try {
    const data = {
      version: 2,
      backedUpAt: new Date().toISOString(),
      projects: state.projects,
      monitoringPoints: state.monitoringPoints,
      activities: state.activities,
      teamMembers: state.teamMembers
    };
    
    const backupKey = `erpm-backup-${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('erpm-backup-'));
    if (backupKeys.length > 5) {
      backupKeys.sort().slice(0, -5).forEach(key => localStorage.removeItem(key));
    }
    
    showToast('Data backed up successfully', 'success');
  } catch (error) {
    console.error('Error backing up data:', error);
    showToast('Error backing up data: ' + error.message, 'error');
  }
}

function importData(files) {
  if (!files || files.length === 0) return;
  
  const file = files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!data.projects || !data.monitoringPoints || !data.activities || !data.teamMembers) {
        throw new Error('Invalid data format: Missing required data sections');
      }
      
      if (!confirm('Importing data will replace all current data. Continue?')) {
        return;
      }
      
      state.projects = data.projects;
      state.monitoringPoints = data.monitoringPoints;
      state.activities = data.activities;
      state.teamMembers = data.teamMembers;
      
      saveData();
      // Use setTimeout to ensure these functions are available
      setTimeout(() => {
        if (typeof renderProjects === 'function') renderProjects();
        if (typeof renderMonitoringPoints === 'function') renderMonitoringPoints();
        if (typeof renderTeamMembers === 'function') renderTeamMembers();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateProjectMapMarkers === 'function') updateProjectMapMarkers();
      }, 100);
      
      showToast('Data imported successfully', 'success');
    } catch (error) {
      console.error('Error importing data:', error);
      showToast('Error importing data: ' + error.message, 'error');
    }
  };
  
  reader.onerror = function() {
    showToast('Error reading file', 'error');
  };
  
  reader.readAsText(file);
}

function updateDataSection() {
  document.getElementById('data-projects-count').textContent = state.projects.length;
  
  const totalObservations = state.monitoringPoints.reduce((sum, point) => 
    sum + (point.observations ? point.observations.length : 0), 0
  );
  document.getElementById('data-monitoring-count').textContent = state.monitoringPoints.length;
  document.getElementById('data-observations-count').textContent = totalObservations;
  document.getElementById('data-team-count').textContent = state.teamMembers.length;
  
  updateStorageInfo();
}

function updateStorageInfo() {
  try {
    let totalSize = 0;
    const keys = ['erpm-projects', 'erpm-monitoring', 'erpm-activities', 'erpm-team'];
    
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });
    
    const storageInfo = document.getElementById('storage-info');
    if (storageInfo) {
      storageInfo.innerHTML = `
        <p><strong>Total Data Size:</strong> ${(totalSize / 1024).toFixed(2)} KB</p>
        <p><strong>Last Backup:</strong> ${getLastBackupDate()}</p>
        <p><strong>Data Version:</strong> 2.0</p>
      `;
    }
  } catch (error) {
    console.error('Error updating storage info:', error);
  }
}

function getLastBackupDate() {
  const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('erpm-backup-'));
  if (backupKeys.length === 0) return 'Never';
  
  const latestBackup = backupKeys.sort().pop();
  const timestamp = latestBackup.replace('erpm-backup-', '');
  return new Date(timestamp).toLocaleDateString();
}