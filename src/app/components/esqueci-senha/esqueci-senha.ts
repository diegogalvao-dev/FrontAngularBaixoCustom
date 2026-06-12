import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css',
})
export class EsqueciSenhaComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly erro = signal('');
  readonly sucesso = signal(false);
  readonly enviando = signal(false);

  readonly form = this.formBuilder.group({
    username: ['', [Validators.required]],
  });

  enviar(): void {
    this.erro.set('');
    this.sucesso.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const username = this.form.controls.username.value ?? '';

    this.enviando.set(true);

    this.authService
      .esqueciSenha(username)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.sucesso.set(true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 4000);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.erro.set('Usuário não encontrado.');
            return;
          }
          this.erro.set('Não foi possível solicitar a nova senha. Tente novamente mais tarde.');
        },
      });
  }
}
