import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfiguracaoEletronicaService } from '../../services/configuracao-eletronica.service';
import { ConfiguracaoEletronica } from '../../models/configuracao-eletronica.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-eletronica-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule,
    ReactiveFormsModule,
    MatDialogModule],
  templateUrl: './eletronica-dialog.html',
  styleUrl: './eletronica-dialog.css'
})
export class EletronicaDialogComponent implements OnInit {

  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ConfiguracaoEletronicaService: ConfiguracaoEletronicaService,
    public dialogRef: MatDialogRef<EletronicaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracaoEletronica
  ) {
    this.form = this.fb.group({
      id: [null],
      circuitoAtivo: [false],
      volumeKnobs: [null],
      toneKnobs: [null]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        id: this.data.id,
        circuitoAtivo: this.data.circuitoAtivo,
        volumeKnobs: this.data.volumeKnobs,
        toneKnobs: this.data.toneKnobs
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) {
      return;
    }

    const configuracao = this.form.value;
    const operacao = configuracao.id 
      ? this.ConfiguracaoEletronicaService.update(configuracao)
      : this.ConfiguracaoEletronicaService.create(configuracao);

    operacao.subscribe({
      next: (resultado) => {
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        console.error('Erro ao salvar configuração eletrônica:', err);
      }
    });
  }
}
