import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaixocustomService } from '../../../services/baixocustom.service';
import { Baixocustom } from '../../../models/baixocustom.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EletronicaDialogComponent } from '../../configuracao-eletronica/eletronica-dialog';
import { CaptadorDialogComponent } from '../../captador/captador-dialog';
import { ConfiguracaoEletronicaService } from '../../../services/configuracao-eletronica.service';
import { CaptadorService } from '../../../services/captador.service';
import { Captador } from '../../../models/captador.model';
import { ArquivoService } from '../../../services/arquivo.service';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-baixocustom-forms',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: 'baixocustom-forms.html',
  styleUrl: 'baixocustom-forms.css',
})
export class BaixocustomForm implements OnInit {

  readonly form: FormGroup;

  // Media state
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  existingImages = signal<string[]>([]);

  // Estado da configuração eletrônica como Signal
  configEletronica = signal({
    id: null as number | null,
    ativo: false,
    volumeKnobs: null as number | null,
    toneKnobs: null as number | null
  });

  // Estado dos captadores como Signal (Lista de até 2)
  captadoresData = signal<Captador[]>([]);

  optionsModelos = [
    { value: 'JAZZ_BASS', label: 'Jazz Bass', icon: 'music_note' },
    { value: 'PRECISION', label: 'Precision', icon: 'precision_manufacturing' },
    { value: 'STINGRAY', label: 'Stingray', icon: 'wb_sunny' },
    { value: 'THUNDERBIRD', label: 'Thunderbird', icon: 'bolt' },
    { value: 'CUSTOM', label: 'Custom', icon: 'build' }
  ];

  optionsCores = [
    { value: 'PRETO', label: 'Preto', color: '#000000' },
    { value: 'BRANCO', label: 'Branco', color: '#FFFFFF' },
    { value: 'VERMELHO', label: 'Vermelho', color: '#dc2626' },
    { value: 'AZUL', label: 'Azul', color: '#2563eb' },
    { value: 'VERDE', label: 'Verde', color: '#16a34a' },
    { value: 'SUNBURST', label: 'Sunburst', color: 'linear-gradient(45deg, #451a03, #92400e)' }
  ];

  constructor(
    private fb: FormBuilder,
    private BaixocustomService: BaixocustomService,
    private configuracaoEletronicaService: ConfiguracaoEletronicaService,
    private captadorService: CaptadorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    public arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      baixoModeloBase: [null, [Validators.required]],
      description: ['', [Validators.required]],
      baixoCor: ['', [Validators.required]],
      configuracaoEletronica: [null, [Validators.required]],
      captadorList: [null, [Validators.required, Validators.min(1)]],
      baixoStatus: ['', [Validators.required]],
      pessoaLuthier: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    const baixocustom: Baixocustom = this.activatedRoute.snapshot.data['baixo'];

    if (baixocustom) {
      this.form.patchValue({
        id: baixocustom.id,
        name: baixocustom.name,
        price: baixocustom.price,
        baixoModeloBase: baixocustom.baixoModeloBase,
        description: baixocustom.description,
        baixoCor: baixocustom.baixoCor,
        configuracaoEletronica: baixocustom.configuracaoEletronica,
        captadorList: Array.isArray(baixocustom.captadorList) ? baixocustom.captadorList[0] : baixocustom.captadorList,
        baixoStatus: baixocustom.baixoStatus,
        pessoaLuthier: baixocustom.usuarioLuthier
      });

      if (baixocustom.nomeImagens) {
        this.existingImages.set(baixocustom.nomeImagens);
      }

      // Popular estado da configuração eletrônica
      if (baixocustom.configuracaoEletronica) {
        const ce = baixocustom.configuracaoEletronica as any;

        if (typeof ce === 'object' && ce.id) {
          this.configEletronica.set({
            id: ce.id,
            ativo: ce.circuitoAtivo || false,
            volumeKnobs: ce.volumeKnobs || 0,
            toneKnobs: ce.toneKnobs || 0
          });
          this.form.get('configuracaoEletronica')?.setValue(ce.id);
        } else {
          const id = Number(ce);
          this.configuracaoEletronicaService.findById(id).subscribe({
            next: (fullCe) => {
              this.configEletronica.set({
                id: fullCe.id,
                ativo: fullCe.circuitoAtivo,
                volumeKnobs: fullCe.volumeKnobs,
                toneKnobs: fullCe.toneKnobs
              });
            }
          });
          this.form.get('configuracaoEletronica')?.setValue(id);
        }
      }

      // Popular estado dos captadores
      if (baixocustom.captadorList) {
        const list = Array.isArray(baixocustom.captadorList) ? baixocustom.captadorList : [baixocustom.captadorList];
        list.forEach(id => {
          if (typeof id === 'number') {
            this.captadorService.findById(id).subscribe(full => {
              this.captadoresData.update(curr => [...curr, full]);
            });
          }
        });
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
      name: dados.name,
      price: Number(dados.price),
      baixoModeloBase: dados.baixoModeloBase,
      description: dados.description,
      baixoCor: dados.baixoCor,
      baixoStatus: dados.baixoStatus,
      configuracaoEletronica: Number(dados.configuracaoEletronica),
      captadorList: this.captadoresData().map(c => Number(c.id)),
      usuarioLuthier: Number(dados.pessoaLuthier)
    };

    console.log('JSON enviado:', JSON.stringify(baixocustom));

    let resultado = (baixocustom.id)
      ? this.BaixocustomService.update(baixocustom)
      : this.BaixocustomService.create(baixocustom);

    resultado.subscribe({
      next: (obj) => {
        if (this.selectedFiles().length > 0) {
          const uploads = this.arquivoService.uploadBaixoCustomizado(obj.id, this.selectedFiles());
          forkJoin(uploads).subscribe({
            next: () => {
              this.router.navigateByUrl('/admin/baixo-custom');
              this.exibirMensagem('Baixocustom e imagens salvos com sucesso!');
            },
            error: (err) => {
              console.error('Erro no upload das imagens:', err);
              this.router.navigateByUrl('/admin/baixo-custom');
              this.exibirMensagem('Baixocustom salvo, mas houve erro no upload das imagens.');
            }
          });
        } else {
          this.router.navigateByUrl('/admin/baixo-custom');
          this.exibirMensagem('Baixocustom salvo com sucesso!');
        }
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
            this.router.navigateByUrl('/admin/baixo-custom');
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
      verticalPosition: 'top',
      panelClass: ['black-snackbar']
    });
  }

  // Dialog configuração eletrônica
  openDialog() {
    const dialogRef = this.dialog.open(EletronicaDialogComponent, {
      data: {
        id: this.configEletronica().id,
        circuitoAtivo: this.configEletronica().ativo,
        volumeKnobs: this.configEletronica().volumeKnobs,
        toneKnobs: this.configEletronica().toneKnobs
      },
      maxWidth: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.configEletronica.set({
          id: result.id,
          ativo: result.circuitoAtivo,
          volumeKnobs: result.volumeKnobs,
          toneKnobs: result.toneKnobs
        });

        this.form.get('configuracaoEletronica')?.setValue(result.id);
        this.form.get('configuracaoEletronica')?.markAsDirty();
      }
    });
  }

  // Lógica de Captadores
  openCaptadorDialog(index?: number) {
    const isEditing = index !== undefined;
    const initialData = isEditing ? this.captadoresData()[index] : null;

    const dialogRef = this.dialog.open(CaptadorDialogComponent, {
      data: initialData,
      maxWidth: '1100px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEditing) {
          this.captadoresData.update(list => {
            const newList = [...list];
            newList[index] = result;
            return newList;
          });
        } else if (this.captadoresData().length < 2) {
          this.captadoresData.update(list => [...list, result]);
        }
        this.updateCaptadoresFormControl();
      }
    });
  }

  removeCaptador(index: number) {
    this.captadoresData.update(list => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
    this.updateCaptadoresFormControl();
  }

  private updateCaptadoresFormControl() {
    const ids = this.captadoresData().map(c => c.id).filter(id => id !== null);
    this.form.get('captadorList')?.setValue(ids);
    this.form.get('captadorList')?.markAsDirty();
  }

  // Media Handlers
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    const remainingSlots = 3 - (this.existingImages().length + this.selectedFiles().length);

    if (files.length > remainingSlots) {
      this.exibirMensagem(`Você só pode adicionar mais ${remainingSlots} imagem(ns).`);
      return;
    }

    Array.from(files).forEach(file => {
      this.selectedFiles.update(current => [...current, file]);
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.update(current => [...current, e.target.result]);
      reader.readAsDataURL(file);
    });
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.update(current => current.filter((_, i) => i !== index));
    this.imagePreviews.update(current => current.filter((_, i) => i !== index));
  }

  removeExistingImage(fid: string) {
    this.arquivoService.remove(fid).subscribe({
      next: () => {
        this.existingImages.update(current => current.filter(id => id !== fid));
        this.exibirMensagem('Imagem removida com sucesso.');
      },
      error: (err) => {
        console.error('Erro ao remover imagem:', err);
        this.exibirMensagem('Erro ao remover imagem do servidor.');
      }
    });
  }
}
