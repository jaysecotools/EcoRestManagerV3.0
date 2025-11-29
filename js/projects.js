// Project Functions
function showProjectForm(projectId = null) {
  try {
    const formContainer = document.getElementById('project-form-container');
    const formTitle = document.getElementById('project-form-title');
    const previewContainer = document.getElementById('photo-preview');
    
    if (projectId) {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;
      
      formTitle.textContent = 'Edit Project';
      document.getElementById('project-id').value = project.id;
      document.getElementById('project-name').value = project.name;
      document.getElementById('project-type').value = project.type;
      document.getElementById('project-status').value = project.status;
      document.getElementById('project-location').value = project.location.name;
      document.getElementById('project-lat').value = project.location.coords[0];
      document.getElementById('project-lng').value = project.location.coords[1];
      document.getElementById('project-start-date').value = project.startDate;
      document.getElementById('project-end-date').value = project.endDate || '';
      document.getElementById('project-area').value = project.area || '';
      document.getElementById('project-budget').value = project.budget || '';
      document.getElementById('project-description').value = project.description || '';
      
      if (state.projectLocationMap && state.projectLocationMarker) {
        state.projectLocationMap.removeLayer(state.projectLocationMarker);
      }
      if (state.projectLocationMap) {
        state.projectLocationMarker = L.marker(project.location.coords).addTo(state.projectLocationMap);
        state.projectLocationMap.setView(project.location.coords, 13);
      }
      
      // Handle photo previews
      previewContainer.innerHTML = '';
      state.tempPhotos.project = [...project.photos];
      
      project.photos.forEach(photo => {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.margin = '5px';
        
        const img = document.createElement('img');
        img.src = photo.data || photo.url;
        img.className = 'photo-thumbnail';
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-photo';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.background = 'rgba(0,0,0,0.5)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '20px';
        deleteBtn.style.height = '20px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = (ev) => {
          ev.stopPropagation();
          imgContainer.remove();
          state.tempPhotos.project = state.tempPhotos.project.filter(p => 
            (p.data !== photo.data) && (p.url !== photo.url)
          );
        };
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        previewContainer.appendChild(imgContainer);
      });
    } else {
      formTitle.textContent = 'Create New Project';
      document.getElementById('project-form').reset();
      previewContainer.innerHTML = '';
      state.tempPhotos.project = [];
      
      if (state.projectLocationMap) {
        const center = state.projectLocationMap.getCenter();
        document.getElementById('project-lat').value = center.lat;
        document.getElementById('project-lng').value = center.lng;
      }
    }
    
    document.getElementById('projects-list').style.display = 'none';
    formContainer.style.display = 'block';
    
    console.log('Project form shown, temp photos:', state.tempPhotos.project.length);
  } catch (error) {
    console.error('Error showing project form:', error);
    showToast('Error loading project form: ' + error.message, 'error');
  }
}

function hideProjectForm() {
  document.getElementById('project-form-container').style.display = 'none';
  document.getElementById('projects-list').style.display = 'grid';
}

function handleProjectSubmit(e) {
  e.preventDefault();
  
  if (!validateProjectForm()) {
    showToast('Please fix the errors in the form', 'error');
    return;
  }
  
  const submitBtn = document.getElementById('project-form-submit');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  
  submitText.textContent = 'Saving...';
  submitSpinner.style.display = 'inline-block';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    try {
      const projectId = document.getElementById('project-id').value;
      const isEdit = !!projectId;
      
      console.log('Saving project, temp photos:', state.tempPhotos.project.length);
      
      const project = {
        id: projectId || 'project-' + Date.now(),
        name: document.getElementById('project-name').value.trim(),
        type: document.getElementById('project-type').value,
        status: document.getElementById('project-status').value,
        location: {
          name: document.getElementById('project-location').value.trim(),
          coords: [
            parseFloat(document.getElementById('project-lat').value),
            parseFloat(document.getElementById('project-lng').value)
          ]
        },
        description: document.getElementById('project-description').value.trim(),
        startDate: document.getElementById('project-start-date').value,
        endDate: document.getElementById('project-end-date').value || null,
        area: document.getElementById('project-area').value ? parseFloat(document.getElementById('project-area').value) : null,
        budget: document.getElementById('project-budget').value ? parseFloat(document.getElementById('project-budget').value) : null,
        photos: [...state.tempPhotos.project], // This should now contain the uploaded photos
        milestones: isEdit ? (state.projects.find(p => p.id === projectId)?.milestones || []) : []
      };
      
      console.log('Project to save:', project);
      console.log('Project photos count:', project.photos.length);
      
      if (isEdit) {
        const index = state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          state.projects[index] = project;
          addActivity(project.id, 'project-update', `Updated project: ${project.name}`);
          showToast('Project updated successfully', 'success');
        }
      } else {
        state.projects.push(project);
        addActivity(project.id, 'project-creation', `Created new project: ${project.name}`);
        showToast('Project created successfully', 'success');
      }
      
      saveData();
      renderProjects();
      updateDashboard();
      hideProjectForm();
      
      // Reset the form and temp photos
      document.getElementById('project-form').reset();
      state.tempPhotos.project = [];
      
      if (typeof updateProjectMapMarkers === 'function') updateProjectMapMarkers();
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('Error saving project: ' + error.message, 'error');
    } finally {
      submitText.textContent = 'Save Project';
      submitSpinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  }, 1000);
}

function validateProjectForm() {
  let isValid = true;
  const errors = {};
  
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  const name = document.getElementById('project-name').value.trim();
  if (!name) {
    errors.name = 'Project name is required';
    isValid = false;
  }
  
  const type = document.getElementById('project-type').value;
  if (!type) {
    errors.type = 'Restoration type is required';
    isValid = false;
  }
  
  const location = document.getElementById('project-location').value.trim();
  if (!location) {
    errors.location = 'Location name is required';
    isValid = false;
  }
  
  const lat = document.getElementById('project-lat').value;
  const lng = document.getElementById('project-lng').value;
  if (!lat || !lng) {
    errors.coords = 'Please select a location on the map';
    isValid = false;
  }
  
  const startDate = document.getElementById('project-start-date').value;
  if (!startDate) {
    errors.startDate = 'Start date is required';
    isValid = false;
  }
  
  Object.keys(errors).forEach(field => {
    const element = document.getElementById(`project-${field}`);
    const errorElement = document.getElementById(`project-${field}-error`);
    if (element && errorElement) {
      element.classList.add('error');
      errorElement.textContent = errors[field];
    }
  });
  
  return isValid;
}

function renderProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  let projectsToShow = [...state.projects];
  
  if (state.currentProjectFilter !== 'all') {
    projectsToShow = projectsToShow.filter(p => p.status === state.currentProjectFilter);
  }
  
  if (state.searchFilters.projects) {
    projectsToShow = projectsToShow.filter(p => 
      p.name.toLowerCase().includes(state.searchFilters.projects) ||
      p.location.name.toLowerCase().includes(state.searchFilters.projects) ||
      p.description.toLowerCase().includes(state.searchFilters.projects)
    );
  }
  
  const typeFilter = document.getElementById('project-type-filter').value;
  if (typeFilter) {
    projectsToShow = projectsToShow.filter(p => p.type === typeFilter);
  }
  
  if (projectsToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-folder-open"></i>
        <p>No projects found</p>
      </div>
    `;
    return;
  }
  
  projectsToShow.forEach(project => {
    const card = document.createElement('div');
    card.className = 'card project-card';
    
    let progress = 0;
    if (project.milestones && project.milestones.length > 0) {
      const completed = project.milestones.filter(m => m.completed).length;
      progress = Math.round((completed / project.milestones.length) * 100);
    }
    
    card.innerHTML = `
      <h3>${escapeHtml(project.name)}</h3>
      <div class="project-meta">
        <span><i class="fas fa-${getProjectIcon(project.type)}"></i> ${project.type}</span>
        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(project.location.name)}</span>
      </div>
      
      ${project.photos && project.photos.length > 0 ? `
        <div style="margin: 10px 0;">
          <img src="${project.photos[0].data || project.photos[0].url}" 
               class="photo-thumbnail" 
               style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
               onclick="viewAllPhotos('${project.id}', 'project')">
          ${project.photos.length > 1 ? `<small>+${project.photos.length - 1} more photos</small>` : ''}
        </div>
      ` : ''}
      
      ${project.description ? `<p style="flex-grow: 1;">${escapeHtml(project.description.substring(0, 100))}${project.description.length > 100 ? '...' : ''}</p>` : ''}
      
      ${progress > 0 ? `
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <small>Progress</small>
            <small>${progress}%</small>
          </div>
          <div style="height: 6px; background-color: #eee; border-radius: 3px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background-color: var(--primary);"></div>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
        <span class="status-badge ${project.status}">${project.status}</span>
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-outline" onclick="viewProjectDetails('${project.id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-outline" onclick="showProjectForm('${project.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline" onclick="deleteProject('${project.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    return;
  }
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    
    state.monitoringPoints = state.monitoringPoints.filter(p => p.projectId !== projectId);
    state.projects = state.projects.filter(p => p.id !== projectId);
    addActivity(null, 'project-deletion', `Deleted project: ${project.name}`);
    
    saveData();
    renderProjects();
    updateDashboard();
    if (typeof updateProjectMapMarkers === 'function') updateProjectMapMarkers();
    
    showToast('Project deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting project:', error);
    showToast('Error deleting project: ' + error.message, 'error');
  }
}

function viewProjectDetails(projectId) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;
  
  state.currentProject = project;
  
  const modal = document.getElementById('project-modal');
  const title = document.getElementById('modal-project-title');
  const content = document.getElementById('modal-project-content');
  
  title.textContent = project.name;
  
  let progress = 0;
  if (project.milestones && project.milestones.length > 0) {
    const completed = project.milestones.filter(m => m.completed).length;
    progress = Math.round((completed / project.milestones.length) * 100);
  }
  
  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing';
  
  content.innerHTML = `
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 20px;">
      <div>
        <h3>Project Overview</h3>
        <p>${project.description || 'No description provided.'}</p>
        
        <div class="project-meta" style="margin: 15px 0;">
          <span><i class="fas fa-${getProjectIcon(project.type)}"></i> ${project.type} Restoration</span>
          <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(project.location.name)}</span>
          <span><i class="fas fa-calendar"></i> ${startDate} - ${endDate}</span>
        </div>
        
        ${project.area ? `<p><strong>Area:</strong> ${project.area} hectares</p>` : ''}
        ${project.budget ? `<p><strong>Budget:</strong> $${project.budget.toLocaleString()}</p>` : ''}
        
        <div style="margin: 20px 0;">
          <h4>Progress</h4>
          <div style="height: 10px; background-color: #eee; border-radius: 5px; overflow: hidden; margin:10px 0;">
            <div style="width: ${progress}%; height: 100%; background-color: var(--primary);"></div>
          </div>
          <p>${progress}% complete</p>
        </div>
      </div>
      
      <div>
        <h4>Quick Stats</h4>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <p><strong>Status:</strong> <span class="status-badge ${project.status}">${project.status}</span></p>
          <p><strong>Monitoring Points:</strong> ${state.monitoringPoints.filter(p => p.projectId === projectId).length}</p>
          <p><strong>Team Members:</strong> ${state.teamMembers.filter(m => m.projects.includes(projectId)).length}</p>
        </div>
        
        <h4 style="margin-top: 20px;">Project Photos (${project.photos.length})</h4>
        <div class="photo-preview" style="margin-top: 10px;">
          ${project.photos.length > 0 ? 
            project.photos.slice(0, 3).map(photo => 
              `<img src="${photo.data || photo.url}" 
                    class="photo-thumbnail" 
                    style="width: 80px; height: 80px; cursor: pointer;"
                    onclick="viewAllPhotos('${project.id}', 'project')">`
            ).join('') : 
            '<p>No photos yet</p>'
          }
          ${project.photos.length > 3 ? 
            `<button class="btn btn-outline" onclick="viewAllPhotos('${project.id}', 'project')" style="margin-left: 10px;">
               View All ${project.photos.length} Photos
             </button>` : 
            ''
          }
        </div>
      </div>
    </div>
    
    <div class="project-detail-map-container">
      <h3>Project Location</h3>
      <div id="project-detail-map" class="map-container"></div>
    </div>
    
    ${project.milestones && project.milestones.length > 0 ? `
      <div style="margin-top: 20px;">
        <h3>Project Timeline</h3>
        <div class="timeline">
          ${project.milestones.map(milestone => `
            <div class="timeline-item">
              <div class="timeline-date">${new Date(milestone.date).toLocaleDateString()}</div>
              <div class="timeline-content">
                <h4>${milestone.name} ${milestone.completed ? '<span class="status-badge completed" style="font-size: 0.7rem;">Completed</span>' : '<span class="status-badge planned" style="font-size: 0.7rem;">Pending</span>'}</h4>
                <p>${milestone.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
  
  modal.style.display = 'flex';
  
  // Initialize the project detail map after the modal is displayed
  setTimeout(() => {
    if (typeof initProjectDetailMap === 'function') initProjectDetailMap(project);
  }, 100);
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.style.display = 'none';
}

function editCurrentProject() {
  if (state.currentProject) {
    showProjectForm(state.currentProject.id);
    closeModal();
  }
}

function setProjectFilter(status) {
  state.currentProjectFilter = status;
  
  const projectTabs = document.querySelectorAll('#projects .tab');
  projectTabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.textContent.toLowerCase().includes(status)) {
      tab.classList.add('active');
    }
  });
  
  renderProjects();
}

function filterProjects() {
  const searchTerm = document.getElementById('project-search').value.toLowerCase();
  const typeFilter = document.getElementById('project-type-filter').value;
  
  state.searchFilters.projects = searchTerm;
  renderProjects();
}
