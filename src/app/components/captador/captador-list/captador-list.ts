import { Component, OnInit, signal, effect, untracked } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Captador } from '../../../models/captador.model';
import { CaptadorService } from '../../../services/captador.service';
import { PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';
import { TitleCasePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-captador-list',
  standalone: true,
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
    MatDialogModule,
    TitleCasePipe,
    DecimalPipe
  ],
  templateUrl: './captador-list.html',
  styleUrl: './captador-list.css'
})
export class CaptadorList implements OnInit {

  totalRecords = signal(0);
  page = signal(0);
  pageSize = signal(12);

  displayedColumns: string[] = ['marca', 'type', 'posicao', 'price', 'acao'];
  dataSource = new MatTableDataSource<Captador>([]);
  searchTerm = signal('');
  
  constructor(private captadorService: CaptadorService, private dialog: MatDialog) {
    effect(() => {
      const term = this.searchTerm();
      const p = this.page();
      const s = this.pageSize();
      const trigger = this.captadorService.refreshTrigger();

      untracked(() => {
        this.loadData(term, p, s);
      });
    });
  }

  ngOnInit(): void {
  }

  loadData(term: string, page: number, pageSize: number): void {
    if (term) {
      this.captadorService.searchByName(term, page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
          this.totalRecords.set(items.length);
        },
        error: (error) => {
          console.error('Erro ao buscar captadores', error);
        }
      });
      return;
    }

    if (page === 0) {
      forkJoin({
        items: this.captadorService.findAll(page, pageSize),
        total: this.captadorService.count()
      }).subscribe({
        next: ({ items, total }) => {
          this.dataSource.data = items;
          this.totalRecords.set(total);
        },
        error: (error) => {
          console.error('Erro ao carregar captadores', error);
        }
      });
    } else {
      this.captadorService.findAll(page, pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
        },
        error: (error) => {
          console.error('Erro ao carregar captadores', error);
        }
      });
    }
  }

  searchByName(name: string): void {
    this.searchTerm.set(name?.trim() ?? '');
    this.page.set(0);
  }

  excluir(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este captador?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.captadorService.delete(id).subscribe();
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
