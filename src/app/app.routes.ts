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
import { CaptadorList } from './components/captador/captador-list/captador-list';
import { CaptadorForm } from './components/captador/captador-form/captador-form';
import { ProdutoList } from './components/produto/produto-list/produto-list';
import { captadorResolver } from './resolvers/captador-resolver';
import { Home } from './components/home/home';
import { Catalogo } from './components/catalogo/catalogo';
import { Login } from './components/login/login';
import { Cadastro } from './components/cadastro/cadastro';
import { Perfil } from './components/perfil/perfil';
import { UserLayout } from './components/layouts/user-layout/user-layout';

export const routes: Routes = [

   {path: 'login', component: Login, title: 'Login'},
   {path: 'cadastro', component: Cadastro, title: 'Cadastro'},

   {path: '', 
      component: UserLayout,
      children: [
         {path: '', component: Home, title: 'DeepTone Luthier'},
         {path: 'catalogo', component: Catalogo, title: 'Catálogo de Produtos'},
         {path: 'perfil', component: Perfil, title: 'Perfil do Usuário'},
      ]  
   },   

   {path: 'admin', 
      children: [
         {path: '', redirectTo: 'produto', pathMatch: 'full'},
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

         {path: 'produto', component: ProdutoList, title: 'Listagem de Produtos'},

         {path: 'captadores', component: CaptadorList, title: 'Listagem de Captadores'},
         {path: 'captadores/edit/:id', component: CaptadorForm, title: 'Edição de Captador', 
            resolve: {captador: captadorResolver}  },
         {path: 'captadores/new', component: CaptadorForm, title: 'Cadastro de Captador'},
      ]
   },
];
