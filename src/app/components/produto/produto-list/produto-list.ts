import { Component, OnInit } from '@angular/core';
import { MatTabsModule, MatTabGroup, MatTab } from '@angular/material/tabs';
import { BaixoList } from '../../baixo/baixo-list/baixo.list';
import { AcessorioList } from '../../acessorio/acessorio-list/acessorio-list';

import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Produto } from '../../../models/produto.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { BaixocustomList } from "../../baixocustom/baixocustom-list/baixocustom-list";
import { ProdutoService } from '../../../services/produto.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-produto-list',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    RouterLink,
    MatTabGroup,
    MatTab,
    AcessorioList,
    BaixoList
],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css',
})
export class ProdutoList implements OnInit {
  selectedTab = 0;

  totalRecords = 0;
  page = 0;
  pageSize = 12;

  displayedColumns: string[] = ['id', 'name', 'price', 'quantidadeEstoque', 'fornecedor', 'acao'];
  dataSource = new MatTableDataSource<Produto>([]);
  searchTerm = '';

  constructor(private produtoService: ProdutoService, private route: ActivatedRoute) {}
 
  ngOnInit() {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selectedTab = +params['tab'];
      }
    });
  }

  loadData(): void {
    if (this.searchTerm) {
      this.produtoService.searchByName(this.searchTerm, this.page, this.pageSize).subscribe({
        next: (items) => {
          this.dataSource.data = items;
          this.totalRecords = items.length;
        },
        error: (error) => {
          console.error('Erro ao buscar baixocustom', error);
        }
      });
      return;
    }

    // Se for a primeira carga (page = 0), buscar total também
    if (this.page === 0) {
      forkJoin({
        items: this.produtoService.findAll(this.page, this.pageSize),
        total: this.produtoService.count()
      }).subscribe({
        next: ({ items, total }) => {
          this.dataSource.data = items;
          this.totalRecords = total;
        },
        error: (error) => {
          console.error('Erro ao carregar baixocustom', error);
        }
      });
    } else {
      // Próximas páginas, só buscar items
      this.produtoService.findAll(this.page, this.pageSize).subscribe({
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
    this.searchTerm = name?.trim() ?? '';
    this.page = 0;
    this.loadData();
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }


  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [0];
    return Array.from({ length: total }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadData();
    }
  }

}
