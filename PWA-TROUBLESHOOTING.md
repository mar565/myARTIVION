# 🔧 PWA Troubleshooting Guide

## Häufige Probleme und Lösungen

### Problem: "PWA wird nicht installierbar angezeigt"

#### Ursachen & Lösungen:

1. **HTTPS nicht aktiv**
   - ❌ PWAs erfordern HTTPS (außer auf localhost)
   - ✅ **Lösung**: Verwenden Sie `https://` oder testen Sie auf `localhost`

2. **Service Worker nicht registriert**
   - ❌ Service Worker Registrierung fehlgeschlagen
   - ✅ **Lösung**:
     ```bash
     # Browser-Konsole öffnen (F12)
     # Nach Fehlern suchen
     # Service Worker neu registrieren
     ```

3. **Manifest nicht gefunden**
   - ❌ `/manifest.json` gibt 404 zurück
   - ✅ **Lösung**: Prüfen Sie ob die Datei existiert:
     ```bash
     curl http://localhost:8000/manifest.json
     ```

4. **Icons fehlen**
   - ❌ Icons unter `/icons/` nicht erreichbar
   - ✅ **Lösung**: Icons neu generieren:
     ```bash
     npm run generate-icons
     ```

5. **Browser-Anforderungen nicht erfüllt**
   - ❌ Browser unterstützt PWAs nicht vollständig
   - ✅ **Lösung**: Verwenden Sie:
     - Chrome/Edge Desktop/Android (✅ Volle Unterstützung)
     - Safari iOS (⚠️ Eingeschränkte Unterstützung)
     - Firefox Android (⚠️ Teilweise Unterstützung)

---

## 🧪 Schritt-für-Schritt Diagnose

### 1. Test-Seite öffnen
```
http://localhost:8000/pwa-test.html
```

Diese Seite zeigt Ihnen **genau**, was funktioniert und was nicht.

### 2. Browser DevTools prüfen

**Chrome/Edge:**
1. Drücken Sie `F12`
2. Gehe zu "Application" Tab
3. Prüfen Sie:
   - **Manifest**: Sollte geladen sein mit allen Icons
   - **Service Workers**: Sollte "activated and is running" zeigen
   - **Storage**: Cache Storage sollte Einträge haben

**Console-Fehler:**
- Öffnen Sie "Console" Tab
- Suchen Sie nach roten Fehlermeldungen
- Häufige Fehler:
  - `Failed to register service worker`
  - `Manifest: Line X, column Y, ...`
  - `net::ERR_FILE_NOT_FOUND`

### 3. Manifest validieren

```bash
# Manifest laden und prüfen
curl http://localhost:8000/manifest.json | python3 -m json.tool
```

**Muss enthalten:**
- ✅ `name` oder `short_name`
- ✅ `start_url`
- ✅ `display` (z.B. "standalone")
- ✅ `icons` Array mit mindestens einem Icon ≥ 192px

### 4. Service Worker Status prüfen

**In Browser-Console:**
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Active:', reg?.active?.state);
  console.log('Scope:', reg?.scope);
});
```

**Erwartetes Ergebnis:**
```
Service Worker: ServiceWorkerRegistration {...}
Active: "activated"
Scope: "http://localhost:8000/"
```

### 5. Cache prüfen

**In Browser-Console:**
```javascript
caches.keys().then(keys => {
  console.log('Caches:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key}: ${requests.length} items`);
      });
    });
  });
});
```

### 6. Installation testen

**beforeinstallprompt Event prüfen:**
```javascript
// In Browser-Console
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ Install Prompt verfügbar!');
});
```

---

## 🚨 Spezifische Fehlermeldungen

### "Failed to register a ServiceWorker"

**Ursache**: Service Worker konnte nicht registriert werden

**Lösungen:**
1. Prüfen Sie den Dateipfad:
   ```javascript
   // In index.html / app.js
   navigator.serviceWorker.register('/service-worker.js')
   ```

2. Prüfen Sie ob die Datei existiert:
   ```bash
   ls -la service-worker.js
   ```

3. Prüfen Sie auf Syntax-Fehler:
   ```bash
   node -c service-worker.js
   ```

4. Scope-Probleme:
   ```javascript
   // Expliziten Scope setzen
   navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
   ```

### "Manifest: property 'X' ignored"

**Ursache**: Ungültige Manifest-Eigenschaften

**Lösung:**
```bash
# Manifest validieren mit Online-Tool
# https://manifest-validator.appspot.com/

# Oder lokale Validierung
cat manifest.json | jq .
```

### "No matching service worker detected"

**Ursache**: Service Worker Scope passt nicht zur aktuellen URL

**Lösung:**
```javascript
// Service Worker deregistrieren und neu registrieren
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.unregister().then(() => {
      location.reload();
    });
  }
});
```

### Icons werden nicht angezeigt

**Ursache**: Icon-Pfade falsch oder Dateien fehlen

**Lösung:**
```bash
# Icons prüfen
ls -la icons/

# Icons neu generieren
npm run generate-icons

# Einzelnes Icon testen
curl -I http://localhost:8000/icons/icon-192x192.png
```

---

## 🔄 Reset & Neustart

### Alles zurücksetzen

```javascript
// In Browser-Console ausführen:

// 1. Service Worker deregistrieren
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) reg.unregister();
});

// 2. Alle Caches löschen
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// 3. LocalStorage leeren (optional)
localStorage.clear();

// 4. Seite neu laden
location.reload();
```

**Oder im Chrome DevTools:**
1. F12 → Application Tab
2. "Clear storage" auf der linken Seite
3. "Clear site data" klicken

---

## ✅ PWA Installation Checkliste

Prüfen Sie Folgendes ab:

- [ ] **HTTPS aktiv** (oder localhost)
- [ ] **manifest.json** lädt ohne Fehler
- [ ] **Mindestens 2 Icons** vorhanden (192px und 512px)
- [ ] **Service Worker** registriert und aktiv
- [ ] **Cache** enthält Ressourcen
- [ ] **display: "standalone"** im Manifest
- [ ] **start_url** gesetzt
- [ ] **name** oder **short_name** gesetzt
- [ ] **theme_color** gesetzt (optional, aber empfohlen)

---

## 🌐 Browser-spezifische Hinweise

### Chrome / Edge Desktop
- ✅ Beste PWA-Unterstützung
- ✅ Install-Button in Adressleiste
- ✅ Zeigt beforeinstallprompt Event

**Installieren:**
- Klick auf ⊕ Symbol in der Adressleiste
- Oder: Menü → "App installieren..."

### Chrome Android
- ✅ Volle PWA-Unterstützung
- ✅ Zeigt Banner "Zum Startbildschirm hinzufügen"

**Installieren:**
- Menü → "Zum Startbildschirm hinzufügen"
- Oder: Banner unten antippen

### Safari iOS
- ⚠️ Eingeschränkte PWA-Unterstützung
- ❌ Kein beforeinstallprompt Event
- ❌ Kein automatischer Install-Prompt

**Installieren:**
- Teilen-Button → "Zum Home-Bildschirm"

**Einschränkungen:**
- Service Worker Funktionalität eingeschränkt
- Kein Background Sync
- Keine Push Notifications (ab iOS 16.4 teilweise)
- Maximale Cache-Größe begrenzt

### Firefox Android
- ⚠️ Teilweise PWA-Unterstützung
- ✅ Service Worker funktioniert
- ⚠️ Install-Funktion eingeschränkt

---

## 📊 Test-Tools

### Online Tools:
1. **Lighthouse** (Chrome DevTools)
   - F12 → Lighthouse Tab
   - "Progressive Web App" auswählen
   - "Generate report" klicken

2. **PWA Builder**
   - https://www.pwabuilder.com/
   - URL eingeben und analysieren

3. **Manifest Validator**
   - https://manifest-validator.appspot.com/

### Lokale Tests:
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:8000 --view

# PWA-Test-Seite
open http://localhost:8000/pwa-test.html
```

---

## 🐛 Weitere Debug-Tipps

### Service Worker Logs aktivieren

```javascript
// In service-worker.js: Mehr Logging hinzufügen
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', event);
  // ...
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...', event);
  // ...
});

self.addEventListener('fetch', (event) => {
  console.log('[SW] Fetching:', event.request.url);
  // ...
});
```

### Netzwerk-Requests tracken

**Chrome DevTools:**
1. F12 → Network Tab
2. Seite neu laden
3. Prüfen Sie:
   - `manifest.json` - Sollte 200 OK sein
   - `service-worker.js` - Sollte 200 OK sein
   - Alle Icons - Sollten 200 OK sein

### Cache inspizieren

**Chrome DevTools:**
1. F12 → Application Tab
2. Cache Storage (links)
3. Klicken Sie auf Ihren Cache
4. Sehen Sie alle gecachten Ressourcen

---

## 📞 Noch Probleme?

Wenn nichts funktioniert:

1. **Öffnen Sie**: `http://localhost:8000/pwa-test.html`
2. **Öffnen Sie**: Browser DevTools (F12)
3. **Kopieren Sie**: Alle Fehler aus der Console
4. **Überprüfen Sie**: Die Test-Ergebnisse der Diagnose-Seite

Häufigste Ursache: **HTTPS fehlt in Produktion!**

---

**Geschrieben für MyARTIVION PWA**
Version 1.0 - November 2024
