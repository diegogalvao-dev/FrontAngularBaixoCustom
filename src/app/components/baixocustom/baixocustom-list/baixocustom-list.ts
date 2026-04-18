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
],

  styleUrls: ['baixocustom-list.css'],
  templateUrl: 'baixocustom-list.html',
})
export class BaixocustomList implements OnInit {

  // variaveis de controle de paginacao
  totalRecords = 0;
  page = 0;
  pageSize = 12;

  displayedColumns: string[] = ['id', 'baixoModeloBase', 'description', 'baixoCor', 'configuracaoEletronica', 'captadorList', 'estimatedPrice', 'baixoStatus', 'pessoaCliente', 'pessoaLuthier', 'acao'];
  dataSource = new MatTableDataSource<Baixocustom>([]);
  searchTerm = '';

  constructor(private baixocustomService: BaixocustomService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.searchTerm) {
      this.baixocustomService.searchByName(this.searchTerm, this.page, this.pageSize).subscribe({
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
        items: this.baixocustomService.findAll(this.page, this.pageSize),
        total: this.baixocustomService.count()
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
      this.baixocustomService.findAll(this.page, this.pageSize).subscribe({
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

  excluir(id: number) {
    this.baixocustomService.delete(id).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }


}
