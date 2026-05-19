import { Component, OnInit, signal } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcessorioService } from '../../../services/acessorio.service';
import { Acessorio } from '../../../models/acessorio.model';
import { Fornecedor } from '../../../models/fornecedor.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArquivoService } from '../../../services/arquivo.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-acessorio-forms',
  imports: [
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    AsyncPipe,
    RouterLink,
    CommonModule,
    MatDialogModule],
  templateUrl: './acessorio-forms.html',
  styleUrl: './acessorio-forms.css',
})
export class AcessorioForms implements OnInit {

  readonly form: FormGroup;
  filteredOptions!: Observable<Fornecedor[]>;

  // Media state
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  existingImages = signal<string[]>([]);
  mainImage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private AcessorioService: AcessorioService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    public arquivoService: ArquivoService
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      acessorioTipo: [null, [Validators.required]],
      material: ['', [Validators.required]],
      tamanho: [null, [Validators.required]],
      price: [null, [Validators.required]],
      quantidadeEstoque: [null, [Validators.required]],
      fornecedor: [null, [Validators.required]],
      imagemPrincipal: [null]
    });

  }

  ngOnInit(): void {
    const acessorio: Acessorio = this.activatedRoute.snapshot.data['acessorio'];

    if (acessorio) {
      this.form.patchValue({
        id: acessorio.id,
        name: acessorio.name,
        acessorioTipo: acessorio.acessorioTipo,
        material: acessorio.material,
        tamanho: acessorio.tamanho,
        price: acessorio.price,
        quantidadeEstoque: acessorio.quantidadeEstoque,
        fornecedor: acessorio.fornecedor,
        imagemPrincipal: acessorio.imagemPrincipal
      });
      if (acessorio.nomeImagens) {
        this.existingImages.set(acessorio.nomeImagens);
      }
      if (acessorio.imagemPrincipal) {
        this.mainImage.set(acessorio.imagemPrincipal);
      }
    }

    this.filteredOptions = this.form.get('fornecedor')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Aguarda 300ms aps o usurio parar de digitar
      distinctUntilChanged(), // S dispara se o valor mudar
      switchMap(value => {
        const name = typeof value === 'string' ? value : value?.name;
        if (name && name.trim() !== '') {
          // Chama a API do Quarkus
          return this.AcessorioService.searchByFornecedor(name).pipe(
            catchError(() => of([])) // Em caso de erro retorna lista vazia
          );
        } else {
          return of([]); // Se estiver vazio retorna nada
        }
      })
    );
  }

  // Funo usada para exibir o nome do fornecedor no campo aps selecionado
  displayFn(fornecedor: Fornecedor): string {
    return fornecedor && fornecedor.name ? fornecedor.name : '';
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const acessorio = this.form.value;

    let resultado = (acessorio.id) ? this.AcessorioService.update(acessorio) : this.AcessorioService.create(acessorio);

    resultado.subscribe({
      next: (obj) => {
        if (this.selectedFiles().length > 0) {
          const uploads = this.arquivoService.uploadAcessorio(obj.id, this.selectedFiles());
          forkJoin(uploads).subscribe({
            next: () => {
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 2 } });
              this.exibirMensagem('Acessório e imagens salvos com sucesso!');
            },
            error: (err) => {
              console.error('Erro no upload das imagens:', err);
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 2 } });
              this.exibirMensagem('Acessório salvo, mas houve erro no upload das imagens.');
            }
          });
        } else {
          this.router.navigate(['/admin/produto'], { queryParams: { tab: 2 } });
          this.exibirMensagem('Acessório salvo com sucesso!');
        }
      },
      error: (erro) => {
        // Tenta processar como erro de validação do backend
        if (erro.status === 400 && erro.error?.errors) {
          // this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
        } else {
          this.exibirMensagem('Problema ao salvar o acessório, entre em contato com o suporte!');
        }
      }
    })
  }

  excluir() {
    if (this.form.value.id) {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        data: {
          title: 'Confirmar Exclusão',
          message: 'Tem certeza que deseja excluir este acessório?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.AcessorioService.delete(this.form.value.id).subscribe({
            next: () => {
              this.router.navigate(['/admin/produto'], { queryParams: { tab: 2 } });
              this.exibirMensagem('Acessório excluído com sucesso!');
            },
            error: (erro) => {
              this.exibirMensagem('Problema ao excluir o acessório, entre em contato com o suporte!');
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
