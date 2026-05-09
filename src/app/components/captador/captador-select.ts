import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CaptadorDialogComponent } from './captador-dialog';

@Component({
  selector: 'app-captador-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="flex flex-col gap-4">
      <button type="button" (click)="openDialog()"
        class="w-full py-8 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-3 group hover:border-red-600/50 hover:bg-red-950/5 transition-all cursor-pointer">
        <span class="material-symbols-outlined text-3xl text-zinc-600 group-hover:text-red-500 transition-colors">vibration</span>
        <div class="text-center">
          <p class="text-zinc-300 font-bold uppercase tracking-widest text-sm">
            {{ getSelectedLabel() || 'Adicionar Captadores' }}
          </p>
          <p class="text-zinc-500 text-xs mt-1">Clique para selecionar os captadores do projeto</p>
        </div>
      </button>
      
      @if (especificacao || observacoes) {
        <div class="p-4 bg-white/5 border border-white/10 rounded text-xs text-zinc-400 space-y-1">
          <p *ngIf="especificacao"><span class="font-bold text-zinc-300">Spec:</span> {{ especificacao }}</p>
          <p *ngIf="observacoes"><span class="font-bold text-zinc-300">Obs:</span> {{ observacoes }}</p>
        </div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CaptadorSelectComponent),
      multi: true
    }
  ]
})
export class CaptadorSelectComponent implements ControlValueAccessor {
  @Input() options: { id: number, name: string, description: string }[] = [
    { id: 1, name: 'Seymour Duncan Quarter Pound', description: 'High output single coil' },
    { id: 2, name: 'EMG Active P-Bass', description: 'Active electronics with punchy tone' },
    { id: 3, name: 'Fender Custom Shop 60s', description: 'Vintage warm tones' }
  ];

  value: number | null = null;
  especificacao: string = '';
  observacoes: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private dialog: MatDialog) {}

  getSelectedLabel() {
    return this.options.find(o => o.id === this.value)?.name;
  }

  openDialog() {
    const dialogRef = this.dialog.open(CaptadorDialogComponent, {
      data: { 
        options: this.options, 
        initialValue: this.value,
        especificacao: this.especificacao,
        observacoes: this.observacoes
      },
      maxWidth: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.value = result.id;
        this.especificacao = result.especificacao;
        this.observacoes = result.observacoes;
        
        this.onChange(this.value);
        this.onTouched();
      }
    });
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
