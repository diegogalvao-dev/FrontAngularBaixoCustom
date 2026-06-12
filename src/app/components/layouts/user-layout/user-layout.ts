import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { WishlistService } from '../../../services/wishlist.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {
  readonly authService = inject(AuthService);
  readonly carrinhoService = inject(CarrinhoService);
  readonly wishlistService = inject(WishlistService);
}
