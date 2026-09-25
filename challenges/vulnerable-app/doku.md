# Strategie  
Ich habe zuerst versucht, chatGPT ausserhalb von VSC zu benutzen.  
Dabei wurde der Promt Aufgrund von Cybersecurity geblockt.  
Ich bin dann auf Copilot innerhalb von VSC umgestiegen, und habe abgeklärt, ob Es mich bei diesem Unterfangen überhaupt unterstützt.  
Nach Zusage instruierte ich die KI, wies auf den "vulnerable-app"-Block hin, und wies sie an, das readme zu lesen.  
Ich wies die KI an, die Sicherheitslücken zu finden, und bekam in weniger als einer Minute eine komplette Analyse mit allen 7 Fehlern zurück.  


# SecureNotes – Sicherheitsanalyse

## Überblick

Die App `SecureNotes` enthält bewusst mehrere Sicherheitslücken im Frontend. Ziel der Übung ist es, diese Schwachstellen lokal zu finden, zu analysieren und zu dokumentieren. Die Aufgabenstellung entspricht der Challenge aus `README.md` und ist als didaktisches Sicherheitsprojekt gedacht.

---

## 1. Stored XSS in Kommentaren

**Kategorie:** XSS  
**Betroffene Stelle:** `src/app/services/notes.service.ts`, `src/app/components/note-detail.component.ts`

**Problem:**
Kommentare werden gespeichert und später mit `[innerHTML]` gerendert. Dadurch kann HTML/JS als Teil eines Kommentars ausgeführt werden.

**Beispiel:**
```html
<img src=x onerror="document.title='XSS'">
```

**Risiko:**
- Script-Ausführung im Browser
- Angriffe auf Session, Cookies oder lokale Daten
- Manipulation von UI oder Nutzeraktionen

**Fix:**
- Benutzereingaben validieren und escapen
- HTML sanitizen, bevor es gerendert wird
- Keine rohe HTML-Ausgabe aus Nutzerdaten zulassen

---

## 2. XSS im Admin-Dashboard-Widget

**Kategorie:** XSS  
**Betroffene Stelle:** `src/app/components/admin.component.ts`

**Problem:**
Der Admin kann eigenes HTML eintragen. Dieses wird mit `bypassSecurityTrustHtml()` als vertrauenswürdig markiert und anschließend gerendert.

**Risiko:**
- JavaScript-Ausführung durch eingebettetes HTML
- Datenexfiltration aus dem Browser
- Gefahr für Admin- und Nutzerkonten

**Fix:**
- `bypassSecurityTrustHtml()` nie für Benutzereingaben verwenden
- Eingaben vor der Ausgabe bereinigen
- Nur für trusted interne Templates verwenden

---

## 3. JavaScript-URL im Share-Link

**Kategorie:** URL Injection / XSS  
**Betroffene Stelle:** `src/app/components/profile.component.ts`

**Problem:**
Ein Share-Link wird als `javascript:`-URL erzeugt und mit `bypassSecurityTrustUrl()` akzeptiert.

**Beispiel:**
```ts
const url = `javascript:alert('Profil von: ${this.displayName}')`;
```

**Risiko:**
- Ausführung von JavaScript direkt im Browser
- Phishing- und Schadcode-Scenarios
- Manipulation des Browsers oder der App

**Fix:**
- `javascript:` URLs verbieten
- Nur sichere, validierte URLs akzeptieren
- Keine unsicheren Schemas erlauben

---

## 4. Open Redirect nach Login

**Kategorie:** Redirect Abuse  
**Betroffene Stelle:** `src/app/components/login.component.ts`

**Problem:**
Nach Login wird `returnUrl` direkt in `window.location.href` gesetzt, auch wenn es extern ist.

**Risiko:**
- Nutzer können zu bösartigen Seiten weitergeleitet werden
- Phishing-Angriffe werden erleichtert

**Fix:**
- `returnUrl` nur intern und whitelist-basiert erlauben
- Externe Redirects blockieren
- Nach erfolgreichem Login intern weiterleiten

---

## 5. Fehlende Autorisierung für den Admin-Bereich

**Kategorie:** Broken Access Control  
**Betroffene Stelle:** `src/app/app.routes.ts`, `src/app/components/admin.component.ts`

**Problem:**
Die Route `/admin` ist vorhanden, aber es gibt keine echte Autorisierungsprüfung. Ein unautorisierter Benutzer kann sie direkt aufrufen.

**Risiko:**
- Unberechtigter Zugriff auf sensible Funktionen
- Datenleck von administrativen Informationen

**Fix:**
- Guards verwenden
- Rollenprüfung auf Client- und Serverseite
- Admin-Funktionen nur für berechtigte Nutzer freigeben

---

## 6. Unsichere Token-Storage und fehlende Verifikation

**Kategorie:** Authentication  
**Betroffene Stelle:** `src/app/services/auth.service.ts`

**Problem:**
Das Token wird in `localStorage` gespeichert und durch eine einfache `btoa()`-Logik erzeugt. Es gibt keine echte Signaturprüfung.

**Risiko:**
- Token-Manipulation durch Angreifer
- Rollen- und Identitätsänderung im Frontend
- Falsche Authentifikation

**Fix:**
- Serverseitige Authentifizierung
- Secure HttpOnly Cookies statt localStorage
- echte JWT-Validierung mit Signaturprüfung

---

## 7. Sensitive Informationen im versteckten Debug-Panel

**Kategorie:** Information Disclosure  
**Betroffene Stelle:** `src/app/components/admin.component.ts`

**Problem:**
Im DOM existiert ein versteckter Bereich mit internen Secrets wie DB-Connection-String, API-Key und Admin-Credentials.

**Risiko:**
- Leichtes Auslesen durch Entwickler-Tools oder Quelltextinspection
- Kernsysteme können kompromittiert werden

**Fix:**
- Keine Secrets in Frontend oder DOM hinterlassen
- Konfigurationen nur serverseitig verwalten
- Debug-Informationen vollständig entfernen

---

## Zusammenfassung

Die App enthält mehrere klassische Sicherheitsprobleme:
- XSS
- Broken Access Control
- Open Redirects
- Unsichere Token-Nutzung
- Information Disclosure

Diese Lücken sind bewusst eingebaut, damit sie in der Challenge lokal, sicher und didaktisch analysiert werden können.

---

## Lernziele

- Benutzereingaben niemals ungeprüft rendern
- Autorisierung nicht nur im UI, sondern im Routing-/Backend-Layer prüfen
- Tokens und Secrets niemals im Frontend offenlegen
- Redirect- und URL-Parameter strikt validieren
