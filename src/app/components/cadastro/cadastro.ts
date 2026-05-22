import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  cadastroForm: FormGroup;
  isLoading = signal(false);
  showSuccess = signal(false);
  erro = signal('');

  constructor() {
    this.cadastroForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        if (confirmPassword.hasError('passwordMismatch')) {
          const errors = confirmPassword.errors;
          if (errors) {
            delete errors['passwordMismatch'];
            confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    this.erro.set('');

    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const email = this.cadastroForm.controls['email'].value;
    const username = this.cadastroForm.controls['username'].value;
    const password = this.cadastroForm.controls['password'].value;

    this.isLoading.set(true);

    this.authService.register(email, username, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showSuccess.set(true);
        setTimeout(() => {
          this.showSuccess.set(false);
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 409 || error.error?.message?.includes('unique') || error.error?.message?.includes('duplicate')) {
          this.erro.set('O nome de usuário ou e-mail já está cadastrado.');
        } else {
          this.erro.set('Não foi possível realizar o cadastro. Tente novamente mais tarde.');
        }
      }
    });
  }
}
