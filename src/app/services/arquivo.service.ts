import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArquivoService {
  private readonly baseUrl = 'http://localhost:8080/arquivos';

  constructor(private http: HttpClient) { }

  getUrlDownload(fid: string): string {
    return `${this.baseUrl}/download/${fid}`;
  }

  uploadBaixoCustomizado(id: number, files: File[]): Observable<any>[] {
    return files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.patch(`${this.baseUrl}/baixocustomizado/${id}`, formData, { responseType: 'text' });
    });
  }

  uploadBaixo(id: number, files: File[]): Observable<any>[] {
    return files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.patch(`${this.baseUrl}/baixo/${id}`, formData, { responseType: 'text' });
    });
  }

  uploadAcessorio(id: number, files: File[]): Observable<any>[] {
    return files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.patch(`${this.baseUrl}/acessorio/${id}`, formData, { responseType: 'text' });
    });
  }

  uploadFotoPerfil(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.patch(`${this.baseUrl}/usuario/foto`, formData, { responseType: 'text' });
  }

  remove(fid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${fid}`);
  }
}
