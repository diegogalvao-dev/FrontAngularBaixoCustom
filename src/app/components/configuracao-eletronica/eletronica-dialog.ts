import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-eletronica-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './eletronica-dialog.html',
  styleUrl: './eletronica-dialog.css'
})
export class EletronicaDialogComponent {
  selectedId: number | null;
  especificacao: string = '';
  observacoes: string = '';

  constructor(
    public dialogRef: MatDialogRef<EletronicaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      options: any[], 
      initialValue: number | null,
      especificacao?: string,
      observacoes?: string
    }
  ) {
    this.selectedId = data.initialValue;
    this.especificacao = data.especificacao || '';
    this.observacoes = data.observacoes || '';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close({
      id: this.selectedId,
      especificacao: this.especificacao,
      observacoes: this.observacoes
    });
  }
}
