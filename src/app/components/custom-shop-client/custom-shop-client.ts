import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { BaixocustomService } from '../../services/baixocustom.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { Baixocustom } from '../../models/baixocustom.model';
import { Captador } from '../../models/captador.model';

import { EletronicaDialogComponent } from '../configuracao-eletronica/eletronica-dialog';
import { CaptadorDialogComponent } from '../captador/captador-dialog';

@Component({
  selector: 'app-custom-shop-client',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule, MatDialogModule],
  templateUrl: './custom-shop-client.html',
  styleUrl: './custom-shop-client.css',
})
export class CustomShopClient implements OnInit, OnDestroy {
  protected readonly authService    = inject(AuthService);
  private readonly baixoService   = inject(BaixocustomService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router         = inject(Router);
  private readonly dialog         = inject(MatDialog);

  // ──── Opções Estáticas ─────────────────────────────────────────────────────────
  optionsModelos = [
    { value: 'JAZZ_BASS', label: 'Jazz Bass', icon: 'music_note' },
    { value: 'PRECISION', label: 'Precision', icon: 'precision_manufacturing' },
    { value: 'STINGRAY', label: 'Stingray', icon: 'wb_sunny' },
    { value: 'THUNDERBIRD', label: 'Thunderbird', icon: 'bolt' },
    { value: 'CUSTOM', label: 'Custom Original', icon: 'build' }
  ];

  optionsCores = [
    { value: 'PRETO', label: 'Preto', color: '#000000' },
    { value: 'BRANCO', label: 'Branco', color: '#FFFFFF' },
    { value: 'VERMELHO', label: 'Vermelho', color: '#dc2626' },
    { value: 'AZUL', label: 'Azul', color: '#2563eb' },
    { value: 'VERDE', label: 'Verde', color: '#16a34a' },
    { value: 'SUNBURST', label: 'Sunburst', color: 'linear-gradient(45deg, #451a03, #92400e)' }
  ];

  // ──── Estado das seleções (Igual ao Admin) ─────────────────────────────────────────────────
  projetoNome         = signal('');
  projetoDescricao    = signal('');
  selectedModeloBase  = signal(this.optionsModelos[0].value);
  selectedColor       = signal(this.optionsCores[0]);

  // Configuração Eletrônica
  configEletronica = signal({
    id: null as number | null,
    ativo: false,
    volumeKnobs: null as number | null,
    toneKnobs: null as number | null
  });

  // Captadores (Máx 2)
  captadoresData = signal<Captador[]>([]);

  // ──── Estado da UI ────────────────────────────────────────────────────────
  submitting  = signal(false);
  toastMsg    = signal<string | null>(null);
  toastType   = signal<'success' | 'error'>('success');

  // ──── Preço estimado reativo ──────────────────────────────────────────────
  // Preço base de 8500 + preço dos captadores e circuito (simulado)
  estimatedPrice = computed(() => {
    let price = 8500;
    this.captadoresData().forEach(cap => {
      price += cap.price || 0;
    });
    // Adiciona valor se for circuito ativo
    if (this.configEletronica().ativo) {
      price += 500;
    }
    return price;
  });

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
  }

  private handleScroll = (): void => {
    const el = document.querySelector('.bass-image-container') as HTMLElement | null;
    if (el) {
      const rotation = Math.min(window.scrollY / 100, 2);
      el.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
    }
  };

  // ──── Ações de UI ───────────────────────────────────────────────────────────
  selectColor(c: any) { this.selectedColor.set(c); }
  selectModeloBase(mod: string) { this.selectedModeloBase.set(mod); }

  // Dialog de Eletrônica
  openDialogEletronica() {
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
      }
    });
  }

  // Dialog de Captadores
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
      }
    });
  }

  removeCaptador(index: number) {
    this.captadoresData.update(list => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
  }

  // ──── Validação e Submissão ─────────────────────────────────────────────────
  
  isFormValid(): boolean {
    return this.projetoNome().trim().length > 0 && 
           this.projetoDescricao().trim().length > 0 &&
           this.configEletronica().id !== null &&
           this.captadoresData().length > 0;
  }

  private buildPayload(): Baixocustom | null {
    if (!this.authService.logado()) {
      this.router.navigate(['/login']);
      return null;
    }

    if (!this.isFormValid()) {
      this.showToast('Preencha nome, descrição, configure a eletrônica e adicione ao menos um captador.', 'error');
      return null;
    }

    return {
      id: 0,
      name: this.projetoNome(),
      price: this.estimatedPrice(),
      baixoModeloBase: this.selectedModeloBase(),
      description: this.projetoDescricao(),
      baixoCor: this.selectedColor().value,
      configuracaoEletronica: this.configEletronica().id,
      captadorList: this.captadoresData().map(c => Number(c.id)),
      baixoStatus: 'PROJETANDO',
      usuarioLuthier: 30, // Luthier João default
      pessoaLuthier: 30,
    } as unknown as Baixocustom;
  }

  encomendar(): void {
    const payload = this.buildPayload();
    if (!payload) return;

    this.submitting.set(true);
    this.baixoService.create(payload).subscribe({
      next: (savedBass: any) => { 
        this.submitting.set(false);
        this.carrinhoService.adicionarBaixocustom(savedBass);
        this.showToast('Projeto adicionado ao carrinho com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/carrinho']), 1500);
      },
      error: () => {
        this.submitting.set(false);
        this.showToast('Erro ao enviar o pedido. Tente novamente.', 'error');
      },
    });
  }

  salvarProjeto(): void {
    const payload = this.buildPayload();
    if (!payload) return;

    this.submitting.set(true);
    this.baixoService.create(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showToast('Projeto salvo no seu perfil com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/perfil']), 1500);
      },
      error: () => {
        this.submitting.set(false);
        this.showToast('Erro ao salvar o projeto. Tente novamente.', 'error');
      },
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMsg.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMsg.set(null), 5000);
  }
}
