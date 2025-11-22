// PWA Install Prompt Handler
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installButton = document.getElementById('installButton');
const dismissButton = document.getElementById('dismissButton');
const headerInstallBtn = document.getElementById('headerInstallBtn');

// Navigation Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  updateOnlineStatus();
  initializeNavigation();
  checkIfInstalled();
});

function initializeNavigation() {
  // Get all navigation elements
  const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const oldNavButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('pageTitle');
  const sidebar = document.getElementById('sidebar');
  const container = document.querySelector('.container');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');

  // Section titles mapping
  const sectionTitles = {
    home: 'Willkommen',
    benefits: 'Deine Benefits',
    news: 'News & Events',
    salary: 'Gehaltsübersicht',
    time: 'Zeiterfassung',
    vacation: 'Urlaubsplaner',
    social: 'Social Hub',
    onboarding: 'Training',
    tasks: 'Aufgaben',
    analytics: 'Analytics',
    wellbeing: 'Wohlbefinden'
  };

  // Handle navigation click
  function handleNavigation(targetSection) {
    // Update active states for sidebar
    sidebarItems.forEach(item => item.classList.remove('active'));
    const activeSidebarItem = document.querySelector(`.sidebar .nav-item[data-section="${targetSection}"]`);
    if (activeSidebarItem) activeSidebarItem.classList.add('active');

    // Update active states for mobile nav
    mobileNavItems.forEach(item => item.classList.remove('active'));
    const activeMobileItem = document.querySelector(`.mobile-nav-item[data-section="${targetSection}"]`);
    if (activeMobileItem) activeMobileItem.classList.add('active');

    // Update active states for old nav (if exists)
    oldNavButtons.forEach(btn => btn.classList.remove('active'));
    const activeOldButton = document.querySelector(`.nav-btn[data-section="${targetSection}"]`);
    if (activeOldButton) activeOldButton.classList.add('active');

    // Show target section, hide others
    sections.forEach(section => {
      if (section.id === targetSection) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update page title
    if (pageTitle && sectionTitles[targetSection]) {
      pageTitle.textContent = sectionTitles[targetSection];
    }

    // Close mobile sidebar on navigation
    if (window.innerWidth <= 1024 && sidebar) {
      sidebar.classList.remove('mobile-open');
      const overlay = document.getElementById('sidebarOverlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save current section to localStorage
    localStorage.setItem('currentSection', targetSection);
  }

  // Add click handlers to sidebar items
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-section');
      handleNavigation(targetSection);
    });
  });

  // Add click handlers to mobile nav items
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-section');
      handleNavigation(targetSection);
    });
  });

  // Add click handlers to old nav buttons (for compatibility)
  oldNavButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');
      handleNavigation(targetSection);
    });
  });

  // Sidebar toggle functionality
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth > 1024) {
        sidebar.classList.toggle('collapsed');
        container.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      }
    });
  }

  // Mobile sidebar toggle
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('active');
      }
    });

    // Show mobile menu toggle on mobile
    if (window.innerWidth <= 1024) {
      mobileSidebarToggle.style.display = 'flex';
    }
  }

  // Close sidebar when clicking overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('collapsed');
      container.classList.remove('sidebar-collapsed');
      if (mobileSidebarToggle) {
        mobileSidebarToggle.style.display = 'flex';
      }
    } else {
      sidebar.classList.remove('mobile-open');
      if (sidebarOverlay) {
        sidebarOverlay.classList.remove('active');
      }
      if (mobileSidebarToggle) {
        mobileSidebarToggle.style.display = 'none';
      }
      // Restore saved sidebar state
      const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        container.classList.add('sidebar-collapsed');
      }
    }
  });

  // Close mobile sidebar when clicking outside (handled by overlay now)
  // Removed to avoid conflicts with overlay click handler

  // Restore last viewed section on load
  const savedSection = localStorage.getItem('currentSection');
  if (savedSection) {
    handleNavigation(savedSection);
  } else {
    handleNavigation('home');
  }

  // Restore saved sidebar state on desktop
  if (window.innerWidth > 1024) {
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && sidebar && container) {
      sidebar.classList.add('collapsed');
      container.classList.add('sidebar-collapsed');
    }
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Check if already installed
function checkIfInstalled() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');

  if (isStandalone && headerInstallBtn) {
    headerInstallBtn.classList.add('installed');
    headerInstallBtn.innerHTML = '<span class="install-icon">✅</span><span class="install-text">Installiert</span>';
    headerInstallBtn.title = 'App ist bereits installiert';
  }

  return isStandalone;
}

// Show installation instructions modal
function showInstallInstructions() {
  const browser = getBrowserInfo();
  let instructions = '';

  if (browser.chrome || browser.edge) {
    if (browser.mobile) {
      instructions = `
        <h4>Installation auf Android:</h4>
        <ol>
          <li>Tippe auf das Menü (⋮) oben rechts</li>
          <li>Wähle <code>Zum Startbildschirm hinzufügen</code></li>
          <li>Bestätige mit <code>Hinzufügen</code></li>
        </ol>
      `;
    } else {
      instructions = `
        <h4>Installation auf Desktop:</h4>
        <ol>
          <li>Klicke auf das App-Symbol (⊕) in der Adressleiste</li>
          <li>Oder: Menü → <code>App installieren...</code></li>
          <li>Bestätige mit <code>Installieren</code></li>
        </ol>
      `;
    }
  } else if (browser.safari) {
    instructions = `
      <h4>Installation auf iOS:</h4>
      <ol>
        <li>Tippe auf das <strong>Teilen</strong>-Symbol (□↑)</li>
        <li>Scrolle runter und wähle <code>Zum Home-Bildschirm</code></li>
        <li>Tippe auf <code>Hinzufügen</code></li>
      </ol>
    `;
  } else if (browser.firefox) {
    instructions = `
      <h4>Installation in Firefox:</h4>
      <ol>
        <li>Tippe auf das Menü (⋮) oben rechts</li>
        <li>Wähle <code>Installieren</code> oder <code>Auf Startbildschirm</code></li>
        <li>Bestätige die Installation</li>
      </ol>
    `;
  } else {
    instructions = `
      <h4>Installation:</h4>
      <p>Bitte verwenden Sie Chrome, Edge, Safari oder Firefox für die beste PWA-Unterstützung.</p>
    `;
  }

  const modal = document.createElement('div');
  modal.className = 'pwa-install-modal active';
  modal.innerHTML = `
    <div class="pwa-install-content">
      <h3>📱 MyARTIVION installieren</h3>
      <p>Installiere MyARTIVION als App auf deinem Gerät für schnelleren Zugriff und eine native App-Erfahrung.</p>
      <div class="pwa-install-steps">
        ${instructions}
      </div>
      <div class="pwa-install-buttons">
        <button class="btn-secondary" onclick="this.closest('.pwa-install-modal').remove()">Schließen</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
}

// Get browser info
function getBrowserInfo() {
  const ua = navigator.userAgent;
  return {
    chrome: /Chrome/.test(ua) && !/Edge/.test(ua),
    edge: /Edg/.test(ua),
    safari: /Safari/.test(ua) && !/Chrome/.test(ua),
    firefox: /Firefox/.test(ua),
    mobile: /Android|iPhone|iPad|iPod/.test(ua)
  };
}

// Header install button click handler
if (headerInstallBtn) {
  headerInstallBtn.addEventListener('click', async () => {
    if (checkIfInstalled()) {
      return;
    }

    if (deferredPrompt) {
      // Use native install prompt if available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        headerInstallBtn.classList.add('installed');
        headerInstallBtn.innerHTML = '<span class="install-icon">✅</span><span class="install-text">Installiert</span>';
      }

      deferredPrompt = null;
    } else {
      // Show manual installation instructions
      showInstallInstructions();
    }
  });
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();

  // Store the event so it can be triggered later
  deferredPrompt = e;

  // Update header button
  if (headerInstallBtn && !checkIfInstalled()) {
    headerInstallBtn.style.display = 'flex';
  }

  // Show the install prompt (legacy)
  if (installPrompt) {
    installPrompt.style.display = 'block';
  }

  console.log('beforeinstallprompt event fired');
});

// Install button click handler
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt
    deferredPrompt = null;

    // Hide the install prompt
    if (installPrompt) {
      installPrompt.style.display = 'none';
    }
  });
}

// Dismiss button click handler
if (dismissButton) {
  dismissButton.addEventListener('click', () => {
    if (installPrompt) {
      installPrompt.style.display = 'none';
    }
  });
}

// Listen for app installed event
window.addEventListener('appinstalled', (event) => {
  console.log('PWA was installed successfully', event);

  // Update header button
  if (headerInstallBtn) {
    headerInstallBtn.classList.add('installed');
    headerInstallBtn.innerHTML = '<span class="install-icon">✅</span><span class="install-text">Installiert</span>';
  }

  // Hide the install prompt
  if (installPrompt) {
    installPrompt.style.display = 'none';
  }

  // Clear the deferredPrompt
  deferredPrompt = null;
});

// Check if app is in standalone mode
function isStandalone() {
  return (window.matchMedia('(display-mode: standalone)').matches) ||
         (window.navigator.standalone) ||
         document.referrer.includes('android-app://');
}

// Log standalone status
if (isStandalone()) {
  console.log('App is running in standalone mode');
} else {
  console.log('App is running in browser mode');
}

// Network status handler
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  console.log(`Network status: ${isOnline ? 'online' : 'offline'}`);

  // You can add visual feedback here
  if (!isOnline) {
    // Show offline indicator
    console.log('App is offline - serving cached content');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Handle page visibility
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('App became visible');
    // Check for updates or refresh data here
  }
});

// ===================================
// AI Chatbot Widget Handler
// ===================================

let chatbotExpanded = false;
let demoShown = false;

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeChatbot();
});

function initializeChatbot() {
  const chatbotWidget = document.getElementById('chatbotWidget');
  const chatbotHeader = document.getElementById('chatbotHeader');
  const chatbotToggle = document.getElementById('chatbotToggle');

  if (!chatbotWidget || !chatbotHeader) {
    return;
  }

  // Start collapsed
  chatbotWidget.classList.add('collapsed');

  // Toggle chatbot on header click
  chatbotHeader.addEventListener('click', toggleChatbot);
  chatbotToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChatbot();
  });
}

function toggleChatbot() {
  const chatbotWidget = document.getElementById('chatbotWidget');

  chatbotExpanded = !chatbotExpanded;

  if (chatbotExpanded) {
    chatbotWidget.classList.remove('collapsed');

    // Show demo conversation only once per expansion
    if (!demoShown) {
      setTimeout(() => {
        showDemoConversation();
      }, 300);
    }
  } else {
    chatbotWidget.classList.add('collapsed');

    // Reset the conversation when collapsed
    setTimeout(() => {
      resetChatbot();
    }, 300);
  }
}

function resetChatbot() {
  const chatbotMessages = document.getElementById('chatbotMessages');

  if (!chatbotMessages) return;

  // Clear all messages and reset to welcome message
  chatbotMessages.innerHTML = `
    <div class="chatbot-welcome">
      <div class="welcome-icon">👋</div>
      <p>Hallo! Ich bin dein MyARTIVION Assistant. Ich kann dir Fragen zu Unternehmensrichtlinien, Benefits, Events und mehr beantworten.</p>
    </div>
  `;

  demoShown = false;
}

function showDemoConversation() {
  const chatbotMessages = document.getElementById('chatbotMessages');

  if (!chatbotMessages) return;

  demoShown = true;

  // Clear welcome message
  chatbotMessages.innerHTML = '';

  // Simulated conversation demo
  const demoMessages = [
    {
      type: 'user',
      text: 'Wann ist die Weihnachtsfeier?',
      delay: 500
    },
    {
      type: 'bot',
      text: 'Die Weihnachtsfeier 2025 findet am <strong>Freitag, 20. Dezember 2025</strong> um 18:00 Uhr statt.',
      link: {
        text: '🎄 Zur Veranstaltung',
        section: 'news'
      },
      delay: 1500
    },
    {
      type: 'user',
      text: 'Welche Benefits habe ich noch nicht genutzt?',
      delay: 2500
    },
    {
      type: 'bot',
      text: 'Du hast noch folgende Benefits nicht aktiviert:<br><br>• <strong>Motivationsleasing PKW</strong> (2.800€/Jahr)<br>• <strong>Corporate Benefits</strong> (600€/Jahr)<br>• <strong>Sommerbetreuung für Kinder</strong> (800€/Jahr)<br><br>Das ist ein Potenzial von insgesamt 4.200€ pro Jahr!',
      link: {
        text: '💰 Benefits ansehen',
        section: 'benefits'
      },
      delay: 1500
    }
  ];

  // Show typing indicator first
  showTypingIndicator();

  let totalDelay = 0;

  demoMessages.forEach((message, index) => {
    totalDelay += message.delay;

    setTimeout(() => {
      if (message.type === 'user') {
        // Remove typing indicator before showing user message
        removeTypingIndicator();
        addUserMessage(message.text);

        // Show typing indicator for next bot message
        if (index < demoMessages.length - 1 && demoMessages[index + 1].type === 'bot') {
          setTimeout(() => showTypingIndicator(), 300);
        }
      } else {
        // Remove typing indicator
        removeTypingIndicator();
        addBotMessage(message.text, message.link);

        // Show typing indicator for next bot message
        if (index < demoMessages.length - 1 && demoMessages[index + 1].type === 'bot') {
          setTimeout(() => showTypingIndicator(), 300);
        }
      }

      // Scroll to bottom
      scrollToBottom();
    }, totalDelay);
  });
}

function showTypingIndicator() {
  const chatbotMessages = document.getElementById('chatbotMessages');

  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="message-avatar bot">🤖</div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  chatbotMessages.appendChild(typingDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function addUserMessage(text) {
  const chatbotMessages = document.getElementById('chatbotMessages');

  const messageDiv = document.createElement('div');
  messageDiv.className = 'chatbot-message user';
  messageDiv.innerHTML = `
    <div class="message-avatar user">👤</div>
    <div class="message-content">${text}</div>
  `;

  chatbotMessages.appendChild(messageDiv);
}

function addBotMessage(text, link = null) {
  const chatbotMessages = document.getElementById('chatbotMessages');

  const messageDiv = document.createElement('div');
  messageDiv.className = 'chatbot-message bot';

  let linkHtml = '';
  if (link) {
    linkHtml = `<a href="#" class="message-link" data-section="${link.section}">${link.text} →</a>`;
  }

  messageDiv.innerHTML = `
    <div class="message-avatar bot">🤖</div>
    <div class="message-content">
      ${text}
      ${linkHtml}
    </div>
  `;

  chatbotMessages.appendChild(messageDiv);

  // Add click handler for the link
  if (link) {
    const linkElement = messageDiv.querySelector('.message-link');
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      const section = linkElement.getAttribute('data-section');
      navigateToSection(section);

      // Close chatbot after navigation
      setTimeout(() => {
        if (chatbotExpanded) {
          toggleChatbot();
        }
      }, 300);
    });
  }
}

function navigateToSection(sectionName) {
  const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
  if (targetButton) {
    targetButton.click();
  }
}

function scrollToBottom() {
  const chatbotMessages = document.getElementById('chatbotMessages');
  if (chatbotMessages) {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
}
