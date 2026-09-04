import { Component, signal } from '@angular/core';
import { form, FormField, required, minLength, email } from '@angular/forms/signals';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [FormField],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" [formField]="userForm.name" placeholder="Max Muster" />
        @if (userForm.name().touched() && !userForm.name().valid()) {
          <span class="error">Name ist erforderlich (min. 2 Zeichen)</span>
        }
      </div>

      <div class="form-group">
        <label for="email">E-Mail</label>
        <input id="email" type="email" [formField]="userForm.email" placeholder="max@beispiel.ch" />
        @if (userForm.email().touched() && !userForm.email().valid()) {
          <span class="error">Bitte gib eine gültige E-Mail-Adresse ein</span>
        }
      </div>

      <div class="form-group">
        <label for="password">Passwort</label>
        <input id="password" type="password" [formField]="userForm.password" placeholder="Min. 8 Zeichen" />
        @if (userForm.password().touched() && !userForm.password().valid()) {
          <span class="error">Passwort ist erforderlich (min. 8 Zeichen)</span>
        }
      </div>

      <div class="form-group">
        <label for="age">Alter</label>
        <input id="age" type="number" [formField]="userForm.age" placeholder="25" />
        @if (userForm.age().touched() && !userForm.age().valid()) {
          <span class="error">Alter ist erforderlich</span>
        }
      </div>

      <button type="submit" [disabled]="userForm().valid()">
        Registrieren
      </button>
    </form>

    @if (submitted()) {
      <div class="success">
        Registrierung erfolgreich!
      </div>
    }
  `,
  styles: [`
    form {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.375rem;
      font-size: 0.9rem;
    }
    input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.15s;
    }
    input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .error {
      display: block;
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:hover:not(:disabled) {
      background: #1d4ed8;
    }
    button:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }
    .success {
      margin-top: 1.5rem;
      padding: 1rem 1.5rem;
      background: #ecfdf5;
      border-radius: 8px;
      color: #065f46;
      font-weight: 600;
      text-align: center;
    }
  `]
})
export class RegistrationFormComponent {
  model = signal({ name: '', email: '', password: '', age: '' });

  userForm = form(this.model, (path) => {
    required(path.name);
    minLength(path.name, 2);
    required(path.email);
    minLength(path.email, 5);
    required(path.password);
    minLength(path.password, 8);
    required(path.age);
  });

  submitted = signal(false);

  onSubmit() {
    if (this.userForm().valid()) {
      const value = this.userForm().value();
      console.log('Registrierung:', value);
      this.submitted.set(true);
    }
  }
}
