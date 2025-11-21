// PWA Install Prompt Handler
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installButton = document.getElementById('installButton');
const dismissButton = document.getElementById('dismissButton');

// Navigation Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  updateOnlineStatus();
  initializeNavigation();
});

function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');

  // Add click handlers to navigation buttons
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');

      // Update active states
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Show target section, hide others
      sections.forEach(section => {
        if (section.id === targetSection) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save current section to localStorage
      localStorage.setItem('currentSection', targetSection);
    });
  });

  // Restore last viewed section on load
  const savedSection = localStorage.getItem('currentSection');
  if (savedSection) {
    const targetButton = document.querySelector(`[data-section="${savedSection}"]`);
    if (targetButton) {
      targetButton.click();
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

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();

  // Store the event so it can be triggered later
  deferredPrompt = e;

  // Show the install prompt
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
