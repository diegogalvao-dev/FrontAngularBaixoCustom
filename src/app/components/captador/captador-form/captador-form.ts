import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CaptadorService } from '../../../services/captador.service';
import { Captador } from '../../../models/captador.model';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-captador-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
  templateUrl: './captador-form.html',
  styleUrl: './captador-form.css'
})
export class CaptadorForm implements OnInit {

  readonly form: FormGroup;
  posicaoOptions = [
    { value: 'BRANCO', label: 'Braço' },
    { value: 'MEIO', label: 'Meio' },
    { value: 'PONTE', label: 'Ponte' }
  ];

  constructor(
    private fb: FormBuilder,
    private captadorService: CaptadorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      id: [null],
      marca: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      captadorPosicao: [null, [Validators.required]],
      type: ['passivo', [Validators.required]],
      possuiBateria: [false],
      possuiAmplificador: [false],
      resistencia: [null],
      numeroBobinas: [null]
    });
  }

  ngOnInit(): void {
    const captador: Captador = this.activatedRoute.snapshot.data['captador'];
    if (captador) {
      this.form.patchValue(captador);
    }
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = { ...this.form.value };
    // Polymorphic cleanup
    if (value.type === 'ativo') {
      delete value.resistencia;
      delete value.numeroBobinas;
    } else {
      delete value.possuiBateria;
      delete value.possuiAmplificador;
    }

    const operacao = value.id
      ? this.captadorService.update(value)
      : this.captadorService.create(value);

    operacao.subscribe({
      next: () => {
        this.router.navigate(['/captadores']);
        this.exibirMensagem('Captador salvo com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao salvar captador:', err);
        this.exibirMensagem('Erro ao salvar captador. Tente novamente.');
      }
    });
  }

  excluir() {
    if (this.form.value.id) {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        data: {
          title: 'Confirmar Exclusão',
          message: 'Tem certeza que deseja excluir este captador?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.captadorService.delete(this.form.value.id).subscribe({
            next: () => {
              this.router.navigate(['/captadores']);
              this.exibirMensagem('Captador excluído com sucesso!');
            },
            error: () => {
              this.exibirMensagem('Erro ao excluir o captador.');
            }
          });
        }
      });
    }
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
