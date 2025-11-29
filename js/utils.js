// Utility Functions
function showLoading(show) {
  document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getStatusColor(status) {
  const colors = {
    active: '#2e7d32',
    planned: '#ff8f00',
    completed: '#0288d1',
    'on-hold': '#d32f2f'
  };
  return colors[status] || '#2e7d32';
}

function getProjectIcon(type) {
  const icons = {
    riparian: 'water',
    coastal: 'umbrella-beach',
    wetland: 'frog',
    forest: 'tree',
    grassland: 'mountain',
    urban: 'city',
    mine: 'mountain',
    agricultural: 'tractor'
  };
  return icons[type] || 'leaf';
}

function getMonitoringIcon(type) {
  const icons = {
    vegetation: 'leaf',
    'water-quality': 'tint',
    wildlife: 'paw',
    soil: 'mountain',
    erosion: 'water'
  };
  return icons[type] || 'binoculars';
}

function populateProjectDropdown(selectId, multiple = false) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const currentValue = select.value;
  select.innerHTML = '';
  
  if (!multiple && selectId !== 'observation-project' && selectId !== 'report-project' && selectId !== 'monitoring-project-filter') {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a project';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
  }
  
  state.projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    select.appendChild(option);
  });
  
  if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
    select.value = currentValue;
  }
}

function handlePhotoUpload(files, type) {
  const previewContainer = document.getElementById(`${type}-photo-preview`);
  if (!previewContainer) return;
  
  Array.from(files).forEach(file => {
    if (!file.type.match('image.*')) {
      showToast('Please select image files only', 'warning');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size too large. Please select files smaller than 2MB.', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgContainer = document.createElement('div');
      imgContainer.style.position = 'relative';
      imgContainer.style.display = 'inline-block';
      imgContainer.style.margin = '5px';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'photo-thumbnail';
      img.style.objectFit = 'cover';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-photo';
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.onclick = (ev) => {
        ev.stopPropagation();
        imgContainer.remove();
        state.tempPhotos[type] = state.tempPhotos[type].filter(p => p.data !== e.target.result);
      };
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);
      previewContainer.appendChild(imgContainer);
      
      // Store photo data
      state.tempPhotos[type].push({
        id: 'photo-' + Date.now() + Math.random(),
        name: file.name,
        data: e.target.result,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });
    };
    
    reader.onerror = function() {
      showToast('Error reading file: ' + file.name, 'error');
    };
    
    reader.readAsDataURL(file);
  });
}

function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = this.getAttribute('data-tooltip');
  document.body.appendChild(tooltip);
  
  const rect = this.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
  
  this.tooltipElement = tooltip;
}

function hideTooltip() {
  if (this.tooltipElement) {
    this.tooltipElement.remove();
    this.tooltipElement = null;
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  }[type] || 'info-circle';
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 5000);
}

function addActivity(projectId, type, description) {
  const activity = {
    id: 'activity-' + Date.now(),
    projectId,
    type,
    date: new Date().toISOString(),
    description
  };
  
  state.activities.unshift(activity);
  
  if (state.activities.length > 100) {
    state.activities = state.activities.slice(0, 100);
  }
  
  saveData();
  updateDashboard();
}

// Photo viewing function
function viewAllPhotos(id, type) {
  let photos = [];
  let title = '';
  
  if (type === 'project') {
    const project = state.projects.find(p => p.id === id);
    if (project) {
      photos = project.photos;
      title = `Photos for ${project.name}`;
    }
  } else if (type === 'monitoring') {
    const point = state.monitoringPoints.find(p => p.id === id);
    if (point) {
      photos = point.photos;
      title = `Photos for ${point.name}`;
    }
  } else if (type === 'observation') {
    // Find observation across all monitoring points
    for (const point of state.monitoringPoints) {
      if (point.observations) {
        const observation = point.observations.find(o => o.id === id);
        if (observation) {
          photos = observation.photos;
          title = `Photos for observation on ${new Date(observation.date).toLocaleDateString()}`;
          break;
        }
      }
    }
  }
  
  if (photos.length === 0) {
    showToast('No photos available', 'info');
    return;
  }
  
  // Create modal for photo viewing
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 20px; overflow-y: auto;">
        ${photos.map(photo => `
          <img src="${photo.data || photo.url}" 
               style="max-width: 300px; max-height: 300px; object-fit: contain; border-radius: 8px; cursor: pointer;"
               onclick="this.style.transform = this.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)'">
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}