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
  editandoId: number | null = null;

  idBusca: number | null = null;
  produtoBuscado = signal<Produto | null>(null);
  buscandoId = signal(false);
  erroBusca = signal('');

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

  salvarProduto(): void {
    if (!this.novoNome.trim() || this.novoPreco === null || this.novoPreco <= 0) {
      this.erro.set('Informe um nome válido e um preço maior que zero.');
      return;
    }

    this.erro.set('');
    this.salvando.set(true);

    const produto = { nome: this.novoNome.trim(), preco: this.novoPreco };

    if (this.editandoId !== null) {
      this.produtosService.atualizar(this.editandoId, produto).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.salvando.set(false);
          this.carregarProdutos();
        },
        error: () => {
          this.erro.set('Não foi possível atualizar o produto. Verifique se a API está em execução.');
          this.salvando.set(false);
        },
      });
      return;
    }

    this.produtosService.criar(produto).subscribe({
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

  editarProduto(produto: Produto): void {
    this.editandoId = produto.id;
    this.novoNome = produto.nome;
    this.novoPreco = produto.preco;
    this.erro.set('');
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.novoNome = '';
    this.novoPreco = null;
  }

  removerProduto(id: number): void {
    this.erro.set('');

    this.produtosService.remover(id).subscribe({
      next: () => {
        this.produtos.update((lista) => lista.filter((p) => p.id !== id));
        if (this.editandoId === id) {
          this.cancelarEdicao();
        }
      },
      error: () => {
        this.erro.set('Não foi possível remover o produto. Verifique se a API está em execução.');
      },
    });
  }

  buscarProdutoPorId(): void {
    if (this.idBusca === null) {
      this.erroBusca.set('Informe um id para buscar.');
      return;
    }

    this.erroBusca.set('');
    this.produtoBuscado.set(null);
    this.buscandoId.set(true);

    this.produtosService.buscarPorId(this.idBusca).subscribe({
      next: (produto) => {
        this.produtoBuscado.set(produto);
        this.buscandoId.set(false);
      },
      error: () => {
        this.erroBusca.set('Produto não encontrado.');
        this.buscandoId.set(false);
      },
    });
  }

  limparBusca(): void {
    this.idBusca = null;
    this.produtoBuscado.set(null);
    this.erroBusca.set('');
  }
}
