// Map Functions
function initMaps() {
  try {
    // --- Projects overview map (shows Australia by default, fits to markers when present) ---
    if (document.getElementById('projects-map') && !state.projectMap) {
      const defaultCentre = [-25.2744, 133.7751]; // central Australia
      const defaultZoom = 4;

      state.projectMap = L.map('projects-map', {
        center: defaultCentre,
        zoom: defaultZoom
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(state.projectMap);

      // LayerGroup for project markers (keeps marker management tidy)
      state.projectMarkers = L.layerGroup().addTo(state.projectMap);

      // Helper: adjust view — fit to markers when present, otherwise reset to default Australia view
      state.adjustProjectMapView = function () {
        try {
          const layers = state.projectMarkers.getLayers();
          if (layers && layers.length > 0) {
            const group = L.featureGroup(layers);
            // pad slightly and limit maximum zoom so fitBounds doesn't zoom in too far
            state.projectMap.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
          } else {
            // no markers — show whole Australia
            state.projectMap.setView(defaultCentre, defaultZoom);
          }
        } catch (err) {
          console.error('Error adjusting project map view:', err);
          // fallback to default Australia view
          state.projectMap.setView(defaultCentre, defaultZoom);
        }
      };

      // Populate markers (this will call adjustProjectMapView at the end)
      updateProjectMapMarkers();
    }

    // --- Project location picker map (used when creating/editing a project) ---
    if (document.getElementById('project-location-map') && !state.projectLocationMap) {
      // keep a reasonable default for editing (you currently used Sydney at zoom 13)
      state.projectLocationMap = L.map('project-location-map').setView([-33.8688, 151.2093], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(state.projectLocationMap);

      state.projectLocationMap.on('click', function(e) {
        if (state.projectLocationMarker) {
          state.projectLocationMap.removeLayer(state.projectLocationMarker);
        }
        state.projectLocationMarker = L.marker(e.latlng).addTo(state.projectLocationMap);
        document.getElementById('project-lat').value = e.latlng.lat;
        document.getElementById('project-lng').value = e.latlng.lng;
      });
    }

    // --- Monitoring location picker map ---
    if (document.getElementById('monitoring-location-map') && !state.monitoringLocationMap) {
      state.monitoringLocationMap = L.map('monitoring-location-map').setView([-33.8688, 151.2093], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(state.monitoringLocationMap);

      state.monitoringLocationMap.on('click', function(e) {
        if (state.monitoringLocationMarker) {
          state.monitoringLocationMap.removeLayer(state.monitoringLocationMarker);
        }
        state.monitoringLocationMarker = L.marker(e.latlng).addTo(state.monitoringLocationMap);
        document.getElementById('monitoring-lat').value = e.latlng.lat;
        document.getElementById('monitoring-lng').value = e.latlng.lng;
      });
    }
  } catch (error) {
    console.error('Error initializing maps:', error);
    showToast('Error initializing maps: ' + error.message, 'error');
  }
}

function updateProjectMapMarkers() {
  if (!state.projectMap) return;

  // ensure layerGroup exists (in case this is called before initMaps finished)
  if (!state.projectMarkers) {
    state.projectMarkers = L.layerGroup().addTo(state.projectMap);
  }

  // Clear existing project markers (only clears markers we manage, not tile layers etc.)
  state.projectMarkers.clearLayers();

  // Add markers for each project to the layerGroup
  state.projects.forEach(project => {
    if (!project.location || !project.location.coords) return;

    const icon = L.divIcon({
      html: `<div style="background-color: ${getStatusColor(project.status)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white;">
              <i class="fas fa-${getProjectIcon(project.type)}" style="font-size: 14px;"></i>
            </div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker(project.location.coords, { icon: icon })
      .bindPopup(`<b>${project.name}</b><br>${project.type} restoration<br><small>${project.location.name}</small>`)
      .on('click', () => viewProjectDetails(project.id));

    state.projectMarkers.addLayer(marker);
  });

  // adjust view: fit bounds when we have markers, otherwise default to Australia (via adjustProjectMapView)
  if (typeof state.adjustProjectMapView === 'function') {
    state.adjustProjectMapView();
  } else {
    // fallback: attempt simple fit logic
    const layers = state.projectMarkers.getLayers();
    if (layers && layers.length > 0) {
      const group = L.featureGroup(layers);
      state.projectMap.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    } else {
      state.projectMap.setView([-25.2744, 133.7751], 4);
    }
  }
}

function initProjectDetailMap(project) {
  if (!project || !project.location || !project.location.coords) return null;

  const mapContainer = document.getElementById('project-detail-map');
  if (!mapContainer) return null;

  // Clear any existing map
  if (state.projectDetailMap) {
    state.projectDetailMap.remove();
  }

  // Create new map
  const map = L.map('project-detail-map').setView(project.location.coords, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add project marker
  const icon = L.divIcon({
    html: `<div style="background-color: ${getStatusColor(project.status)}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <i class="fas fa-${getProjectIcon(project.type)}" style="font-size: 18px;"></i>
          </div>`,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  L.marker(project.location.coords, { icon: icon })
    .addTo(map)
    .bindPopup(`<b>${project.name}</b><br>${project.type} restoration<br><small>${project.location.name}</small>`)
    .openPopup();

  // Add monitoring point markers if any
  const projectMonitoringPoints = state.monitoringPoints.filter(p => p.projectId === project.id);
  projectMonitoringPoints.forEach(point => {
    const monitoringIcon = L.divIcon({
      html: `<div style="background-color: #0288d1; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white;">
              <i class="fas fa-binoculars" style="font-size: 12px;"></i>
            </div>`,
      className: 'custom-marker',
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5]
    });

    L.marker(point.coords, { icon: monitoringIcon })
      .addTo(map)
      .bindPopup(`<b>${point.name}</b><br>${point.type} monitoring<br><small>${point.observations ? point.observations.length : 0} observations</small>`);
  });

  state.projectDetailMap = map;
  return map;
}