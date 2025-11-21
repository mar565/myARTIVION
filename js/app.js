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
