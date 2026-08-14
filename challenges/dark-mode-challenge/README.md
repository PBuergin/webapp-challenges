# Dark Mode in 25 Minuten

**Kurstag:** 06 — SCSS & Angular Material Design
**Typ:** In-Class Coding
**Dauer:** 25 Min.
**Format:** Partnerarbeit (Pair Programming)

---

## Ausgangslage

Du erhältst eine Angular-App mit einem funktionierenden **Light-Theme** (Angular Material 3). Die App hat einen Header und Content-Bereich mit Cards. Alles sieht gut aus — aber es fehlt der **Dark Mode**.

## Aufgabe

Baue einen funktionierenden **Dark-Mode-Toggle** ein — in nur 25 Minuten!

### Was du umsetzen musst

1. **Material 3 Dark-Mode-Palette konfigurieren** (CSS Custom Properties)
2. **Toggle-Button/Switch im Header** einbauen (z.B. `mat-slide-toggle`)
3. **Theme-Klasse** (`dark-theme`) am `<body>` togglen
4. **Prüfen**, ob alle Komponenten korrekt dargestellt werden

## Hinweise

- Schau dir die Starter-SCSS an — dort sind Platzhalter für die Dark-Theme-Konfiguration
- Material 3 nutzt **CSS Custom Properties** für Theming (kein SCSS-Mixin nötig)
- `document.body.classList.toggle('dark-theme')` ist dein Freund
- Kein Full-Reload nötig — der Theme-Wechsel soll sofort und ohne Flickern funktionieren

## Bonus

Wenn du früher fertig bist: Speichere die Theme-Präferenz im `localStorage`, damit sie beim nächsten Laden erhalten bleibt.

## Praxisbezug

Dark Mode ist ein Standard-Feature in modernen Apps. Nach dieser Challenge kannst du es direkt in deinem Kurs-Projekt einbauen!
