// PowerUs AI - Frontend Application Logic
class PowerUsApp {
  constructor() {
    this.currentConversationId = null;
    this.currentMatches = [];
    this.selectedWorker = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadWorkers();
    this.showPage('find-workers');
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.showPage(page);
        this.updateActiveNav(item);
      });
    });

    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imageInput = document.getElementById('imageInput');

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    imageUpload.addEventListener('click', () => {
      imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.uploadImage(e.target.files[0]);
      }
    });

    // Modal functionality
    const backBtn = document.getElementById('backBtn');
    const successBackBtn = document.getElementById('successBackBtn');
    const continueToDashboard = document.getElementById('continueToDashboard');

    if (backBtn) {
      backBtn.addEventListener('click', () => this.closeModal());
    }

    if (successBackBtn) {
      successBackBtn.addEventListener('click', () => this.closeModal());
    }

    if (continueToDashboard) {
      continueToDashboard.addEventListener('click', () => {
        this.closeModal();
        this.showPage('dashboard');
      });
    }

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('cancelBooking').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('confirmBooking').addEventListener('click', () => {
      this.confirmBooking();
    });

    // Trade filter
    document.getElementById('tradeFilter').addEventListener('change', (e) => {
      this.filterWorkers(e.target.value);
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    });
  }

  showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(`${pageId}-page`).classList.add('active');

    // Load page-specific content
    if (pageId === 'browse-workers') {
      this.loadWorkers();
    } else if (pageId === 'dashboard') {
      this.loadDashboard();
    }
  }

  updateActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    activeItem.classList.add('active');
  }

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;

    // Clear input and disable send button
    chatInput.value = '';
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    // Add user message to chat
    this.addMessage('user', message);

    // Show typing indicator
    const typingId = this.addMessage('assistant', '<div class="loading"></div>', true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationId: this.currentConversationId
        })
      });

      const data = await response.json();
      
      // Remove typing indicator
      document.getElementById(typingId).remove();

      // Add assistant response
      this.addMessage('assistant', data.response);

      // Update conversation ID
      this.currentConversationId = data.conversationId;

      // Show matches if available
      if (data.showMatches && data.matches) {
        this.showMatches(data.matches);
        this.currentMatches = data.matches;
      }

    } catch (error) {
      console.error('Error sending message:', error);
      document.getElementById(typingId).remove();
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      sendBtn.disabled = false;
    }
  }

  addMessage(type, content, isTemporary = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const messageId = isTemporary ? `temp-${Date.now()}` : null;
    
    if (messageId) {
      messageDiv.id = messageId;
    }

    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageId;
  }

  showMatches(matches) {
    const matchesSection = document.getElementById('matchesSection');
    const matchesGrid = document.getElementById('matchesGrid');
    
    matchesGrid.innerHTML = '';

    matches.forEach(worker => {
      const workerCard = this.createWorkerCard(worker, true);
      matchesGrid.appendChild(workerCard);
    });

    matchesSection.style.display = 'block';
    
    // Scroll to matches
    setTimeout(() => {
      matchesSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  createWorkerCard(worker, showPricing = false) {
    const card = document.createElement('div');
    card.className = 'worker-card';
    
    const pricing = showPricing && worker.pricing ? worker.pricing : null;
    const priceDisplay = pricing ? `$${pricing.total}` : `$${worker.hourlyRate}/hr`;
    const priceLabel = pricing ? 'Total cost' : 'Hourly rate';

    card.innerHTML = `
      <div class="worker-header">
        <div class="worker-avatar">${worker.initials}</div>
        <div class="worker-info">
          <h4>${worker.name}</h4>
          <div class="worker-trade">${worker.trade}</div>
        </div>
      </div>
      
      <div class="worker-stats">
        <div class="worker-rating">
          <span>⭐ ${worker.rating}</span>
          <span>(${worker.reviewCount} reviews)</span>
        </div>
        <div>📍 ${worker.distance} mi</div>
        <div>🔧 ${worker.completedJobs} jobs</div>
      </div>

      <div class="worker-pricing">
        <div>
          <div class="price-amount">${priceDisplay}</div>
          <div class="price-label">${priceLabel}</div>
        </div>
      </div>

      <div class="worker-availability">
        ${worker.availability.includes('today') ? 
          '<span class="availability-tag">📅 Available Today</span>' : 
          '<span class="availability-tag">📅 Tomorrow, 8:00 AM</span>'
        }
      </div>

      <div class="worker-actions">
        <button class="btn-primary" onclick="app.bookWorker('${worker.id}')">
          Book Now
        </button>
        <button class="btn-secondary" onclick="app.viewWorkerProfile('${worker.id}')">
          View Profile
        </button>
      </div>
    `;

    return card;
  }

  async loadWorkers() {
    try {
      const response = await fetch('/api/workers');
      const workers = await response.json();
      
      const workersGrid = document.getElementById('workersGrid');
      if (workersGrid) {
        workersGrid.innerHTML = '';
        
        workers.forEach(worker => {
          const workerCard = this.createWorkerCard(worker);
          workersGrid.appendChild(workerCard);
        });
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  }

  async filterWorkers(trade) {
    try {
      const url = trade ? `/api/workers?trade=${trade}` : '/api/workers';
      const response = await fetch(url);
      const workers = await response.json();
      
      const workersGrid = document.getElementById('workersGrid');
      workersGrid.innerHTML = '';
      
      workers.forEach(worker => {
        const workerCard = this.createWorkerCard(worker);
        workersGrid.appendChild(workerCard);
      });
    } catch (error) {
      console.error('Error filtering workers:', error);
    }
  }

  bookWorker(workerId) {
    const worker = this.currentMatches.find(w => w.id === workerId) || 
                   this.findWorkerById(workerId);
    
    if (!worker) {
      console.error('Worker not found');
      return;
    }

    this.selectedWorker = worker;
    this.showBookingModal(worker);
  }

  findWorkerById(workerId) {
    // This would typically fetch from the API, but for demo we'll use a simple lookup
    const allWorkers = [
      // This should be populated from the server data
    ];
    return allWorkers.find(w => w.id === workerId);
  }

  showBookingModal(worker) {
    this.selectedWorker = worker;
    const modal = document.getElementById('bookingModal');
    const bookingContent = document.getElementById('bookingContent');
    const stepTitle = document.getElementById('stepTitle');
    const progressFill = document.getElementById('progressFill');
    
    // Update progress
    stepTitle.textContent = 'Step 1 of 3: Choose Worker & Time';
    progressFill.style.width = '33.33%';
    
    bookingContent.innerHTML = `
      <div class="worker-selection">
        <div class="section-title">Choose Worker & Schedule</div>
        <div class="section-subtitle">Choose your ${worker.trade.toLowerCase()} professional and schedule your appointment</div>
        
        <div class="worker-card">
          <div class="worker-avatar">${worker.name.charAt(0)}</div>
          <div class="worker-info">
            <div class="worker-name">${worker.name}</div>
            <div class="worker-trade">${worker.trade}</div>
            <div class="worker-description">Best match for your specific needs</div>
            <div class="worker-stats">
              <div class="worker-stat">⭐ ${worker.rating} (${worker.reviewCount || 167})</div>
              <div class="worker-stat">📍 ${worker.distance} mi</div>
              <div class="worker-stat">⏱️ 45 min</div>
              <div class="worker-stat">🔧 ${worker.completedJobs || 98} jobs</div>
            </div>
            <div class="worker-tags">
              ${worker.specialties.slice(0, 3).map(spec => `<div class="worker-tag">${spec}</div>`).join('')}
              <div class="recommended-badge">🏆 Recommended</div>
            </div>
          </div>
          <div class="worker-pricing">
            <div class="worker-price">$${worker.pricing.total}</div>
            <div class="price-label">Total cost</div>
            <div class="worker-availability">📅 Tomorrow, 8:00 AM</div>
            <button class="book-btn" onclick="app.proceedToConfirmation()">Book Now ></button>
          </div>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  proceedToConfirmation() {
    const bookingContent = document.getElementById('bookingContent');
    const stepTitle = document.getElementById('stepTitle');
    const progressFill = document.getElementById('progressFill');
    
    // Update progress to step 2
    stepTitle.textContent = 'Step 2 of 3: Confirm Your Booking';
    progressFill.style.width = '66.66%';
    
    bookingContent.innerHTML = `
      <div class="confirmation-content">
        <div class="section-title">Confirm Your Booking</div>
        <div class="section-subtitle">Please review your booking details before confirming</div>
        
        <div class="booking-summary">
          <div class="summary-worker">
            <div class="summary-worker-avatar">${this.selectedWorker.name.charAt(0)}</div>
            <div class="summary-worker-info">
              <h3>${this.selectedWorker.name}</h3>
              <div class="summary-worker-trade">${this.selectedWorker.trade}</div>
              <div class="summary-worker-rating">⭐ ${this.selectedWorker.rating} (${this.selectedWorker.reviewCount || 134} reviews)</div>
            </div>
          </div>
          
          <div class="summary-details">
            <div class="summary-item">
              <div class="summary-label">📅 Date & Time<br><span style="font-size: 12px; color: #999;">When the work will begin</span></div>
              <div class="summary-value">Sunday, September 14, 2025<br>8:00 AM</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">💰 Total Cost<br><span style="font-size: 12px; color: #999;">Estimated for ~2.5 hours</span></div>
              <div class="summary-price">$${this.selectedWorker.pricing.total}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">🔧 Service<br><span style="font-size: 12px; color: #999;">Type of work requested</span></div>
              <div class="summary-value">${this.selectedWorker.trade}<br>my car wont work</div>
            </div>
          </div>
          
          <button class="confirm-booking-btn" onclick="app.confirmBooking()">✓ Confirm Booking</button>
        </div>
      </div>
    `;
  }

  confirmBooking() {
    const successModal = document.getElementById('successModal');
    const bookingModal = document.getElementById('bookingModal');
    const finalBookingSummary = document.getElementById('finalBookingSummary');
    
    // Show success modal
    bookingModal.style.display = 'none';
    successModal.style.display = 'block';
    
    // Populate final summary
    finalBookingSummary.innerHTML = `
      <div class="summary-worker">
        <div class="summary-worker-avatar">${this.selectedWorker.name.charAt(0)}</div>
        <div class="summary-worker-info">
          <h3>${this.selectedWorker.name}</h3>
          <div class="summary-worker-trade">${this.selectedWorker.trade}</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 16px;">
        <div>
          <div style="font-weight: 600; color: #666; font-size: 14px;">Service Date:</div>
          <div style="color: #1a1a1a; font-weight: 600;">Sun, Sep 14 at 8:00 AM</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600; color: #666; font-size: 14px;">Total Cost:</div>
          <div style="color: #16a34a; font-weight: 700; font-size: 18px;">$${this.selectedWorker.pricing.total}</div>
        </div>
      </div>
    `;
    
    // Update stats
    const activeJobsElement = document.getElementById('activeJobs');
    if (activeJobsElement) {
      activeJobsElement.textContent = '1';
    }
    
    // Clear current matches
    this.currentMatches = [];
    this.selectedWorker = null;
    
    // Hide matches section
    const matchesSection = document.getElementById('matchesSection');
    if (matchesSection) {
      matchesSection.style.display = 'none';
    }
  }

  showSuccessMessage(message) {
    // Add success message to chat
    this.addMessage('assistant', `✅ ${message}`);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success-green);
      color: white;
      padding: 16px 20px;
      border-radius: var(--radius-medium);
      box-shadow: var(--shadow-medium);
      z-index: 1001;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }

  updateActiveJobs() {
    const activeJobsElement = document.getElementById('activeJobs');
    if (activeJobsElement) {
      const currentCount = parseInt(activeJobsElement.textContent) || 0;
      activeJobsElement.textContent = currentCount + 1;
    }
  }

  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  viewWorkerProfile(workerId) {
    // This would show a detailed worker profile modal
    console.log('Viewing profile for worker:', workerId);
    // For now, just show an alert
    alert('Worker profile feature coming soon!');
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.filename) {
        this.addMessage('user', `📷 Image uploaded: ${file.name}`);
        this.addMessage('assistant', `I can see the image. Based on what I observe, this looks like it might need a ${result.suggestedTrade}. Let me find the right professionals for you.`);
        
        // Trigger a search based on the image analysis
        setTimeout(() => {
          this.sendMessage();
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      this.addMessage('assistant', 'Sorry, I had trouble processing your image. Please try again or describe the problem in text.');
    }
  }

  loadDashboard() {
    // Load recent matches for dashboard
    const recentMatchesList = document.getElementById('recent-matches-list');
    if (recentMatchesList && this.currentMatches.length > 0) {
      recentMatchesList.innerHTML = '';
      
      this.currentMatches.slice(0, 3).forEach(worker => {
        const matchItem = document.createElement('div');
        matchItem.className = 'recent-match-item';
        matchItem.innerHTML = `
          <div class="match-worker">
            <div class="worker-avatar">${worker.initials}</div>
            <div class="worker-info">
              <h4>${worker.name}</h4>
              <div class="worker-trade">${worker.trade}</div>
            </div>
          </div>
          <div class="match-stats">
            <div class="worker-rating">⭐ ${worker.rating}</div>
            <div class="worker-distance">📍 ${worker.distance} mi • $${worker.hourlyRate}/hr</div>
          </div>
        `;
        recentMatchesList.appendChild(matchItem);
      });
    }
  }
}

// Initialize the app
const app = new PowerUsApp();

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .recent-match-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--background-white);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-medium);
    margin-bottom: 12px;
  }
  
  .match-worker {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .match-stats {
    text-align: right;
    font-size: 14px;
    color: var(--text-medium);
  }
  
  .booking-form {
    margin: 24px 0;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-dark);
  }
  
  .datetime-display {
    background: var(--background-light);
    padding: 16px;
    border-radius: var(--radius-medium);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .date {
    font-weight: 600;
  }
  
  .time {
    color: var(--primary-orange);
    font-weight: 600;
  }
  
  .cost-breakdown {
    background: var(--background-light);
    padding: 16px;
    border-radius: var(--radius-medium);
  }
  
  .cost-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: var(--primary-orange);
    font-size: 18px;
  }
  
  .service-type {
    background: var(--background-light);
    padding: 16px;
    border-radius: var(--radius-medium);
  }
  
  .service-category {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .service-description {
    color: var(--text-medium);
  }
  
  .worker-summary {
    margin-bottom: 24px;
  }
  
  .summary-details {
    border-top: 1px solid var(--border-light);
    padding-top: 16px;
  }
`;
document.head.appendChild(notificationStyles);
