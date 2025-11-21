# MyARTIVION Authentication Demo

## 🎯 Übersicht

Dies ist eine **Frontend-Only Mockup-Implementierung** der Authentifizierung für die MyARTIVION Mitarbeiter-App. Die Demo simuliert zwei Authentifizierungsmethoden:

1. **Microsoft Login (Azure AD / Entra ID)**
2. **Magic Link Login (E-Mail-basiert)**

⚠️ **WICHTIG**: Dies ist **KEINE echte Authentifizierung**! Es ist ein UX-Demo, das das Look & Feel zeigt, ohne echte Backend-Integration.

## 🚀 Features

### ✅ Was funktioniert (Demo-Modus)

- **Microsoft Login Flow**
  - Authentischer Microsoft-Login-UI
  - E-Mail-Eingabe → Passwort-Schritt → Anmeldung
  - Ladeanimation "Sie werden angemeldet..."
  - Automatische Weiterleitung zur App

- **Magic Link Flow**
  - E-Mail-Eingabe für Magic Link
  - "E-Mail gesendet" Bestätigungsseite
  - Simulierte E-Mail-Vorschau
  - Button zum "Magic Link öffnen"
  - Authentifizierung und Weiterleitung

- **Session Management**
  - localStorage-basierte Session (24 Stunden)
  - Automatische Session-Verlängerung bei Aktivität
  - User-Profil im Header
  - Logout-Funktionalität

- **Geschützte Routen**
  - index.html erfordert Authentication
  - Automatische Weiterleitung zu /login.html wenn nicht authentifiziert

## 📁 Dateistruktur

```
myARTIVION/
├── login.html              # Haupt-Login-Seite
├── magic-link.html         # Magic Link Bestätigungsseite
├── index.html              # Geschützte App-Seite (mit Auth-Check)
├── js/
│   ├── auth.js            # Auth-Logic und Session-Management
│   └── app.js             # Haupt-App-Logic
└── css/
    └── style.css          # Styles (inkl. User-Profile-Styles)
```

## 🔧 Wie es funktioniert

### 1. Login Flow (login.html)

Der Nutzer sieht zwei Optionen:
- **Mit Microsoft anmelden**: Öffnet Microsoft-Login-Modal
- **Magic Link per E-Mail**: Zeigt Magic Link Formular

### 2. Microsoft Login

```
Klick "Mit Microsoft anmelden"
  ↓
Modal öffnet sich
  ↓
E-Mail eingeben → "Weiter"
  ↓
Passwort-Schritt (akzeptiert beliebiges Passwort)
  ↓
Loading-Screen "Sie werden angemeldet..."
  ↓
localStorage.setItem('myartivion_auth', {...})
  ↓
Weiterleitung zu /index.html
```

### 3. Magic Link Login

```
E-Mail eingeben → "Magic Link senden"
  ↓
Weiterleitung zu /magic-link.html
  ↓
Seite zeigt "Prüfe deine E-Mails"
  ↓
Button "Magic Link öffnen" (DEMO)
  ↓
localStorage.setItem('myartivion_auth', {...})
  ↓
Weiterleitung zu /index.html
```

### 4. Session Management (auth.js)

```javascript
// Prüfen ob authentifiziert
Auth.isAuthenticated()  // true/false

// User-Daten abrufen
Auth.getUser()  // { email, name, method, ... }

// Login (wird von login.html aufgerufen)
Auth.login({
  email: 'user@artivion.com',
  method: 'microsoft',
  name: 'Max Mustermann'
})

// Logout
Auth.logout()

// Session schützen (in index.html)
Auth.requireAuth()  // Redirect zu /login.html wenn nicht authentifiziert
```

### 5. Geschützte App-Seite (index.html)

```html
<script src="/js/auth.js"></script>
<script>
  // Prüft Auth und redirectet zu /login.html wenn nötig
  Auth.requireAuth();

  // Zeigt User-Profil im Header
  document.addEventListener('DOMContentLoaded', () => {
    Auth.initAuthUI();
  });
</script>
```

## 💾 localStorage Schema

### Auth Session

```json
{
  "authenticated": true,
  "expiresAt": "2025-11-22T23:30:00.000Z",
  "loginMethod": "microsoft",
  "loginTime": "2025-11-21T23:30:00.000Z"
}
```

Gespeichert unter: `myartivion_auth`

### User Profile

```json
{
  "email": "max.mustermann@artivion.com",
  "name": "max.mustermann",
  "method": "microsoft",
  "avatar": "MM",
  "department": "Demo Department",
  "employeeId": "DEMO1234",
  "joinDate": "2024-01-15"
}
```

Gespeichert unter: `myartivion_user`

## 🔄 Migration zur echten Auth

Wenn du später echte Authentifizierung integrierst, musst du nur folgendes ersetzen:

### Microsoft Login (Azure AD / Entra ID)

```javascript
// Ersetze in login.html:
// Von:
Auth.login({ email, method: 'microsoft', name })

// Zu:
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID"
  }
}
const msalInstance = new msal.PublicClientApplication(msalConfig)
// ... MSAL Login Flow
```

### Magic Link

```javascript
// Ersetze in magic-link.html:
// Von:
Auth.login({ email, method: 'magic-link', name })

// Zu:
fetch('/api/auth/verify-magic-link', {
  method: 'POST',
  body: JSON.stringify({ token: urlParams.get('token') })
})
```

## 🧪 Testing

### Manuelles Testen

1. **Start**: Öffne `/login.html`
2. **Microsoft Login**:
   - Klicke "Mit Microsoft anmelden"
   - Beliebige E-Mail eingeben
   - Beliebiges Passwort eingeben
   - Warte 2 Sekunden → Automatisch eingeloggt
3. **Magic Link**:
   - Klicke "Magic Link per E-Mail"
   - E-Mail eingeben
   - Button "Magic Link senden"
   - Klicke "Magic Link öffnen" → Automatisch eingeloggt
4. **Logout**:
   - In der App: Klicke auf 🚪 Button im Header
   - Bestätige Logout
   - Weiterleitung zu /login.html

### Console Debugging

```javascript
// Status checken
debugAuth()

// Manuell einloggen
Auth.login({
  email: 'test@artivion.com',
  method: 'microsoft',
  name: 'Test User'
})

// Manuell ausloggen
Auth.logout()
```

## 🎨 UI/UX Details

### Microsoft Login Modal
- Authentisches Microsoft-Design
- Windows-Farben: #2F2F2F (Schwarz)
- Schrittweise Navigation: E-Mail → Passwort
- Loading Spinner während Anmeldung

### Magic Link Seite
- Freundlicher "Prüfe deine E-Mails" Screen
- Animiertes E-Mail-Icon
- Schritt-für-Schritt Anleitung
- Demo-Badge für Testzwecke
- Vorschau der E-Mail (Demo)

### User Profile (Header)
- Avatar mit Initialen
- Name und E-Mail
- Gradient-Hintergrund (Artivion-Farben)
- Logout-Button
- Responsive Design (Mobile: nur Avatar)

## 📱 Responsive Design

- Desktop: Volle User-Info (Avatar + Name + E-Mail)
- Tablet: Avatar + Name
- Mobile: Nur Avatar + Logout-Button

## ⚙️ Konfiguration

### Session-Dauer ändern

In `auth.js`:

```javascript
// Von 24 Stunden ändern zu z.B. 1 Stunde:
expiresAt.setHours(expiresAt.getHours() + 1); // statt + 24
```

### Auto-Extension Threshold ändern

```javascript
// Von 30 Minuten ändern zu z.B. 15 Minuten:
const extendThreshold = 15 * 60 * 1000; // statt 30
```

## 🔐 Sicherheitshinweise

⚠️ **Für Production NICHT geeignet!**

- Keine echte Authentifizierung
- Keine Verschlüsselung
- Keine Token-Validierung
- localStorage ist client-seitig manipulierbar

Für Production brauchst du:
- OAuth 2.0 / OpenID Connect
- JWT Tokens
- Backend-Validierung
- HTTPS
- CSRF-Schutz
- Rate Limiting

## 📝 Nächste Schritte

1. ✅ **UX/UI testen** - Diese Demo verwenden
2. 🔄 **Backend integrieren** - Echte Azure AD / Magic Link APIs
3. 🔐 **Security implementieren** - JWT, HTTPS, etc.
4. 📊 **Monitoring** - Login-Analytics, Fehlerbehandlung

## 🤝 Support

Bei Fragen zur Demo:
- Dokumentation: Diese README
- Debug: `debugAuth()` in Console
- Code: Siehe Kommentare in `auth.js`

---

**Demo erstellt für**: MyARTIVION Mitarbeiter-App
**Zweck**: UX-Demonstrator für Authentifizierung
**Status**: ✅ Frontend-Demo (Production-ready UX, NO real auth)
