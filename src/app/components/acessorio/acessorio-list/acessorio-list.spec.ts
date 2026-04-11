import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcessorioList } from './acessorio-list';
import { AcessorioService } from '../../../services/acessorio.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AcessorioList - searchByName', () => {
  let component: AcessorioList;
  let fixture: ComponentFixture<AcessorioList>;
  let acessorioService: AcessorioService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcessorioList, HttpClientTestingModule],
      providers: [AcessorioService]
    }).compileComponents();

    acessorioService = TestBed.inject(AcessorioService);
    fixture = TestBed.createComponent(AcessorioList);
    component = fixture.componentInstance;
  });

  it('should call searchByName when search term is provided', () => {
    const mockResults = [
      { id: 1, name: 'Cabo USB', acessorioTipo: 'Cabo', material: 'Plástico', tamanho: '1m', price: 10, estoque: 50, fornecedor: 'Fornecedor1' },
      { id: 2, name: 'Cabo RJ45', acessorioTipo: 'Cabo', material: 'Cobre', tamanho: '5m', price: 25, estoque: 30, fornecedor: 'Fornecedor2' }
    ];

    const searchSpy = vi.spyOn(acessorioService, 'searchByName').mockReturnValue(
      of(mockResults).pipe(
        tap((data) => {
          console.log('🌐 Dados recebidos da API (searchByName):', data);
          console.log('📦 Quantidade de itens:', data.length);
          console.log('📋 Primeiro item:', data[0]);
        })
      )
    );

    component.searchByName('Cabo');

    console.log('✅ searchByName foi chamado com argumentos:', searchSpy.mock.calls[0]);
    console.log('📊 Dados no componente (dataSource):', component.dataSource.data);
    console.log('📈 Total de registros (totalRecords):', component.totalRecords);

    expect(acessorioService.searchByName).toHaveBeenCalledWith('Cabo', 0, 16);
    expect(component.dataSource.data).toEqual(mockResults);
    expect(component.totalRecords).toBe(2);
  });

  it('should call findAll and count when search term is empty', () => {
    const mockItems = [
      { id: 1, name: 'Item1', acessorioTipo: 'Tipo1', material: 'Mat1', tamanho: 'S', price: 5, estoque: 100, fornecedor: 'F1' }
    ];

    vi.spyOn(acessorioService, 'findAll').mockReturnValue(of(mockItems));
    vi.spyOn(acessorioService, 'count').mockReturnValue(of(10));

    component.searchByName('');

    console.log('📋 Resultado do findAll:', component.dataSource.data);
    console.log('Total de registros:', component.totalRecords);

    expect(component.searchTerm).toBe('');
  });

  it('should reset page to 0 when searching', () => {
    component.page = 5;
    const mockResults: any[] = [];

    vi.spyOn(acessorioService, 'searchByName').mockReturnValue(of(mockResults));

    component.searchByName('test');

    expect(component.page).toBe(0);
  });
});
