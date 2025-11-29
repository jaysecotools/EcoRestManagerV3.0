// Application State
const state = {
  projects: [],
  monitoringPoints: [],
  activities: [],
  teamMembers: [],
  selectedTab: 'dashboard',
  projectMap: null,
  monitoringMap: null,
  projectLocationMap: null,
  monitoringLocationMap: null,
  projectDetailMap: null,
  projectLocationMarker: null,
  monitoringLocationMarker: null,
  projectMarkers: null, // Added missing property
  adjustProjectMapView: null, // Added missing property
  charts: {},
  tempPhotos: {
    project: [],
    monitoring: [],
    observation: []
  },
  currentProject: null,
  currentMonitoringPoint: null,
  currentObservation: null,
  currentProjectFilter: 'all',
  searchFilters: {
    projects: '',
    monitoring: '',
    team: ''
  }
};