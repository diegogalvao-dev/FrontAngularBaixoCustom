import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaixoService } from '../../../services/baixo.service';
import { Baixo } from '../../../models/baixo.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';
import { ArquivoService } from '../../../services/arquivo.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-baixo-forms',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatDialogModule],
  templateUrl: 'baixo-form.html',
  styleUrl: 'baixo-form.css',
})
export class BaixoForm implements OnInit {

  readonly form: FormGroup;

  // Media state
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  existingImages = signal<string[]>([]);
  mainImage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private BaixoService: BaixoService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    public arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      price: [null, [Validators.required]],
      quantidadeEstoque: [null, [Validators.required]],
      fornecedor: [null, [Validators.required]],
      baixoModeloBase: ['', [Validators.required]],
      numeroCordas: [null, [Validators.required]],
      baixoCor: ['', [Validators.required]],
      imagemPrincipal: [null]
    });

  }

  ngOnInit(): void {
    const baixo: Baixo = this.activatedRoute.snapshot.data['baixo'];

    if (baixo) {
      this.form.patchValue({
        id: baixo.id,
        name: baixo.name,
        price: baixo.price,
        quantidadeEstoque: baixo.quantidadeEstoque,
        fornecedor: baixo.fornecedor,
        baixoModeloBase: baixo.baixoModeloBase,
        numeroCordas: baixo.numeroCordas,
        baixoCor: baixo.baixoCor,
        imagemPrincipal: baixo.imagemPrincipal
      });
      if (baixo.nomeImagens) {
        this.existingImages.set(baixo.nomeImagens);
      }
      if (baixo.imagemPrincipal) {
        this.mainImage.set(baixo.imagemPrincipal);
      }
    }

  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 1. Pegamos os valores brutos do formulário
    const baixo = this.form.value;

    // 2. Criamos uma cópia tratando os tipos (Strings -> Numbers)
    // Isso remove as aspas dos números no Payload
    // const baixoParaSalvar = {
    //   ...formValue,
    //   price: formValue.price ? parseFloat(formValue.price) : null,
    //   quantidadeEstoque: formValue.quantidadeEstoque ? parseInt(formValue.quantidadeEstoque, 10) : null,
    //   numeroCordas: formValue.numeroCordas ? parseInt(formValue.numeroCordas, 10) : null,
    //   fornecedor: formValue.fornecedor ? parseInt(formValue.fornecedor, 10) : null
    // };

    // 3. Decidimos se é Create ou Update
    // Se for Create (id nulo/vazio), usamos o objeto tratado
    let resultado = (baixo.id)
      ? this.BaixoService.update(baixo)
      : this.BaixoService.create(baixo);

    resultado.subscribe({
      next: (obj) => {
        if (this.selectedFiles().length > 0) {
          const uploads = this.arquivoService.uploadBaixo(obj.id, this.selectedFiles());
          forkJoin(uploads).subscribe({
            next: () => {
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 1 } });
              this.exibirMensagem('Baixo e imagens salvos com sucesso!');
            },
            error: (err) => {
              console.error('Erro no upload das imagens:', err);
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 1 } });
              this.exibirMensagem('Baixo salvo, mas houve erro no upload das imagens.');
            }
          });
        } else {
          this.router.navigate(['/admin/produto'], { queryParams: { tab: 1 } });
          this.exibirMensagem('Baixo salvo com sucesso!');
        }
      },
      error: (erro) => {
        console.error('Erro detalhado do servidor:', erro); // Ajuda a debugar no console

        if (erro.status === 400) {
          // Se o backend enviou mensagens específicas de validação
          if (erro.error?.errors) {
            this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
          } else {
            // Caso seja erro de conversão de tipo ou Enum inválido
            this.exibirMensagem('Dados inválidos: verifique os formatos e o Modelo Base.');
          }
        } else {
          this.exibirMensagem('Problema ao salvar o baixo, entre em contato com o suporte!');
        }
      }
    });
  }

  excluir() {
    if (this.form.value.id) {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        data: {
          title: 'Confirmar Exclusão',
          message: 'Tem certeza que deseja excluir este baixo?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.BaixoService.delete(this.form.value.id).subscribe({
            next: () => {
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 1 } });
              this.exibirMensagem('Baixo excluído com sucesso!');
            },
            error: (erro) => {
              this.exibirMensagem('Problema ao excluir o baixo, entre em contato com o suporte!');
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
      verticalPosition: 'top',
      panelClass: ['black-snackbar']
    });
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
        if (this.mainImage() === fid) {
          this.mainImage.set(null);
          this.form.get('imagemPrincipal')?.setValue(null);
        }
        this.exibirMensagem('Imagem removida com sucesso.');
      },
      error: (err) => {
        console.error('Erro ao remover imagem:', err);
        this.exibirMensagem('Erro ao remover imagem do servidor.');
      }
    });
  }

  setMainImage(fid: string) {
    if (this.mainImage() === fid) {
      this.mainImage.set(null);
      this.form.get('imagemPrincipal')?.setValue(null);
    } else {
      this.mainImage.set(fid);
      this.form.get('imagemPrincipal')?.setValue(fid);
    }
  }

  // /**
  //  * Processa erros de validação retornados pelo backend
  //  * Adiciona mensagens de validação aos campos correspondentes
  //  * @param response Resposta de erro do backend com lista de erros de validação
  //  */
  // private processarErrosValidacao(response: BackendErrorResponse): void {
  //   if (!response.errors || response.errors.length === 0) {
  //     return;
  //   }

  //   // Limpar erros anteriores
  //   Object.keys(this.form.controls).forEach(key => {
  //     const control = this.form.get(key);
  //     if (control) {
  //       control.setErrors(null);
  //     }
  //   });

  //   // Aplicar novos erros do backend
  //   response.errors.forEach(error => {
  //     const control = this.form.get(error.field);
  //     if (control) {
  //       // Adicionar erro customizado com a mensagem do backend
  //       control.setErrors({ 'backendError': error.message });
  //       control.markAsTouched();
  //     }
  //   });
  // }

}
