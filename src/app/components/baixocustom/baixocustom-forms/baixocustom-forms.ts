import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaixocustomService } from '../../../services/baixocustom.service';
import { Baixocustom } from '../../../models/baixocustom.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, AsyncPipe } from '@angular/common';
import { CaptadorSelectComponent } from '../../captador/captador-select';
import { EletronicaDialogComponent } from '../../configuracao-eletronica/eletronica-dialog';
import { CaptadorDialogComponent } from '../../captador/captador-dialog';



@Component({
  selector: 'app-baixocustom-forms',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AsyncPipe,
    CaptadorSelectComponent,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: 'baixocustom-forms.html',
  styleUrl: 'baixocustom-forms.css',
})
export class BaixocustomForm implements OnInit {

  readonly form: FormGroup;

  // Estado da configuração eletrônica
  configEletronica: {
    id: number | null,
    especificacao: string,
    observacoes: string
  } = { id: null, especificacao: '', observacoes: '' };

  optionsEletronica = [
    { id: 1, name: 'Passivo (V/T)', description: 'Volume e Tone passivos' },
    { id: 2, name: 'Ativo 2-Band (V/B/T)', description: 'Volume, Bass e Treble ativos' },
    { id: 3, name: 'Ativo 3-Band (V/M/B/T)', description: 'Volume, Mid, Bass e Treble ativos' }
  ];

  // Estado dos captadores (Lista de até 2)
  captadoresData: {
    id: number | null,
    especificacao: string,
    observacoes: string
  }[] = [];

  optionsCaptadores = [
    { id: 1, name: 'Seymour Duncan Quarter Pound', description: 'High output single coil' },
    { id: 2, name: 'EMG Active P-Bass', description: 'Active electronics with punchy tone' },
    { id: 3, name: 'Fender Custom Shop 60s', description: 'Vintage warm tones' }
  ];

  optionsModelos = [
    { value: 'JAZZ_BASS', label: 'Jazz Bass', icon: 'music_note' },
    { value: 'PRECISION', label: 'Precision', icon: 'precision_manufacturing' },
    { value: 'STINGRAY', label: 'Stingray', icon: 'wb_sunny' },
    { value: 'THUNDERBIRD', label: 'Thunderbird', icon: 'bolt' }
  ];

  constructor(
    private fb: FormBuilder,
    private BaixocustomService: BaixocustomService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      id: [null],
      baixoModeloBase: [null, [Validators.required]],
      description: ['', [Validators.required]],
      baixoCor: ['', [Validators.required]],
      configuracaoEletronica: [null, [Validators.required]],
      captadorList: [null, [Validators.required, Validators.min(1)]],
      estimatedPrice: [null, [Validators.required, Validators.min(0.01)]],
      baixoStatus: ['', [Validators.required]],
      pessoaCliente: [null, [Validators.required]],
      pessoaLuthier: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    const baixocustom: Baixocustom = this.activatedRoute.snapshot.data['baixo'];

    if (baixocustom) {
      this.form.patchValue({
        id: baixocustom.id,
        baixoModeloBase: baixocustom.baixoModeloBase,
        description: baixocustom.description,
        baixoCor: baixocustom.baixoCor,
        configuracaoEletronica: baixocustom.configuracaoEletronica,
        captadorList: Array.isArray(baixocustom.captadorList) ? baixocustom.captadorList[0] : baixocustom.captadorList,
        estimatedPrice: baixocustom.estimatedPrice,
        baixoStatus: baixocustom.baixoStatus,
        pessoaCliente: baixocustom.pessoaCliente,
        pessoaLuthier: baixocustom.pessoaLuthier
      });

      // Popular estado da configuração eletrônica
      this.configEletronica = {
        id: baixocustom.configuracaoEletronica,
        especificacao: '',
        observacoes: ''
      };

      // Popular estado dos captadores
      if (baixocustom.captadorList) {
        const list = Array.isArray(baixocustom.captadorList) ? baixocustom.captadorList : [baixocustom.captadorList];
        this.captadoresData = list.map(id => ({
          id: id,
          especificacao: '',
          observacoes: ''
        }));
      }
    }

  }


  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados = this.form.value;

    const baixocustom: any = {
      id: dados.id,
      baixoModeloBase: dados.baixoModeloBase,
      description: dados.description,
      baixoCor: dados.baixoCor,
      baixoStatus: dados.baixoStatus,
      estimatedPrice: Number(dados.estimatedPrice),
      configuracaoEletronica: Number(dados.configuracaoEletronica),
      captadorList: this.captadoresData.map(c => Number(c.id)),
      pessoaCliente: Number(dados.pessoaCliente),
      pessoaLuthier: Number(dados.pessoaLuthier)
    };

    console.log('JSON enviado:', JSON.stringify(baixocustom));

    let resultado = (baixocustom.id)
      ? this.BaixocustomService.update(baixocustom)
      : this.BaixocustomService.create(baixocustom);

    resultado.subscribe({
      next: (obj) => {
        this.router.navigateByUrl('/baixo-custom');
        this.exibirMensagem('Baixocustom salvo com sucesso!');
      },
      error: (erro) => {
        console.error('Erro detalhado do servidor:', erro);

        if (erro.status === 400) {
          if (erro.error?.errors) {
            this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
          } else {
            this.exibirMensagem('Dados inválidos: verifique os formatos e o Modelo Base.');
          }
        } else {
          this.exibirMensagem('Problema ao salvar o baixocustom, entre em contato com o suporte!');
        }
      }
    });
  }

  excluir() {
    if (this.form.valid) {
      const baixocustom = this.form.value;
      if (baixocustom.id != null) {
        this.BaixocustomService.delete(baixocustom.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/baixo-custom');
            this.exibirMensagem('Baixocustom excluído com sucesso!');
          },
          error: (erro) => {
            this.exibirMensagem('Problema ao excluir o baixocustom, entre em contato com o suporte!');
          }
        })
      }
    }
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  //dialog configuração eletronica
  openDialog() {
    const dialogRef = this.dialog.open(EletronicaDialogComponent, {
      data: {
        options: this.optionsEletronica,
        initialValue: this.configEletronica.id,
        especificacao: this.configEletronica.especificacao,
        observacoes: this.configEletronica.observacoes
      },
      maxWidth: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.configEletronica = {
          id: result.id,
          especificacao: result.especificacao,
          observacoes: result.observacoes
        };

        this.form.get('configuracaoEletronica')?.setValue(result.id);
        this.form.get('configuracaoEletronica')?.markAsDirty();
      }
    });
  }

  getSelectedEletronicaLabel() {
    return this.optionsEletronica.find(o => o.id === this.configEletronica.id)?.name;
  }

  // Lógica de Captadores
  openCaptadorDialog(index?: number) {
    const isEditing = index !== undefined;
    const initialData = isEditing ? this.captadoresData[index] : { id: null, especificacao: '', observacoes: '' };

    const dialogRef = this.dialog.open(CaptadorDialogComponent, {
      data: {
        options: this.optionsCaptadores,
        initialValue: initialData.id,
        especificacao: initialData.especificacao,
        observacoes: initialData.observacoes
      },
      maxWidth: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEditing) {
          this.captadoresData[index] = result;
        } else if (this.captadoresData.length < 2) {
          this.captadoresData.push(result);
        }
        this.updateCaptadoresFormControl();
      }
    });
  }

  removeCaptador(index: number) {
    this.captadoresData.splice(index, 1);
    this.updateCaptadoresFormControl();
  }

  private updateCaptadoresFormControl() {
    const ids = this.captadoresData.map(c => c.id).filter(id => id !== null);
    this.form.get('captadorList')?.setValue(ids);
    this.form.get('captadorList')?.markAsDirty();
  }

  getCaptadorLabel(id: number | null) {
    return this.optionsCaptadores.find(o => o.id === id)?.name;
  }
}
