import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Admin-Bereich</h1>
    <br>

    <div class="card">
      <h3>Dashboard-Widget Editor</h3>
      <p style="color: #666; margin-bottom: 1rem;">
        Passe das Begrüssungs-Widget für das Dashboard an. HTML-Formatierung ist erlaubt.
      </p>
      <label>
        Widget-HTML
        <textarea
          [(ngModel)]="widgetHtml"
          name="widget"
          rows="5"
          placeholder="<h2>Willkommen!</h2><p>Hier steht dein Widget-Text...</p>"
        ></textarea>
      </label>
      <button class="btn btn-primary" (click)="updateWidget()">Widget aktualisieren</button>
    </div>

    <div class="card">
      <h3>Vorschau</h3>
      <div [innerHTML]="trustedWidgetHtml()"></div>
    </div>

    <div class="card">
      <h3>System-Info</h3>
      <table style="width: 100%;">
        <tr>
          <td><strong>Benutzer:</strong></td>
          <td>{{ auth.getUser()?.username ?? 'Nicht angemeldet' }}</td>
        </tr>
        <tr>
          <td><strong>Rolle:</strong></td>
          <td>
            @if (auth.getUser()?.role === 'admin') {
              <span class="badge badge-admin">Admin</span>
            } @else {
              <span class="badge badge-user">User</span>
            }
          </td>
        </tr>
        <tr>
          <td><strong>Token:</strong></td>
          <td style="word-break: break-all; font-size: 0.75rem; font-family: monospace;">
            {{ auth.getToken() ?? 'Kein Token' }}
          </td>
        </tr>
      </table>
    </div>

    <div class="card">
      <h3>Systemstatus</h3>
      <p style="color: #666; margin: 0;">
        Keine internen Secrets oder Debug-Informationen werden im Frontend angezeigt.
      </p>
    </div>
  `,
})
export class AdminComponent {
  auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  widgetHtml = '<h2>Willkommen im Admin-Bereich!</h2><p>Hier kannst du die App verwalten.</p>';
  trustedWidgetHtml = signal<SafeHtml>('');

  constructor() {
    this.updateWidget();
  }

  updateWidget() {
    this.trustedWidgetHtml.set(
      this.sanitizer.bypassSecurityTrustHtml(this.widgetHtml)
    );
  }
}
