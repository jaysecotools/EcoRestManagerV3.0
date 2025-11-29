// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  try {
    showLoading(true);
    loadData();
    initNavigation();
    renderProjects();
    renderMonitoringPoints();
    renderTeamMembers();
    updateDashboard();
    initCharts();
    
    setTimeout(() => {
      initMaps();
      updateCharts();
      showLoading(false);
    }, 100);
    
    // Form event listeners
    document.addEventListener('submit', function(e) {
      if (e.target.matches('#project-form')) {
        e.preventDefault();
        handleProjectSubmit(e);
      } else if (e.target.matches('#monitoring-form')) {
        e.preventDefault();
        handleMonitoringSubmit(e);
      } else if (e.target.matches('#report-form')) {
        e.preventDefault();
        handleReportSubmit(e);
      } else if (e.target.matches('#team-member-form')) {
        e.preventDefault();
        handleTeamMemberSubmit(e);
      } else if (e.target.matches('#observation-form')) {
        e.preventDefault();
        handleObservationSubmit(e);
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.matches('.dropdown a') && !event.target.closest('.dropdown-content')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.style.display === 'block') {
            openDropdown.style.display = 'none';
          }
        }
      }
    });

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('project-start-date').value = today;
    document.getElementById('observation-date').value = today;
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById('project-end-date').value = nextYear.toISOString().split('T')[0];
    
    const firstDay = new Date();
    firstDay.setDate(1);
    document.getElementById('report-start-date').value = firstDay.toISOString().split('T')[0];
    document.getElementById('report-end-date').value = today;
    
    initTooltips();
    populateProjectDropdown('monitoring-project-filter');
    populateProjectDropdown('observation-project');
    populateProjectDropdown('report-project');
    
  } catch (error) {
    console.error('Error during initialization:', error);
    showToast('Error initializing application: ' + error.message, 'error');
    showLoading(false);
  }
});

// Divine Handlers - Event listeners for HTML elements
document.getElementById('divine-handler-onclick-1764374051331-0').addEventListener('click', function(event) {
  showProjectForm()
});

document.getElementById('divine-handler-onclick-1764374051331-1').addEventListener('click', function(event) {
  setProjectFilter('all')
});

document.getElementById('divine-handler-onclick-1764374051331-2').addEventListener('click', function(event) {
  setProjectFilter('active')
});

document.getElementById('divine-handler-onclick-1764374051331-3').addEventListener('click', function(event) {
  setProjectFilter('planned')
});

document.getElementById('divine-handler-onclick-1764374051331-4').addEventListener('click', function(event) {
  setProjectFilter('completed')
});

document.getElementById('photo-upload').addEventListener('click', function(event) {
  document.getElementById('project-photos').click()
});

document.getElementById('divine-handler-onclick-1764374051331-6').addEventListener('click', function(event) {
  hideProjectForm()
});

document.getElementById('divine-handler-onclick-1764374051331-7').addEventListener('click', function(event) {
  showMonitoringTab('all')
});

document.getElementById('divine-handler-onclick-1764374051331-8').addEventListener('click', function(event) {
  showMonitoringTab('new')
});

document.getElementById('divine-handler-onclick-1764374051331-9').addEventListener('click', function(event) {
  showMonitoringTab('observations')
});

document.getElementById('monitoring-photo-upload').addEventListener('click', function(event) {
  document.getElementById('monitoring-photos').click()
});

document.getElementById('divine-handler-onclick-1764374051331-11').addEventListener('click', function(event) {
  showMonitoringTab('all')
});

document.getElementById('divine-handler-onclick-1764374051331-12').addEventListener('click', function(event) {
  showTeamMemberForm()
});

document.getElementById('divine-handler-onclick-1764374051331-13').addEventListener('click', function(event) {
  hideTeamMemberForm()
});

document.getElementById('divine-handler-onclick-1764374051331-14').addEventListener('click', function(event) {
  exportData()
});

document.getElementById('divine-handler-onclick-1764374051331-15').addEventListener('click', function(event) {
  document.getElementById('import-file').click()
});

document.getElementById('divine-handler-onclick-1764374051331-16').addEventListener('click', function(event) {
  backupData()
});

document.getElementById('divine-handler-onclick-1764374051331-17').addEventListener('click', function(event) {
  closeModal()
});

document.getElementById('divine-handler-onclick-1764374051331-18').addEventListener('click', function(event) {
  closeModal()
});

document.getElementById('divine-handler-onclick-1764374051331-19').addEventListener('click', function(event) {
  editCurrentProject()
});

document.getElementById('divine-handler-onclick-1764374051331-20').addEventListener('click', function(event) {
  closeObservationModal()
});

document.getElementById('observation-photo-upload').addEventListener('click', function(event) {
  document.getElementById('observation-photos').click()
});

document.getElementById('divine-handler-onclick-1764374051331-22').addEventListener('click', function(event) {
  closeObservationModal()
});

document.getElementById('project-type-filter').addEventListener('change', function(event) {
  filterProjects()
});

document.getElementById('project-photos').addEventListener('change', function(event) {
  handlePhotoUpload(this.files, 'project')
});

document.getElementById('monitoring-project-filter').addEventListener('change', function(event) {
  filterMonitoringPoints()
});

document.getElementById('monitoring-photos').addEventListener('change', function(event) {
  handlePhotoUpload(this.files, 'monitoring')
});

document.getElementById('observation-project').addEventListener('change', function(event) {
  filterObservations()
});

document.getElementById('observation-date-filter').addEventListener('change', function(event) {
  filterObservations()
});

document.getElementById('team-role-filter').addEventListener('change', function(event) {
  filterTeamMembers()
});

document.getElementById('observation-photos').addEventListener('change', function(event) {
  handlePhotoUpload(this.files, 'observation')
});

document.getElementById('import-file').addEventListener('change', function(event) {
  importData(this.files)
});