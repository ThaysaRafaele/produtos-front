import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto } from './models/produto.model';
import { ProdutosService } from './services/produtos.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  erro = signal('');

  novoNome = '';
  novoPreco: number | null = null;
  salvando = signal(false);

  constructor(private readonly produtosService: ProdutosService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.produtosService.listarTodos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os produtos. Verifique se a API está em execução em http://localhost:5000.');
        this.carregando.set(false);
      },
    });
  }

  adicionarProduto(): void {
    if (!this.novoNome.trim() || this.novoPreco === null || this.novoPreco <= 0) {
      this.erro.set('Informe um nome válido e um preço maior que zero.');
      return;
    }

    this.erro.set('');
    this.salvando.set(true);

    this.produtosService.criar({ nome: this.novoNome.trim(), preco: this.novoPreco }).subscribe({
      next: () => {
        this.novoNome = '';
        this.novoPreco = null;
        this.salvando.set(false);
        this.carregarProdutos();
      },
      error: () => {
        this.erro.set('Não foi possível criar o produto. Verifique se a API está em execução.');
        this.salvando.set(false);
      },
    });
  }

  removerProduto(id: number): void {
    this.erro.set('');

    this.produtosService.remover(id).subscribe({
      next: () => {
        this.produtos.update((lista) => lista.filter((p) => p.id !== id));
      },
      error: () => {
        this.erro.set('Não foi possível remover o produto. Verifique se a API está em execução.');
      },
    });
  }
}
