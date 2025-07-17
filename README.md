# README - Trabalho de Otimização 

## Descrição do Projeto
Este trabalho implementa três métodos de otimização multidimensional (Gradiente Descendente, Newton e Davidon-Fletcher-Powell) para determinar as dimensões ótimas de um tanque cilíndrico destinado ao transporte de resíduos tóxicos. O objetivo é minimizar o custo de fabricação do tanque, considerando restrições de volume e dimensões físicas.

## Arquitetura (Padrão MVC)
O projeto segue a arquitetura Model-View-Controller (MVC):

- **Model**: `model.py` (lógica do problema e cálculos)
- **View**: `frontend/` (interface visual)
- **Controller**: `controller.py` (intermediário entre frontend e model)

## Pré-requisitos
- Python 3.8+
- Bibliotecas Python: `numpy`, `matplotlib`
- Navegador moderno (Chrome, Firefox, Edge)

## Instalação e Execução

### Passo 1: Configurar o ambiente backend
1. Navegue até a pasta `backend`:
   ```bash
   cd trabalho_otimizacao/backend
   ```

2. Instale as dependências:
   ```bash
   pip install numpy matplotlib
   ```

### Passo 2: Executar o servidor Python
1. Inicie o servidor backend:
   ```bash
   python server.py
   ```
   O servidor iniciará na porta 8000 (http://localhost:8000)

### Passo 3: Abrir a interface frontend
1. Abra o arquivo `frontend/index.html` em seu navegador:
   - Método 1: Arraste o arquivo para o navegador
   - Método 2: Clique com o botão direito > "Abrir com" > Seu navegador

## Funcionalidades Implementadas
1. **Métodos de Otimização**:
   - Gradiente Descendente
   - Método de Newton
   - Método DFP (Davidon-Fletcher-Powell)

2. **Interface Interativa**:
   - Configuração de parâmetros iniciais
   - Seleção de método de otimização
   - Definição de critérios de parada
   - Visualização de resultados numéricos e gráficos

3. **Comparação de Métodos**:
   - Execução simultânea dos três métodos
   - Visualização comparativa em gráficos
   - Tabela comparativa de desempenho

4. **Visualizações Gráficas**:
   - Curvas de nível com trajetória de otimização
   - Gráfico de convergência do método
   - Exportação de gráficos como PNG

## Estrutura de Arquivos
```
trabalho_otimizacao/
│
├── backend/
│   ├── server.py              # Servidor HTTP Python simples
│   ├── model.py              # Implementa função objetivo e restrições
│   ├── optimizer.py          # Algoritmos de otimização
│   └── controller.py         # Controlador MVC
│
├── frontend/
│   ├── img/                  # Imagens utilizadas na interface
│   ├── index.html            # Interface principal
│   ├── style.css             # Estilos da interface
│   └── script.js             # Lógica frontend e comunicação com backend
│
└── README.md                 # Este arquivo
```

## Detalhes de Implementação

### Backend (`backend/`)
1. **server.py**:
   - Servidor HTTP simples usando sockets Python
   - Rota POST `/otimizar` que recebe parâmetros e retorna resultados JSON

2. **model.py**:
   - Implementa a função de custo do tanque
   - Calcula massa, volume e comprimento de solda
   - Verifica restrições do problema

3. **optimizer.py**:
   - Implementa os três métodos de otimização
   - Cálculo de gradientes e hessianas numéricas
   - Critérios de parada e controle de iterações

4. **controller.py**:
   - Recebe requisições do frontend
   - Chama os métodos apropriados do model e optimizer
   - Formata os resultados para retorno ao frontend

### Frontend (`frontend/`)
1. **index.html**:
   - Interface Bootstrap com formulário de entrada
   - Áreas de visualização de resultados
   - Gráficos usando Canvas API

2. **script.js**:
   - Comunicação com o backend via fetch API
   - Plotagem de gráficos interativos
   - Lógica de comparação entre métodos

## Exemplo de Uso
1. Configure os parâmetros iniciais (L, D, tolerância, etc.)
2. Selecione um método de otimização ou clique em "Executar Todos os Métodos"
3. Visualize os resultados:
   - Valores ótimos de L e D
   - Custo mínimo alcançado
   - Trajetória no espaço de busca
   - Convergência do método
4. Compare o desempenho dos diferentes métodos

## Observações
- O projeto não utiliza frameworks web como Flask ou Django, implementando apenas um servidor HTTP mínimo em Python puro.
- Todos os algoritmos de otimização foram implementados manualmente, sem uso de bibliotecas externas.