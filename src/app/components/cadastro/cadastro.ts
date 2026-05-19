import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  cadastroForm: FormGroup;
  isLoading = signal(false);
  showSuccess = signal(false);

  constructor(private fb: FormBuilder, private router: Router) {
    this.cadastroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
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
        // Clear error if they match now
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
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.showSuccess.set(true);

    // Simulate backend response
    setTimeout(() => {
      this.isLoading.set(false);
      this.showSuccess.set(false);
      this.router.navigate(['/login']);
    }, 2500);
  }
}
