# Progressive Web App (PWA)

A mobile and desktop optimized Progressive Web App ready for deployment on Azure Static Web Apps.

## Features

- **Responsive Design**: Optimized for both mobile and desktop devices
- **PWA Installable**: Can be installed as a native app on devices
- **Offline Support**: Service worker enables offline functionality
- **Azure Ready**: Configured for Azure Static Web Apps deployment
- **Modern Standards**: Follows PWA best practices

## Project Structure

```
myARTIVION/
├── index.html                    # Main HTML file
├── manifest.json                 # PWA manifest configuration
├── service-worker.js             # Service worker for offline support
├── staticwebapp.config.json      # Azure Static Web Apps configuration
├── generate-icons.html           # Tool to generate placeholder icons
├── css/
│   └── style.css                 # Main stylesheet with responsive design
├── js/
│   └── app.js                    # Main JavaScript with PWA logic
└── icons/                        # PWA icons directory
```

## Getting Started

### 1. Generate Icons

Before deploying, you need to create app icons:

1. Open `generate-icons.html` in a web browser
2. Enter your app name or initials
3. Choose a background color
4. Click "Generate Icons"
5. Right-click each generated icon and save to the `/icons/` folder with the filename shown

Required icon sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 2. Customize Content

Update the following files with your content:
- `index.html` - Update title, headings, and content
- `manifest.json` - Update app name, description, and theme colors
- `css/style.css` - Customize colors and styles

### 3. Test Locally

To test the PWA locally, you need to serve it over HTTPS or localhost:

**Option 1: Using Python**
```bash
python3 -m http.server 8000
```

**Option 2: Using Node.js (http-server)**
```bash
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

### 4. Deploy to Azure Static Web Apps

#### Prerequisites
- Azure account
- Azure CLI or GitHub integration

#### Deployment Steps

**Option A: Using Azure CLI**
```bash
# Install Azure CLI if not already installed
# Then login
az login

# Create a static web app
az staticwebapp create \
  --name my-pwa-app \
  --resource-group my-resource-group \
  --location "East US" \
  --source .

# Deploy
az staticwebapp deploy \
  --name my-pwa-app \
  --resource-group my-resource-group \
  --app-location "/" \
  --output-location "/"
```

**Option B: Using GitHub Actions**
1. Push your code to a GitHub repository
2. Go to Azure Portal > Static Web Apps
3. Click "Create"
4. Connect to your GitHub repository
5. Configure build settings:
   - App location: `/`
   - Output location: `/`
6. Azure will automatically create a GitHub Actions workflow

## PWA Features

### Service Worker
The service worker (`service-worker.js`) provides:
- Offline functionality
- Asset caching
- Fast loading times
- Background sync capabilities

### Installation
Users can install the PWA:
- **Desktop**: Click the install icon in the browser address bar
- **Mobile**: Use "Add to Home Screen" from the browser menu
- **In-app prompt**: The app shows an install prompt when installable

### Manifest
The `manifest.json` file defines:
- App name and description
- Display mode (standalone)
- Theme colors
- Icons for different sizes
- Start URL

## Browser Support

The PWA works in all modern browsers:
- Chrome/Edge (full PWA support)
- Firefox (full PWA support)
- Safari (limited PWA support)
- Opera (full PWA support)

## Customization

### Update Theme Colors
Edit `manifest.json` and `css/style.css`:
```json
"theme_color": "#2196F3",
"background_color": "#ffffff"
```

### Modify Cache Strategy
Edit `service-worker.js` to change caching behavior:
```javascript
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add more URLs to cache
];
```

### Configure Azure Settings
Edit `staticwebapp.config.json` for:
- Routing rules
- HTTP headers
- MIME types
- Redirects

## Testing PWA

### Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 100

### PWA Checklist
- ✅ Served over HTTPS
- ✅ Responsive design
- ✅ Offline functionality
- ✅ Web app manifest
- ✅ Service worker registered
- ✅ Installable
- ✅ Fast load times

## Troubleshooting

### Service Worker Not Registering
- Ensure the site is served over HTTPS or localhost
- Check browser console for errors
- Clear browser cache and reload

### Install Prompt Not Showing
- PWA must meet installability criteria
- User must engage with the site first
- Check manifest.json is valid

### Icons Not Loading
- Verify icons are in `/icons/` folder
- Check file names match manifest.json
- Ensure correct image format (PNG)

## Next Steps

1. Customize the design and layout
2. Add your actual content
3. Generate and add app icons
4. Test PWA functionality
5. Deploy to Azure Static Web Apps
6. Share your PWA!

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [Web App Manifest](https://developer.mozilla.org/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)

## License

This project is open source and available under the MIT License.
