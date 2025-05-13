## Simplex de Nelder-Mead

Este projeto implementa o algoritmo de otimização **Simplex de Nelder-Mead** em Haskell, com visualização gráfica em Python.

##  Objetivos

- Implementação do algoritmo de Nelder-Mead para otimização numérica em espaços 2D e 3D.
- Exportar os resultados das iterações para arquivos `.txt`.
- Exportação da evolução do algoritmo com gráficos em 2D e 3D utilizando `matplotlib`.


## Estrutura do Projeto

Simplex-nelder-mead/
├── simplex.hs # Implementação completa do algoritmo em Haskell
├── grafico.py # Script para visualização gráfica dos resultados
├── resultados2d.txt # Resultados do Nelder-Mead em R²
├── resultados3d.txt # Resultados do Nelder-Mead em R³
└── README.md # Este arquivo

## ⚙️ Execução

### 1. Requisitos

- [GHC (Glasgow Haskell Compiler)](https://www.haskell.org/ghc/) para compilar e rodar o código Haskell.
- Python 3 com as seguintes bibliotecas instaladas:
  - `matplotlib`
  - `numpy`

Instale no Terminal:

pip install matplotlib numpy

### 2. Execução 
- Executar o programa Haskell para gerar resultados

ghc simplex.hs -o simplex
./simplex

- Visualizar resultados

python grafico.py

### Documentação do Código
- Arquivo simplex.hs(Funções principais):

- nelderMead: algoritmo principal
- avaliarPontos: avalia a função em cada ponto
- centroide: calcula o centroide dos pontos
- refletir, contrair, substituirPior, encolherParaMelhor: operações geométricas do algoritmo
- exportarResultados: salva os resultados das iterações em .txt

- Arquivo grafico.py (Funções de visualização):

- carregar_resultados(): carrega dados do .txt, com opção de limitar o número de iterações
- plotar_2d(): plota os triângulos
- plotar_2d_com_curvas(): plota os simplexes sobre as curvas de nível da função
- plotar_trajetoria_centroides_2d(): mostra a trajetória dos centroides