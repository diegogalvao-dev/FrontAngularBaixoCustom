import { Component, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-acessorio-forms',
  imports: [
    MatToolbar,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatError,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    RouterLink],
  templateUrl: './acessorio-forms.html',
  styleUrl: './acessorio-forms.css',
})
export class AcessorioForms implements OnInit {

   readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private AcessorioService: AcessorioService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      name: [''],
      acessorioTipo: [''],
      material: [''],
      tamanho: [null],
      price: [null],
      estoque: [null],
      fornecedor: ['']
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
            estoque: acessorio.estoque,
            fornecedor: acessorio.fornecedor
          });
        }
      

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
        this.router.navigateByUrl('/acessorios');
        this.exibirMensagem('Acessório salvo com sucesso!');
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
    if (this.form.valid) {
      const acessorio = this.form.value;
      if (acessorio.id != null) {
        this.AcessorioService.delete(acessorio.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/acessorios');
            this.exibirMensagem('Acessório excluído com sucesso!');
          },
          error: (erro) => {
            this.exibirMensagem('Problema ao excluir o acessório, entre em contato com o suporte!');
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
