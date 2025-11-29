// Monitoring Functions
function showMonitoringTab(tabId) {
  try {
    const monitoringSection = document.getElementById('monitoring');
    const monitoringTabs = monitoringSection.querySelectorAll('.tab');
    const monitoringContents = monitoringSection.querySelectorAll('.tab-content');
    
    monitoringTabs.forEach(tab => tab.classList.remove('active'));
    monitoringContents.forEach(content => content.classList.remove('active'));
    
    const activeTab = Array.from(monitoringTabs).find(tab => 
      tab.textContent.toLowerCase().includes(tabId)
    );
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    const activeContent = document.getElementById(`monitoring-${tabId}`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
    
    if (tabId === 'new') {
      populateProjectDropdown('monitoring-project');
      document.getElementById('monitoring-photo-preview').innerHTML = '';
      state.tempPhotos.monitoring = [];
    } else if (tabId === 'observations') {
      renderObservations();
    }
  } catch (error) {
    console.error('Error showing monitoring tab:', error);
    showToast('Error switching tabs: ' + error.message, 'error');
  }
}

function renderMonitoringPoints(projectFilter = '') {
  const container = document.getElementById('monitoring-points-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  let pointsToShow = [...state.monitoringPoints];
  
  if (projectFilter) {
    pointsToShow = pointsToShow.filter(p => p.projectId === projectFilter);
  }
  
  if (state.searchFilters.monitoring) {
    pointsToShow = pointsToShow.filter(p => 
      p.name.toLowerCase().includes(state.searchFilters.monitoring)
    );
  }
  
  if (pointsToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-binoculars"></i>
        <p>No monitoring points found</p>
      </div>
    `;
    return;
  }
  
  pointsToShow.forEach(point => {
    const project = state.projects.find(p => p.id === point.projectId);
    const card = document.createElement('div');
    card.className = 'card project-card';
    
    // Show first photo if available
    const firstPhoto = point.photos && point.photos.length > 0 ? point.photos[0] : null;
    
    card.innerHTML = `
      <h3>${escapeHtml(point.name)}</h3>
      <div class="project-meta">
        <span><i class="fas fa-${getMonitoringIcon(point.type)}"></i> ${point.type}</span>
        <span><i class="fas fa-folder"></i> ${project ? escapeHtml(project.name) : 'Unknown Project'}</span>
      </div>
      
      ${firstPhoto ? `
        <div style="margin: 10px 0;">
          <img src="${firstPhoto.data || firstPhoto.url}" 
               class="photo-thumbnail" 
               style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
               onclick="viewAllPhotos('${point.id}', 'monitoring')">
          ${point.photos.length > 1 ? `<small>+${point.photos.length - 1} more photos</small>` : ''}
        </div>
      ` : ''}
      
      <p><strong>Observations:</strong> ${point.observations ? point.observations.length : 0}</p>
      <p><strong>Last Observation:</strong> ${point.observations && point.observations.length > 0 ? 
        new Date(point.observations[point.observations.length - 1].date).toLocaleDateString() : 
        'Never'}</p>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-outline" onclick="addObservation('${point.id}')">
            <i class="fas fa-plus"></i> Observation
          </button>
          <button class="btn btn-outline" onclick="viewObservations('${point.id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
        <button class="btn btn-outline" onclick="deleteMonitoringPoint('${point.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterMonitoringPoints() {
  const searchTerm = document.getElementById('monitoring-search').value.toLowerCase();
  const projectFilter = document.getElementById('monitoring-project-filter').value;
  
  state.searchFilters.monitoring = searchTerm;
  renderMonitoringPoints(projectFilter);
}

function handleMonitoringSubmit(e) {
  e.preventDefault();
  
  const monitoringId = document.getElementById('monitoring-id').value;
  const projectId = document.getElementById('monitoring-project').value;
  const name = document.getElementById('monitoring-name').value.trim();
  const type = document.getElementById('monitoring-type').value;
  const lat = document.getElementById('monitoring-lat').value;
  const lng = document.getElementById('monitoring-lng').value;
  
  if (!projectId || !name || !type || !lat || !lng) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const monitoringPoint = {
    id: monitoringId || 'monitoring-' + Date.now(),
    projectId: projectId,
    name: name,
    type: type,
    coords: [parseFloat(lat), parseFloat(lng)],
    photos: [...state.tempPhotos.monitoring],
    observations: monitoringId ? 
      (state.monitoringPoints.find(m => m.id === monitoringId)?.observations || []) : []
  };
  
  if (monitoringId) {
    const index = state.monitoringPoints.findIndex(m => m.id === monitoringId);
    if (index !== -1) {
      state.monitoringPoints[index] = monitoringPoint;
    }
  } else {
    state.monitoringPoints.push(monitoringPoint);
  }
  
  saveData();
  renderMonitoringPoints();
  showMonitoringTab('all');
  showToast('Monitoring point saved successfully', 'success');
}

function deleteMonitoringPoint(pointId) {
  if (!confirm('Are you sure you want to delete this monitoring point? All observations will also be deleted.')) {
    return;
  }
  
  state.monitoringPoints = state.monitoringPoints.filter(p => p.id !== pointId);
  saveData();
  renderMonitoringPoints();
  showToast('Monitoring point deleted', 'success');
}

// Observation Functions
function addObservation(pointId) {
  state.currentMonitoringPoint = state.monitoringPoints.find(p => p.id === pointId);
  if (!state.currentMonitoringPoint) return;
  
  const modal = document.getElementById('observation-modal');
  const title = document.getElementById('modal-observation-title');
  
  title.textContent = `Add Observation for ${state.currentMonitoringPoint.name}`;
  document.getElementById('observation-point-id').value = pointId;
  document.getElementById('observation-id').value = '';
  document.getElementById('observation-form').reset();
  document.getElementById('observation-photo-preview').innerHTML = '';
  state.tempPhotos.observation = [];
  
  modal.style.display = 'flex';
}

function closeObservationModal() {
  const modal = document.getElementById('observation-modal');
  if (modal) modal.style.display = 'none';
}

function handleObservationSubmit(e) {
  e.preventDefault();
  
  const pointId = document.getElementById('observation-point-id').value;
  const observationId = document.getElementById('observation-id').value;
  const date = document.getElementById('observation-date').value;
  const notes = document.getElementById('observation-notes').value.trim();
  
  if (!date || !notes) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const observation = {
    id: observationId || 'obs-' + Date.now(),
    date: date,
    notes: notes,
    weather: document.getElementById('observation-weather').value.trim(),
    temp: document.getElementById('observation-temp').value ? parseFloat(document.getElementById('observation-temp').value) : null,
    photos: [...state.tempPhotos.observation]
  };
  
  const pointIndex = state.monitoringPoints.findIndex(p => p.id === pointId);
  if (pointIndex === -1) return;
  
  if (observationId) {
    const obsIndex = state.monitoringPoints[pointIndex].observations.findIndex(o => o.id === observationId);
    if (obsIndex !== -1) {
      state.monitoringPoints[pointIndex].observations[obsIndex] = observation;
    }
  } else {
    if (!state.monitoringPoints[pointIndex].observations) {
      state.monitoringPoints[pointIndex].observations = [];
    }
    state.monitoringPoints[pointIndex].observations.push(observation);
  }
  
  saveData();
  renderMonitoringPoints();
  closeObservationModal();
  showToast('Observation saved successfully', 'success');
}

function filterObservations() {
  renderObservations();
}

function renderObservations() {
  const container = document.getElementById('observations-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  const allObservations = [];
  state.monitoringPoints.forEach(point => {
    if (point.observations) {
      point.observations.forEach(obs => {
        allObservations.push({
          ...obs,
          pointName: point.name,
          projectId: point.projectId,
          pointId: point.id
        });
      });
    }
  });
  
  let filteredObservations = [...allObservations];
  
  const projectFilter = document.getElementById('observation-project').value;
  if (projectFilter) {
    filteredObservations = filteredObservations.filter(obs => 
      obs.projectId === projectFilter
    );
  }
  
  const dateFilter = document.getElementById('observation-date-filter').value;
  const today = new Date();
  if (dateFilter === 'today') {
    filteredObservations = filteredObservations.filter(obs => 
      new Date(obs.date).toDateString() === today.toDateString()
    );
  } else if (dateFilter === 'week') {
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    filteredObservations = filteredObservations.filter(obs => 
      new Date(obs.date) >= weekAgo
    );
  } else if (dateFilter === 'month') {
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    filteredObservations = filteredObservations.filter(obs => 
      new Date(obs.date) >= monthAgo
    );
  }
  
  filteredObservations.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filteredObservations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-binoculars"></i>
        <p>No observations found</p>
      </div>
    `;
    return;
  }
  
  filteredObservations.forEach(obs => {
    const project = state.projects.find(p => p.id === obs.projectId);
    const point = state.monitoringPoints.find(p => p.id === obs.pointId);
    
    const observationCard = document.createElement('div');
    observationCard.className = 'observation-card';
    observationCard.innerHTML = `
      <div class="observation-header">
        <div class="observation-point">${point ? point.name : 'Unknown Point'} - ${project ? project.name : 'Unknown Project'}</div>
        <div class="observation-date">${new Date(obs.date).toLocaleDateString()}</div>
      </div>
      <p>${escapeHtml(obs.notes)}</p>
      ${obs.weather ? `<p><strong>Weather:</strong> ${obs.weather}</p>` : ''}
      ${obs.temp ? `<p><strong>Temperature:</strong> ${obs.temp}°C</p>` : ''}
      ${obs.photos && obs.photos.length > 0 ? `
        <div class="photo-preview" style="margin-top: 10px;">
          ${obs.photos.map(photo => `
            <img src="${photo.data || photo.url}" 
                 class="photo-thumbnail" 
                 style="width: 60px; height: 60px; cursor: pointer;"
                 onclick="viewAllPhotos('${obs.id}', 'observation')">
          `).join('')}
        </div>
      ` : ''}
    `;
    container.appendChild(observationCard);
  });
}

function viewObservations(pointId) {
  const point = state.monitoringPoints.find(p => p.id === pointId);
  if (!point) return;
  
  showMonitoringTab('observations');
  document.getElementById('observation-project').value = point.projectId;
  
  setTimeout(() => {
    filterObservations();
  }, 100);
}