import { Routes } from '@angular/router';
import { AcessorioList } from './components/acessorio/acessorio-list/acessorio-list';
import { AcessorioForms } from './components/acessorio/acessorio-forms/acessorio-forms';
import { acessorioResolver } from './resolvers/acessorio-resolver';
import { BaixoList } from './components/baixo/baixo-list/baixo.list';
import { BaixoForm } from './components/baixo/baixo-form/baixo-form';
import { baixoResolver } from './resolvers/baixo-resolver';
import { BaixocustomForm } from './components/baixocustom/baixocustom-forms/baixocustom-forms';
import { baixocustomResolver } from './resolvers/baixocustom-resolver';
import { BaixocustomList } from './components/baixocustom/baixocustom-list/baixocustom-list';

export const routes: Routes = [

   {path: 'acessorios', component: AcessorioList, title: 'Listagem de Acessórios'},
   {path: 'acessorios/edit/:id', component: AcessorioForms, title: 'Edição de Acessório', 
      resolve: {acessorio: acessorioResolver}  },
   {path: 'acessorios/new', component: AcessorioForms, title: 'Cadastro de Acessório'}, 

   {path: 'baixo', component: BaixoList, title: 'Listagem de Baixos'},
   {path: 'baixo/edit/:id', component: BaixoForm, title: 'Edição de Baixo', 
      resolve: {baixo: baixoResolver}  },
   {path: 'baixo/new', component: BaixoForm, title: 'Cadastro de Baixo'},

   {path: 'baixo-custom', component: BaixocustomList, title: 'Listagem de Baixos'},
   {path: 'baixo-custom/edit/:id', component: BaixocustomForm, title: 'Edição de Baixo', 
      resolve: {baixo: baixocustomResolver}  },
   {path: 'baixo-custom/new', component: BaixocustomForm, title: 'Cadastro de Baixo'},


];
