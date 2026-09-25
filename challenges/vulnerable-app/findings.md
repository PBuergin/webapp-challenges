# Security Findings – SecureNotes

Dieses Dokument beschreibt die 7 Sicherheitslücken, die absichtlich in der Angular-App eingebaut wurden. Die Analyse basiert auf den Dateien innerhalb des Challenge-Ordners `vulnerable-app`.

---

## 1. Stored XSS in Kommentaren

**Kategorie:** XSS  
**Wo:** `src/app/services/notes.service.ts`, `src/app/components/note-detail.component.ts`

**Exploit:**
1. Ein Benutzer schreibt einen Kommentar mit HTML/JS, zum Beispiel:
   ```html
   <img src=x onerror="document.title='XSS'">
   ```
2. Der Kommentar wird in `notes.service.ts` gespeichert.
3. In `note-detail.component.ts` wird `comment.text` mit `[innerHTML]` gerendert.
4. Beim Öffnen der Notiz wird der Browser den Code ausführen.

**Risiko:**
- Angreifer können Cookies, Tokens oder andere sensible Daten auslesen.
- Der Angreifer kann Aktionen im Namen anderer Nutzer simulieren.
- Das führt zu Session Hijacking und weiteren Anomalien im Frontend.

**Fix:**
- Keine Roh-HTML-Ausgabe aus Benutzereingaben zulassen.
- Eingaben vor dem Speichern bereinigen oder escapen.
- Nur vertrauenswürdige Inhalte mit einem Sanitizer rendern.

---

## 2. XSS im Admin-Dashboard-Widget

**Kategorie:** XSS  
**Wo:** `src/app/components/admin.component.ts`

**Exploit:**
1. Im Admin-Bereich gibt es ein Textfeld für benutzerdefiniertes HTML.
2. Das Feld wird über `[(ngModel)]` gespeichert.
3. `updateWidget()` ruft `bypassSecurityTrustHtml(this.widgetHtml)` auf.
4. Das HTML wird anschließend mit `[innerHTML]` dargestellt.
5. Ein Angreifer kann beliebigen JavaScript-Code einfügen, z. B. ein `script`-Tag oder ein ausführbares Event-Attribut.

**Risiko:**
- Ein Admin oder ein mit Admin-Rechten arbeitender Benutzer kann beliebigen Code im Browser ausführen.
- Dadurch können Token, Benutzerdaten oder vertrauliche Informationen abgegriffen werden.

**Fix:**
- `bypassSecurityTrustHtml()` niemals für Benutzereingaben verwenden.
- HTML vor der Ausgabe sanitize.
- Nur eine stark eingeschränkte HTML-Syntax erlauben.

---

## 3. JavaScript-URL im Share-Link (javascript: URL)

**Kategorie:** XSS / URL Injection  
**Wo:** `src/app/components/profile.component.ts`

**Exploit:**
1. Ein Nutzer gibt im Profil einen Namen ein.
2. `generateShareLink()` erzeugt einen Link mit:
   ```ts
   const url = `javascript:alert('Profil von: ${this.displayName}')`;
   ```
3. `bypassSecurityTrustUrl(url)` akzeptiert die unsichere URL.
4. Wenn ein anderer auf den Link klickt, wird JavaScript im Browser ausgeführt.

**Risiko:**
- JavaScript-Ausführung im Browser ohne Benutzer-Absicherung.
- Phishing, DOM-Manipulation, Token-Exfiltration oder ungewollte Aktionen sind möglich.

**Fix:**
- `javascript:`-URLs verbieten.
- Nur erlaubte, sichere URLs akzeptieren.
- Den Link mit einer echten, validierten URL erzeugen und nicht mit einem Browser-Schema.

---

## 4. Open Redirect nach Login

**Kategorie:** Authentication / Redirect Abuse  
**Wo:** `src/app/components/login.component.ts`

**Exploit:**
1. Ein Angreifer erstellt einen Link mit einem `returnUrl`, z. B.:
   ```text
   /login?returnUrl=https://evil.example/
   ```
2. Nach erfolgreichem Login wird in `onLogin()` folgendes ausgeführt:
   ```ts
   window.location.href = returnUrl;
   ```
3. Der Nutzer wird auf die bösartige Seite weitergeleitet.

**Risiko:**
- Phishing-Angriffe sind leicht möglich.
- Benutzer können auf gefälschte Login-Seiten oder schädliche Inhalte geleitet werden.

**Fix:**
- `returnUrl` nur aus einer erlaubten Liste oder einer sicheren, internen Route akzeptieren.
- Absolute externe URLs blockieren.
- Nach dem Login stattdessen intern weiterleiten.

---

## 5. Fehlende Autorisierung für den Admin-Bereich

**Kategorie:** Authorization / Broken Access Control  
**Wo:** `src/app/app.routes.ts`, `src/app/components/admin.component.ts`, `src/app/components/app.component.ts`

**Exploit:**
1. Die Route `/admin` existiert in der Router-Konfiguration.
2. Es gibt keine Guard-Logik, die prüft, ob der Nutzer wirklich angemeldet und adminisiert ist.
3. Selbst wenn der Link im UI für nicht angemeldete Nutzer versteckt ist, kann ein Angreifer direkt zur Route navigieren.
4. Die App zeigt den Admin-Bereich über einfache UI-Prüfungen an, aber sie schützt die Route nicht im Routing-Layer.

**Risiko:**
- Unautorisierte Nutzer können vertrauliche Funktionen aufrufen.
- Besonders kritisch, da im Admin-Bereich sensible Informationen sichtbar sind.

**Fix:**
- `CanActivate`-Guards im Router verwenden.
- Rollenprüfung auf Server- und Clientseite.
- Admin-Views nur nach gültiger Session und passenden Rechten anzeigen.

---

## 6. Insecure Token Storage und fehlende Signature-Verifikation

**Kategorie:** Authentication / Token Security  
**Wo:** `src/app/services/auth.service.ts`

**Exploit:**
1. Beim Login wird ein JWT-ähnliches Token in `localStorage` gespeichert.
2. Das Token wird mit `btoa(...)` generiert und enthält keine echte Signatur-Verifikation.
3. `getUser()` decodiert den Payload einfach mit `atob(token.split('.')[1])`.
4. Es gibt keine Prüfung, ob das Token wirklich signiert wurde oder manipuliert wurde.
5. Ein Angreifer kann das Token im Browser verändern und so Rolle oder Identität nachahmen.

**Risiko:**
- Ein Angreifer kann sich als Admin ausgeben, indem er den Token verändert.
- Vertrauliche Daten können so leicht ausgelesen werden.

**Fix:**
- Tokens nicht im localStorage speichern, sondern nur sichere HttpOnly-Cookies verwenden.
- echte JWT-Verifikation mit Signatur und Ablaufzeit.
- Server-seitige Authentifizierung und Autorisierung.

---

## 7. Sensible Informationen im versteckten Debug-Panel

**Kategorie:** Information Disclosure  
**Wo:** `src/app/components/admin.component.ts`

**Exploit:**
1. Im Admin-Bereich ist ein verstecktes `<div id="debug-panel">` eingebaut.
2. Das Element hat `style="display: none;"`.
3. Trotzdem ist der Text im DOM vorhanden und kann über Entwickler-Tools, DOM-Inspection oder einfache HTML-Quellenprüfung gelesen werden.
4. Dort stehen:
   - Datenbank-Connection-String
   - API-Key
   - Admin-Credentials

**Risiko:**
- Angreifer erhalten sofort Zugriff auf interne Secrets.
- Die App verrät kritische Konfigurationsdetails, die in einer echten Anwendung niemals im Frontend stehen sollten.

**Fix:**
- Niemals Secrets oder interne Verbindungsdetails im Frontend speichern.
- Keine Debug-Infos im DOM lassen.
- Secrets nur serverseitig und mit strikten Zugriffsbeschränkungen verwalten.

---

## Gesamtfazit

Die App enthält bewusst mehrere klassische Web-Security-Probleme: XSS, Broken Access Control, Insecure Token Handling, Open Redirects und Information Disclosure. Genau diese Schwachstellen sind in der Challenge vorgesehen, damit sie lokal und sicher analysiert werden können.

Die wichtigsten Lernziele sind:
- Benutzereingaben niemals ungeprüft rendern.
- Autorisierung nicht nur im UI, sondern im Route-/Backend-Layer prüfen.
- Tokens und Secrets niemals im Frontend offenlegen.
- URLs und Redirects vorsichtig validieren.
