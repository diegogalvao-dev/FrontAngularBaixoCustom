import {Component, computed, input, OnInit, signal, effect, untracked} from '@angular/core';
import { NgFor, NgIf, NgClass, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { Baixocustom } from '../../../models/baixocustom.model';
import { BaixocustomService } from '../../../services/baixocustom.service';

@Component({
  selector: 'baixo-list',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    RouterLink,
    NgFor,
    NgIf,
    NgClass,
    CurrencyPipe
],

  styleUrls: ['baixocustom-list.css'],
  templateUrl: 'baixocustom-list.html',
})
export class BaixocustomList implements OnInit {

  // variaveis de controle de paginacao
  totalRecords = signal(0);
  page = signal(0);
  pageSize = signal(12);

  displayedColumns: string[] = ['id', 'baixoModeloBase', 'description', 'baixoCor', 'configuracaoEletronica', 'captadorList', 'estimatedPrice', 'baixoStatus', 'pessoaCliente', 'pessoaLuthier', 'acao'];
  dataSource = new MatTableDataSource<Baixocustom>([]);
  searchTerm = signal('');

  constructor(private baixocustomService: BaixocustomService) {
    effect(() => {
      const term = this.searchTerm();
      const p = this.page();
      const s = this.pageSize();
      const trigger = this.baixocustomService.refreshTrigger();

      untracked(() => {
        this.loadData(term, p, s);
      });
    });
  }

  ngOnInit(): void {
  }

  loadData(term: string, page: number, pageSize: number): void {
    if (term) {
      this.baixocustomService.searchByName(term, page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
          this.totalRecords.set(items.length);
        },
        error: (error) => {
          console.error('Erro ao buscar baixocustom', error);
        }
      });
      return;
    }

    // Se for a primeira carga (page = 0), buscar total também
    if (page === 0) {
      forkJoin({
        items: this.baixocustomService.findAll(page, pageSize),
        total: this.baixocustomService.count()
      }).subscribe({
        next: ({ items, total }) => {
          this.dataSource.data = items;
          this.totalRecords.set(total);
        },
        error: (error) => {
          console.error('Erro ao carregar baixocustom', error);
        }
      });
    } else {
      // Próximas páginas, só buscar items
      this.baixocustomService.findAll(page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
        },
        error: (error) => {
          console.error('Erro ao carregar baixocustom', error);
        }
      });
    }
  }

  searchByName(name: string): void {
    this.searchTerm.set(name?.trim() ?? '');
    this.page.set(0);
  }

  paginar(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.page.set(event.pageIndex);
  }

  excluir(id: number) {
    this.baixocustomService.delete(id).subscribe();
  }


  get totalPages(): number {
    return Math.ceil(this.totalRecords() / this.pageSize());
  }

  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [0];
    return Array.from({ length: total }, (_, i) => i);
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.page.set(p);
    }
  }
}
