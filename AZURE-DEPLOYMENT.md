# Azure Static Web Apps Deployment Guide

## MyARTIVION PWA - Static Website Deployment

MyARTIVION ist eine **statische Website** (reine HTML/CSS/JS) und benötigt **keinen Build-Output-Ordner**.

## ⚠️ Wichtige Azure-Konfiguration

### GitHub Actions Workflow

Ihre `.github/workflows/azure-static-web-apps-*.yml` sollte so konfiguriert sein:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          ###### Repository/Build Configurations ######
          app_location: "/"                    # App-Root (wichtig!)
          output_location: ""                  # LEER LASSEN! Keine separaten Build-Artefakte
          skip_app_build: false                # false, damit npm install läuft
          app_build_command: "npm run build"   # Nur Icons generieren
          ###### End of Repository/Build Configurations ######

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### 🔑 Wichtigste Einstellungen:

| Setting | Wert | Erklärung |
|---------|------|-----------|
| `app_location` | `"/"` | Root des Repositories |
| `output_location` | `""` | **LEER LASSEN!** Keine Build-Artefakte |
| `skip_app_build` | `false` | npm install muss laufen für Icons |
| `app_build_command` | `"npm run build"` | Generiert nur PWA-Icons |

## 📦 Was passiert beim Build?

```bash
1. npm install
   └─> Installiert sharp (für Icon-Generierung)

2. npm run build
   └─> node generate-pwa-icons.js
       └─> Generiert PWA-Icons in /icons

3. Azure deployed direkt aus Root
   ✅ index.html
   ✅ login.html
   ✅ manifest.json
   ✅ service-worker.js
   ✅ css/
   ✅ js/
   ✅ icons/
   ✅ images/
```

## ✅ Wichtig: Kein Build-Output-Ordner!

MyARTIVION ist eine **statische Website**:
- ❌ Kein webpack, kein vite, kein Next.js
- ❌ Kein /dist, /build, /out Ordner
- ✅ Alle Dateien sind direkt im Root
- ✅ Nur Icons werden generiert

**Deshalb:** `output_location: ""` (leer lassen!)

## 🔧 Alternative: Skip App Build

Falls Sie Probleme mit der Build-Erkennung haben:

```yaml
skip_app_build: true        # Komplett überspringen
app_build_command: ""       # Leer
```

Dann Icons manuell vor dem Commit generieren:
```bash
npm install
npm run generate-icons
git add icons/
git commit -m "Update PWA icons"
```

## 🐛 Troubleshooting

### Problem: "Unable to determine app artifacts location"

**Lösung 1 - Workflow anpassen:**
```yaml
output_location: ""  # MUSS leer sein für statische Sites
```

**Lösung 2 - Build überspringen:**
```yaml
skip_app_build: true
```

**Lösung 3 - Oryx-Hints hinzufügen:**

Erstellen Sie `.oryx_env_vars` im Root:
```bash
ENABLE_ORYX_BUILD=false
```

### Problem: "Service Worker lädt nicht"

Azure Static Web Apps kann Service Worker manchmal blocken.

**Lösung in `staticwebapp.config.json`:**
```json
{
  "routes": [
    {
      "route": "/service-worker.js",
      "headers": {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Service-Worker-Allowed": "/"
      }
    }
  ]
}
```

### Problem: "Manifest.json 404"

**Prüfen Sie:**
1. Datei heißt exakt `manifest.json` (lowercase)
2. Liegt im Root-Verzeichnis
3. Ist in git committed

```bash
git ls-files | grep manifest.json
# Sollte ausgeben: manifest.json
```

## 📊 Deployment-Checkliste

- [ ] GitHub Actions Workflow hat `output_location: ""`
- [ ] `skip_app_build: false` (damit npm install läuft)
- [ ] Icons sind generiert (`npm run generate-icons`)
- [ ] `manifest.json` ist im Root
- [ ] `service-worker.js` ist im Root
- [ ] Alle HTML/CSS/JS-Dateien sind committed
- [ ] `staticwebapp.config.json` ist konfiguriert

## 🚀 Manuelle Deployment-Schritte

Falls Automatik nicht funktioniert:

```bash
# 1. Icons generieren
npm install
npm run generate-icons

# 2. Änderungen committen
git add icons/
git commit -m "Generate PWA icons"
git push

# 3. Azure deployed automatisch via GitHub Actions
```

## 📚 Weitere Ressourcen

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Deployment Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [GitHub Actions Integration](https://learn.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)

---

**Wichtig:** MyARTIVION ist eine **statische PWA** ohne Build-Prozess.
Azure sollte die Dateien **direkt aus dem Root** verwenden!
