import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CaptadorService } from '../../services/captador.service';
import { Captador } from '../../models/captador.model';

@Component({
  selector: 'app-captador-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './captador-dialog.html',
  styleUrl: './captador-dialog.css'
})
export class CaptadorDialogComponent implements OnInit {
  
  readonly form: FormGroup;
  mode: 'selection' | 'form' = 'selection';
  
  allCaptadores = signal<Captador[]>([]);
  searchTerm = signal('');
  selectedFromList: Captador | null = null;

  filteredCaptadores = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allCaptadores();
    return this.allCaptadores().filter(cap => 
      cap.marca.toLowerCase().includes(term) || 
      cap.type.toLowerCase().includes(term) ||
      cap.captadorPosicao.toLowerCase().includes(term)
    );
  });

  posicaoOptions = [
    { value: 'BRANCO', label: 'Braço' },
    { value: 'MEIO', label: 'Meio' },
    { value: 'PONTE', label: 'Ponte' }
  ];

  constructor(
    private fb: FormBuilder,
    private captadorService: CaptadorService,
    public dialogRef: MatDialogRef<CaptadorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Captador | null
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
    this.loadCaptadores();
    if (this.data) {
      this.mode = 'form';
      this.form.patchValue(this.data);
    }
  }

  loadCaptadores() {
    this.captadorService.findAll().subscribe(list => {
      this.allCaptadores.set(list);
    });
  }

  selectPickup(cap: Captador) {
    this.selectedFromList = cap;
  }

  confirmSelection() {
    if (this.selectedFromList) {
      this.dialogRef.close(this.selectedFromList);
    }
  }

  switchToForm() {
    this.mode = 'form';
    this.form.reset({ type: 'passivo' });
  }

  backToSelection() {
    this.mode = 'selection';
    this.selectedFromList = null;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
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
      next: (resultado) => {
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        console.error('Erro ao salvar captador:', err);
      }
    });
  }
}
