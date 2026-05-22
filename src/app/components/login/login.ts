import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly erro = signal('');
  readonly enviando = signal(false);

  readonly form = this.formBuilder.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
  });

  enviar(): void {
    this.erro.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const login = this.form.controls.login.value ?? '';
    const senha = this.form.controls.senha.value ?? '';

    this.enviando.set(true);

    this.authService
      .login(login, senha)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.erro.set('Login ou senha inválidos.');
            return;
          }
          this.erro.set('Não foi possível entrar no momento. Tente novamente mais tarde.');
        },
      });
  }
}

