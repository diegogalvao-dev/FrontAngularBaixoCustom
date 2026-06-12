import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ArquivoService } from '../../services/arquivo.service';
import { PedidoService } from '../../services/pedido.service';
import { BaixocustomService } from '../../services/baixocustom.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoResponseDTO } from '../../models/pedido.model';
import { Baixocustom } from '../../models/baixocustom.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  readonly authService = inject(AuthService);
  readonly arquivoService = inject(ArquivoService);
  private readonly router = inject(Router);
  private readonly pedidoService = inject(PedidoService);
  private readonly baixocustomService = inject(BaixocustomService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly location = inject(Location);

  activeSection = 'personal';

  // Estado da foto de perfil
  fotoPreview = signal<string | null>(null);
  fotoFile = signal<File | null>(null);
  uploadingFoto = signal(false);

  // Estado dos pedidos
  pedidos = signal<PedidoResponseDTO[]>([]);
  loadingPedidos = signal(true);

  // Estado dos projetos
  projetos = signal<Baixocustom[]>([]);
  loadingProjetos = signal(true);

  // Estado edição de dados pessoais
  editNome = '';
  editUsername = '';
  editTelefone = '';
  salvandoPerfil = signal(false);
  perfilSalvo = signal(false);
  showLogoutModal = signal(false);

  // Estado edição de senha
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  salvandoSenha = signal(false);
  senhaSalva = signal(false);
  erroSenha = signal('');

  ngOnInit(): void {
    this.carregarPedidos();
    this.carregarProjetos();
    // Preenche os campos com os dados atuais
    this.editNome = this.authService.nomeUsuario() ?? '';
    this.editUsername = this.authService.username() ?? '';
    this.editTelefone = this.authService.telefone() ?? '';
  }

  carregarPedidos(): void {
    this.loadingPedidos.set(true);
    this.pedidoService.getMyPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.loadingPedidos.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos', err);
        this.loadingPedidos.set(false);
      }
    });
  }

  carregarProjetos(): void {
    this.loadingProjetos.set(true);
    this.baixocustomService.getMyProjetos().subscribe({
      next: (data) => {
        this.projetos.set(data);
        this.loadingProjetos.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar projetos', err);
        this.loadingProjetos.set(false);
      }
    });
  }

  adicionarAoCarrinho(projeto: Baixocustom): void {
    this.carrinhoService.adicionarBaixocustom(projeto);
    alert('Projeto adicionado ao carrinho!');
  }

  salvarDadosPessoais(): void {
    this.salvandoPerfil.set(true);
    const oldUsername = this.authService.username();

    this.authService.atualizarPerfil({
      nome: this.editNome,
      username: this.editUsername,
      telefone: this.editTelefone
    }).subscribe({
      next: () => {
        this.salvandoPerfil.set(false);
        this.perfilSalvo.set(true);
        setTimeout(() => this.perfilSalvo.set(false), 3000);

        if (oldUsername !== this.editUsername) {
          this.showLogoutModal.set(true);
        }
      },
      error: () => {
        this.salvandoPerfil.set(false);
        alert('Erro ao salvar ou o nome de usuário já está em uso.');
      }
    });
  }

  confirmarLogout(): void {
    this.showLogoutModal.set(false);
    this.logout();
  }

  alterarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      this.erroSenha.set('Preencha todos os campos de senha.');
      return;
    }
    if (this.novaSenha.length < 6) {
      this.erroSenha.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      this.erroSenha.set('A nova senha e a confirmação não coincidem.');
      return;
    }

    this.erroSenha.set('');
    this.salvandoSenha.set(true);
    this.authService.alterarSenha(this.senhaAtual, this.novaSenha).subscribe({
      next: () => {
        this.salvandoSenha.set(false);
        this.senhaSalva.set(true);
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
        setTimeout(() => this.senhaSalva.set(false), 3000);
      },
      error: (err) => {
        this.salvandoSenha.set(false);
        if (err.status === 403) {
          this.erroSenha.set('A senha atual está incorreta.');
        } else {
          this.erroSenha.set('Erro ao alterar senha. Tente novamente.');
        }
      }
    });
  }

  scrollTo(sectionId: string): void {
    this.activeSection = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Valida tamanho (máx 5MB) e tipo
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    this.fotoFile.set(file);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.fotoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  uploadFoto(): void {
    const file = this.fotoFile();
    if (!file) return;

    this.uploadingFoto.set(true);
    this.arquivoService.uploadFotoPerfil(file).subscribe({
      next: (fid: string) => {
        this.authService.updateFotoPerfil(fid);
        this.fotoFile.set(null);
        this.uploadingFoto.set(false);
      },
      error: () => {
        this.uploadingFoto.set(false);
        alert('Erro ao enviar a foto. Tente novamente.');
      }
    });
  }

  cancelarFoto(): void {
    this.fotoPreview.set(null);
    this.fotoFile.set(null);
  }

  getFotoUrl(): string | null {
    const preview = this.fotoPreview();
    if (preview) return preview;
    const fid = this.authService.fotoPerfil();
    if (fid) return this.arquivoService.getUrlDownload(fid);
    return null;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  goBack(): void {
    this.location.back();
  }
}
