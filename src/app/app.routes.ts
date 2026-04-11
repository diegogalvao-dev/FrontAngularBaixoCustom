import { Routes } from '@angular/router';
import { AcessorioList } from './components/acessorio/acessorio-list/acessorio-list';
import { AcessorioForms } from './components/acessorio/acessorio-forms/acessorio-forms';
import { acessorioResolver } from './resolvers/acessorio-resolver';

export const routes: Routes = [

     {path: 'acessorios', component: AcessorioList, title: 'Listagem de Acessórios'},
     {path: 'acessorios/edit/:id', component: AcessorioForms, title: 'Edição de Acessório', 
        resolve: {acessorio: acessorioResolver}  },

        

];
