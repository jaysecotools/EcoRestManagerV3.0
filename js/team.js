// Team Functions
function filterTeamMembers() {
  const searchTerm = document.getElementById('team-search').value.toLowerCase();
  const roleFilter = document.getElementById('team-role-filter').value;
  
  state.searchFilters.team = searchTerm;
  renderTeamMembers(roleFilter);
}

function renderTeamMembers(roleFilter = '') {
  const container = document.getElementById('team-members-list');
  if (!container) return;
  
  const tbody = container.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  let membersToShow = [...state.teamMembers];
  
  if (roleFilter) {
    membersToShow = membersToShow.filter(m => m.role === roleFilter);
  }
  
  if (state.searchFilters.team) {
    membersToShow = membersToShow.filter(m => 
      m.name.toLowerCase().includes(state.searchFilters.team) ||
      m.email.toLowerCase().includes(state.searchFilters.team)
    );
  }
  
  if (membersToShow.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">
          <i class="fas fa-users" style="font-size: 2rem; color: #ddd; margin-bottom: 10px;"></i>
          <p>No team members found</p>
          <button class="btn" onclick="showTeamMemberForm()" style="margin-top: 15px;">
            <i class="fas fa-plus"></i> Add Team Member
          </button>
        </td>
      </tr>
    `;
    return;
  }
  
  membersToShow.forEach(member => {
    const assignedProjects = member.projects.map(projectId => {
      const project = state.projects.find(p => p.id === projectId);
      return project ? project.name : 'Unknown Project';
    }).join(', ');
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(member.name)}</td>
      <td>${member.role.replace('-', ' ')}</td>
      <td>${escapeHtml(member.email)}</td>
      <td><span class="status-badge ${member.status}">${member.status}</span></td>
      <td>${assignedProjects || 'None'}</td>
      <td>
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-outline" onclick="showTeamMemberForm('${member.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline btn-danger" onclick="deleteTeamMember('${member.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showTeamMemberForm(memberId = null) {
  const formContainer = document.getElementById('team-member-form-container');
  const formTitle = document.getElementById('team-member-form-title');
  
  if (memberId) {
    const member = state.teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    formTitle.textContent = 'Edit Team Member';
    document.getElementById('team-member-id').value = member.id;
    document.getElementById('team-member-name').value = member.name;
    document.getElementById('team-member-role').value = member.role;
    document.getElementById('team-member-email').value = member.email;
    document.getElementById('team-member-phone').value = member.phone || '';
    document.getElementById('team-member-status').value = member.status;
    
    const projectsSelect = document.getElementById('team-member-projects');
    Array.from(projectsSelect.options).forEach(option => {
      option.selected = member.projects.includes(option.value);
    });
  } else {
    formTitle.textContent = 'Add Team Member';
    document.getElementById('team-member-form').reset();
  }
  
  if (typeof populateProjectDropdown === 'function') {
    populateProjectDropdown('team-member-projects', true);
  }
  formContainer.style.display = 'block';
}

function hideTeamMemberForm() {
  document.getElementById('team-member-form-container').style.display = 'none';
}

function handleTeamMemberSubmit(e) {
  e.preventDefault();
  
  const memberId = document.getElementById('team-member-id').value;
  const name = document.getElementById('team-member-name').value.trim();
  const role = document.getElementById('team-member-role').value;
  const email = document.getElementById('team-member-email').value.trim();
  const status = document.getElementById('team-member-status').value;
  
  if (!name || !role || !email || !status) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const projectsSelect = document.getElementById('team-member-projects');
  const selectedProjects = Array.from(projectsSelect.selectedOptions).map(option => option.value);
  
  const member = {
    id: memberId || 'member-' + Date.now(),
    name: name,
    role: role,
    email: email,
    phone: document.getElementById('team-member-phone').value.trim() || null,
    status: status,
    projects: selectedProjects
  };
  
  if (memberId) {
    const index = state.teamMembers.findIndex(m => m.id === memberId);
    if (index !== -1) {
      state.teamMembers[index] = member;
    }
  } else {
    state.teamMembers.push(member);
  }
  
  saveData();
  renderTeamMembers();
  hideTeamMemberForm();
  showToast('Team member saved successfully', 'success');
}

function deleteTeamMember(memberId) {
  if (!confirm('Are you sure you want to delete this team member?')) {
    return;
  }
  
  state.teamMembers = state.teamMembers.filter(m => m.id !== memberId);
  saveData();
  renderTeamMembers();
  showToast('Team member deleted', 'success');
}
