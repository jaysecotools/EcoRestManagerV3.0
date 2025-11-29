// Report Functions
function handleReportSubmit(e) {
  e.preventDefault();
  
  const projectId = document.getElementById('report-project').value;
  const reportType = document.getElementById('report-type').value;
  const format = document.getElementById('report-format').value;
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;
  
  const submitBtn = document.getElementById('report-form-submit');
  const submitSpinner = document.getElementById('report-submit-spinner');
  submitSpinner.style.display = 'inline-block';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    try {
      if (format === 'pdf') {
        generatePDFReport(projectId, reportType, startDate, endDate);
      } else {
        showToast(`Report generated successfully (${reportType} - ${format})`, 'success');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showToast('Error generating report: ' + error.message, 'error');
    } finally {
      submitSpinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  }, 2000);
}

function generatePDFReport(projectId, reportType, startDate, endDate) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Ecological Restoration Project Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Report Type: ${reportType}`, 20, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
  
  if (projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      doc.text(`Project: ${project.name}`, 20, 60);
    }
  }
  
  if (startDate && endDate) {
    doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 70);
  }
  
  let yPosition = 90;
  
  switch (reportType) {
    case 'summary':
      doc.text('Project Summary:', 20, yPosition);
      yPosition += 10;
      state.projects.forEach(project => {
        if (!projectId || project.id === projectId) {
          doc.text(`- ${project.name}: ${project.status}`, 20, yPosition);
          yPosition += 7;
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
      break;
      
    case 'progress':
      doc.text('Progress Report:', 20, yPosition);
      yPosition += 10;
      state.projects.forEach(project => {
        if (!projectId || project.id === projectId) {
          const completed = project.milestones ? 
            project.milestones.filter(m => m.completed).length : 0;
          const total = project.milestones ? project.milestones.length : 0;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          doc.text(`- ${project.name}: ${progress}% complete`, 20, yPosition);
          yPosition += 7;
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
      break;
      
    case 'monitoring':
      doc.text('Monitoring Data:', 20, yPosition);
      yPosition += 10;
      state.monitoringPoints.forEach(point => {
        const project = state.projects.find(p => p.id === point.projectId);
        if (!projectId || point.projectId === projectId) {
          doc.text(`- ${point.name} (${project ? project.name : 'Unknown'}): ${point.observations ? point.observations.length : 0} observations`, 20, yPosition);
          yPosition += 7;
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
      break;
      
    case 'full':
      doc.text('Full Project Report:', 20, yPosition);
      yPosition += 10;
      state.projects.forEach(project => {
        if (!projectId || project.id === projectId) {
          doc.text(`Project: ${project.name}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Status: ${project.status}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Type: ${project.type}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Location: ${project.location.name}`, 20, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
      break;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  doc.save(`erpm-report-${timestamp}.pdf`);
  
  showToast('PDF report generated successfully', 'success');
}
