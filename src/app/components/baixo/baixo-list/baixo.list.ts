import {Component, computed, input, OnInit} from '@angular/core';
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
],

  styleUrls: ['baixo-list.css'],
  templateUrl: 'baixo-list.html',
})
export class BaixoList implements OnInit {

  // variaveis de controle de paginacao
  totalRecords = 0;
  page = 0;
  pageSize = 12;

  displayedColumns: string[] = ['id', 'name', 'baixoModeloBase', 'numeroCordas', 'baixoCor', 'price', 'quantidadeEstoque', 'fornecedor', 'acao'];
  dataSource = new MatTableDataSource<Baixo>([]);
  searchTerm = '';

  constructor(private baixoService: BaixoService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.searchTerm) {
      this.baixoService.searchByName(this.searchTerm, this.page, this.pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
          this.totalRecords = items.length;
        },
        error: (error) => {
          console.error('Erro ao buscar baixo', error);
        }
      });
      return;
    }

    // Se for a primeira carga (page = 0), buscar total também
    if (this.page === 0) {
      forkJoin({
        items: this.baixoService.findAll(this.page, this.pageSize),
        total: this.baixoService.count()
      }).subscribe({
        next: ({ items, total }) => {
          this.dataSource.data = items;
          this.totalRecords = total;
        },
        error: (error) => {
          console.error('Erro ao carregar baixo', error);
        }
      });
    } else {
      // Próximas páginas, só buscar items
      this.baixoService.findAll(this.page, this.pageSize).subscribe({
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
    this.searchTerm = name?.trim() ?? '';
    this.page = 0;
    this.loadData();
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  excluir(id: number) {
    this.baixoService.delete(id).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }


}
