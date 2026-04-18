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
import { BaixocustomService } from '../../../services/baixocustom.service';
import { Baixocustom } from '../../../models/baixocustom.model';


@Component({
  selector: 'app-baixocustom-forms',
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
  templateUrl: 'baixocustom-forms.html',
  styleUrl: 'baixocustom-forms.css',
})
export class BaixocustomForm implements OnInit {

   readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private BaixocustomService: BaixocustomService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      baixoModeloBase: [null, [Validators.required]],
      description: ['', [Validators.required]],
      baixoCor: ['', [Validators.required]],
      configuracaoEletronica: [null, [Validators.required, Validators.min(1)]],
      captadorList: [null, [Validators.required, Validators.min(1)]],
      estimatedPrice: [null, [Validators.required, Validators.min(0.01)]],
      baixoStatus: ['', [Validators.required]],
      pessoaCliente: [null, [Validators.required]],
      pessoaLuthier: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    const baixocustom: Baixocustom = this.activatedRoute.snapshot.data['baixocustom'];

      if (baixocustom) {
        this.form.patchValue({
          id: baixocustom.id,
          baixoModeloBase: baixocustom.baixoModeloBase,
          description: baixocustom.description,
          baixoCor: baixocustom.baixoCor,
          configuracaoEletronica: baixocustom.configuracaoEletronica,
          captadorList: baixocustom.captadorList,
          estimatedPrice: baixocustom.estimatedPrice,
          baixoStatus: baixocustom.baixoStatus,
          pessoaCliente: baixocustom.pessoaCliente,
          pessoaLuthier: baixocustom.pessoaLuthier
        });
      }
         
  }

 salvar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const dados = this.form.value;

  const baixocustom: any = {
    baixoModeloBase: dados.baixoModeloBase,
    description: dados.description,
    baixoCor: dados.baixoCor,
    baixoStatus: dados.baixoStatus,
    estimatedPrice: Number(dados.estimatedPrice), // Garante que é número
    configuracaoEletronica: { id: Number(dados.configuracaoEletronica) },
    captadorList: [{ id: Number(dados.captadorList) }],
    pessoaCliente: { id: Number(dados.pessoaCliente) },
    pessoaLuthier: { id: Number(dados.pessoaLuthier) }
  };

  console.log('JSON enviado:', JSON.stringify(baixocustom)); // Use isso para conferir no console!

  let resultado = (baixocustom.id) 
    ? this.BaixocustomService.update(baixocustom) 
    : this.BaixocustomService.create(baixocustom);

  resultado.subscribe({
    next: (obj) => {
      this.router.navigateByUrl('/baixocustom');
      this.exibirMensagem('Baixocustom salvo com sucesso!');
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
            this.router.navigateByUrl('/baixocustom');
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
