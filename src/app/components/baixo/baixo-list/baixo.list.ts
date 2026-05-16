import { Component, computed, input, OnInit, signal, effect, untracked } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';
import { Baixo } from '../../../models/baixo.model';
import { BaixoService } from '../../../services/baixo.service';

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
    MatDialogModule
  ],

  styleUrls: ['baixo-list.css'],
  templateUrl: 'baixo-list.html',
})
export class BaixoList implements OnInit {

  // variaveis de controle de paginacao
  totalRecords = signal(0);
  page = signal(0);
  pageSize = signal(12);

  displayedColumns: string[] = ['imagem', 'name', 'baixoModeloBase', 'price', 'status', 'acao'];
  dataSource = new MatTableDataSource<Baixo>([]);
  searchTerm = signal('');

  constructor(private baixoService: BaixoService, private dialog: MatDialog) {
    effect(() => {
      const term = this.searchTerm();
      const p = this.page();
      const s = this.pageSize();
      const trigger = this.baixoService.refreshTrigger();

      untracked(() => {
        this.loadData(term, p, s);
      });
    });
  }

  ngOnInit(): void {
  }

  loadData(term: string, page: number, pageSize: number): void {
    if (term) {
      this.baixoService.searchByName(term, page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
          this.totalRecords.set(items.length);
        },
        error: (error) => {
          console.error('Erro ao buscar baixo', error);
        }
      });
      return;
    }

    // Se for a primeira carga (page = 0), buscar total também
    if (page === 0) {
      forkJoin({
        items: this.baixoService.findAll(page, pageSize),
        total: this.baixoService.count()
      }).subscribe({
        next: ({ items, total }) => {
          this.dataSource.data = items;
          this.totalRecords.set(total);
        },
        error: (error) => {
          console.error('Erro ao carregar baixo', error);
        }
      });
    } else {
      // Próximas páginas, só buscar items
      this.baixoService.findAll(page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
        },
        error: (error) => {
          console.error('Erro ao carregar baixo', error);
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
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este baixo?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.baixoService.delete(id).subscribe();
      }
    });
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
