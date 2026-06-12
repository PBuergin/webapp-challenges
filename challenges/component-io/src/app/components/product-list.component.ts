import { Component, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <h2>Produktkatalog</h2>

    @if (products().length > 0) {
      <div class="product-grid">
        @for (product of products(); track product.id) {
          <app-product-card
            [product]="product"
            (onLiked)="handleLike($event)"
          />
        }
      </div>
    } @else {
      <p class="empty">Keine Produkte vorhanden.</p>
    }

    @if (likes().length > 0) {
      <div class="likes-summary">
        <h3>Deine Likes</h3>
        <p>Du hast {{ likes().length }} Produkt(e) geliked.</p>
      </div>
    }
  `,
  styles: [`
    h2 {
      margin-bottom: 1.5rem;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .empty {
      text-align: center;
      color: #999;
      font-size: 1.1rem;
      padding: 3rem;
      background: white;
      border-radius: 8px;
    }
    .likes-summary {
      margin-top: 2rem;
      padding: 1rem 1.5rem;
      background: #ecfdf5;
      border-radius: 8px;
    }
    .likes-summary h3 {
      margin-bottom: 0.5rem;
      color: #065f46;
    }
  `]
})
export class ProductListComponent {
  products = signal<Product[]>([
    { id: 1, name: 'Wireless Keyboard', price: 79.90, description: 'Ergonomische kabellose Tastatur mit Bluetooth' },
    { id: 2, name: 'USB-C Hub', price: 49.90, description: '7-in-1 Hub mit HDMI, USB-A und SD-Kartenleser' },
    { id: 3, name: 'Monitor Stand', price: 39.90, description: 'Höhenverstellbarer Monitorständer aus Aluminium' },
    { id: 4, name: 'Webcam HD', price: 89.90, description: '1080p Webcam mit Mikrofon und Autofokus' },
  ]);

  likes = signal<number[]>([]);

  handleLike(productId: number) {
    if (!this.likes().includes(productId)) {
      this.likes.update(current => [...current, productId]);
    }
  }
}
