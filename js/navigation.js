// Navigation Functions
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
    });
  });
}

function showSection(sectionId) {
  try {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
    }
    
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Special handling for different sections
    switch(sectionId) {
      case 'reports':
        setTimeout(() => {
          if (typeof updateCharts === 'function') updateCharts();
        }, 100);
        break;
      case 'data':
        if (typeof updateDataSection === 'function') updateDataSection();
        break;
      case 'monitoring':
        if (typeof populateProjectDropdown === 'function') {
          populateProjectDropdown('monitoring-project');
          populateProjectDropdown('observation-project');
          populateProjectDropdown('monitoring-project-filter');
        }
        break;
      case 'team':
        if (typeof populateProjectDropdown === 'function') {
          populateProjectDropdown('team-member-projects', true);
        }
        break;
    }
    
    state.selectedTab = sectionId;
  } catch (error) {
    console.error('Error showing section:', error);
    showToast('Error navigating: ' + error.message, 'error');
  }
}

function updateDashboard() {
  try {
    const activeProjectsCount = state.projects.filter(p => p.status === 'active').length;
    document.getElementById('active-projects-count').textContent = activeProjectsCount;
    document.getElementById('total-projects-count').textContent = state.projects.length;
    
    document.getElementById('monitoring-points-count').textContent = state.monitoringPoints.length;
    const totalObservations = state.monitoringPoints.reduce((sum, point) => sum + (point.observations ? point.observations.length : 0), 0);
    document.getElementById('total-observations-count').textContent = totalObservations;
    
    let pendingActions = 0;
    let overdueActions = 0;
    const today = new Date();
    
    state.projects.forEach(project => {
      if (project.milestones) {
        project.milestones.forEach(milestone => {
          if (!milestone.completed) {
            pendingActions++;
            if (new Date(milestone.date) < today) {
              overdueActions++;
            }
          }
        });
      }
    });
    
    document.getElementById('pending-actions-count').textContent = pendingActions;
    document.getElementById('overdue-actions-count').textContent = overdueActions;
    
    document.getElementById('team-members-count').textContent = state.teamMembers.length;
    document.getElementById('active-team-count').textContent = 
      state.teamMembers.filter(m => m.status === 'active').length;
    
    const activitiesContainer = document.getElementById('recent-activities');
    if (activitiesContainer) {
      activitiesContainer.innerHTML = '';
      
      if (state.activities.length === 0) {
        activitiesContainer.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No recent activities</p>
          </div>
        `;
        return;
      }
      
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      
      state.activities.slice(0, 5).forEach(activity => {
        const project = activity.projectId ? state.projects.find(p => p.id === activity.projectId) : null;
        const li = document.createElement('li');
        li.style.padding = '10px 0';
        li.style.borderBottom = '1px solid #eee';
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>${activity.type.replace('-', ' ')}</strong>
              ${project ? ` for ${escapeHtml(project.name)}` : ''}
            </div>
            <small>${new Date(activity.date).toLocaleDateString()}</small>
          </div>
          <div>${escapeHtml(activity.description)}</div>
        `;
        ul.appendChild(li);
      });
      
      if (state.activities.length > 5) {
        const li = document.createElement('li');
        li.style.padding = '10px 0';
        li.style.textAlign = 'center';
        li.innerHTML = `<a href="#" style="color: var(--primary);">View all activities</a>`;
        ul.appendChild(li);
      }
      
      activitiesContainer.appendChild(ul);
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}