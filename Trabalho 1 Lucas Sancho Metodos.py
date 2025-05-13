import matplotlib.pyplot as plt
import numpy as np

def funcao(opcao, vertice):
    if(opcao == 1):
        #funcao de R2
        return (vertice[0]-2)**4 + (vertice[0] - 2 * vertice[1])**2
    if(opcao == 2):
        #funcao de R3
        return (vertice[0]-1)**4 + (vertice[1] + 2)**2 + (vertice[2] - 3)**6

def SelectionSort(vetor, minimizar=True):
    #Uma funcao que se basea no algoritmo Selection Sort
    #para ordenar os valores de um determinado vetor.
    #Alem de ordenar o vetor, também retorna um vetor extra
    #chamado "ordem", que pode ser utilizado para ordenar outro
    #vetor baseado nos valores do vetor entregue no parametro.

    #Exemplo:
    #vetor = [2,0,5]
    #ordem = [0,1,2]
    #Depois de passar nessa funcao:
    #vetor = [0,2,5]
    #ordem = [1,0,2]

    ordemPosicao = []
    for i in range(len(vetor)):
        ordemPosicao.append(i)

    x = 0
    while x < len(vetor):
        posicaoMelhor = x
        y = x + 1
        valor = vetor[x]
        while y < len(vetor):
            if minimizar:
                if valor > vetor[y]:
                    valor = vetor[y]
                    posicaoMelhor = y
            else:
                if valor < vetor[y]:
                    valor = vetor[y]
                    posicaoMelhor = y
            y+=1
        if posicaoMelhor != x:
            backup = vetor[x]
            vetor[x] = vetor[posicaoMelhor]
            vetor[posicaoMelhor] = backup
            
            backup = ordemPosicao[x]
            ordemPosicao[x] = ordemPosicao[posicaoMelhor]
            ordemPosicao[posicaoMelhor] = backup
        x+=1
    return [vetor, ordemPosicao]

def ControleSort(valores, vertices,  minimizar=True):
    #Funcao de controle da ordenacao de valores e vertices

    #utiliza uma funcao inspirada no Selection Sort
    valores, ordem = SelectionSort(valores, minimizar)

    #organiza os vertices baseado na ordem criada pelo Selection Sort
    verticesBackup = vertices.copy()
    for i in range(len(ordem)):
        vertices[i] = verticesBackup[ordem[i]]

    return valores, vertices

def Centroide(vertices):
    #forma de calcular o centroide baseada na
    #forma mostrada no slide 12 da aula 5

    posicaoFinal = []

    for variaveis in range(len(vertices[0])):
        somaVariavel = 0
        for pontos in vertices:
            somaVariavel += pontos[variaveis]
        posicaoFinal.append(somaVariavel/len(vertices))

    return posicaoFinal


def CalcularNovoX(mi, centroide, piorVertice):
    #Forma de calcular o novo x baseado na 
    #forma mostrada no slide 12 da aula 5
   
    vertice = []
    for variavel in range(len(piorVertice)):
        vertice.append((1+mi)*centroide[variavel] - mi*piorVertice[variavel])
    
    return vertice

def ControleNelder(opcao=1,ax=None):
    #Este modelo foi feito com a minimizacao em meten.

    #cria as variaveis iniciais para o problema de R2
    if(opcao == 1):
        Mi = [-.5, 0.5, 1.5, 3]
        erro = 0.002
        interacaoMaxima = 100
        minimizacao = True

        x = [[0,0], [0,2], [1,2]]

    #cria as variaveis iniciais para o problema de R3
    elif(opcao == 2):
        Mi = [-.5, 0.5, 1.5, 3]
        erro = 0.002
        interacaoMaxima = 100
        minimizacao = True

        x = [[0,0,0], [0,2,0], [2,1,1], [1,0,2]]

    #gera cada funcao resultate dos X's
    f = []
    for ponto in x:
        f.append(funcao(opcao, ponto))

    #organiza os X's e seus valores de forma crescente.
    f, x = ControleSort(f, x, minimizacao)
    desenharLinhas(x, ax, opcao)

    #define um tamanho n para ficar mais legivel o codigo.
    n = len(f)-2

    interacaoAtual = 3

    #começa a loop de interacoes para encontrar o melhor ponto para a minimizacao.
    while interacaoAtual < interacaoMaxima and f[n+1] - f[0] > erro:

        #calcula o centroide.
        centroide = Centroide(x)

        #calcula o xr e seu valor na funcao.
        xr = CalcularNovoX(Mi[2], centroide, x[n+1])
        fr = funcao(opcao, xr)

        #se chegar na interacao maxima, para o loop.
        if(interacaoAtual == interacaoMaxima):
            break

        #faz o valor b) do slide 13 da aula 5.
        if(f[0] <= fr and fr < f[n]):
            x[n+1] = xr
            f[n+1] = fr
            interacaoAtual += 1
            f, x = ControleSort(f, x, minimizacao)
            desenharLinhas(x, ax, opcao)
            continue
    
        #faz o c) do slide 13 da aula 5.
        if(fr < f[0]):
            xe = CalcularNovoX(Mi[3], centroide, x[n+1])
            fe = funcao(opcao, xe)
            interacaoAtual += 1
            if(fe < fr):
                x[n+1] = xe
                f[n+1] = fe
            else:
                x[n+1] = xr
                f[n+1] = fr
            f, x = ControleSort(f, x, minimizacao)
            desenharLinhas(x, ax, opcao)
            continue

        #faz o d) do slide 14 da aula 5
        if(f[n] <= fr and fr < f[n+1]):
            xc = CalcularNovoX(Mi[1], centroide, x[n+1])
            fc = funcao(opcao, xc)
            interacaoAtual +=1 
            if(fc <= fr):
                x[n+1] = xc
                f[n+1] = fc
                f, x = ControleSort(f, x, minimizacao)
                desenharLinhas(x, ax, opcao)
                continue

            #faz o f) do slide 14 da aula 5
            else:
                i = 1
                while i < len(x):
                    x[i] = x[0] - (x[i]-x[0])/2
                    f[i] = funcao(opcao, x[i])
                    i+=1
                f, x = ControleSort(f, x, minimizacao)
                desenharLinhas(x, ax, opcao)
                continue
                
        #faz o e) do slide 14 da aula 5
        if(fr >= f[n+1]):
            xci = CalcularNovoX(Mi[0], centroide, x[n+1])
            fci = funcao(opcao, xci)
            interacaoAtual += 1
            if(fci < f[n+1]):
                x[n+1] = xci
                f[n+1] = fci
                f, x = ControleSort(f, x, minimizacao)
                desenharLinhas(x, ax, opcao)
                continue

            #faz o f) do slide 14 da aula 5
            else:
                i = 1
                while i < len(x):
                    for j in range(len(x[i])):
                        x[i][j] = x[0][j] - (x[i][j]-x[0][j])/2
                    f[i] = funcao(opcao, x[i])
                    i+=1
                f, x = ControleSort(f, x, minimizacao)
                desenharLinhas(x, ax, opcao)
                continue

    centroide = Centroide(x)
    print("\n\n","Interacao:", interacaoAtual, "| x =",  centroide, "| f(x) =", funcao(opcao,centroide),"\n\n")

    if(opcao == 1):
        if(ax != None):
            ax.plot(centroide[0], centroide[1], 'go')
            plt.pause(5)

def desenharLinhas(vetor, ax, opcao):
    #Desenha as linhas de cada triangulo.
    if(ax == None): return

    #passa por cada um dos pontos dos vetores
    # para conectar uma linha entre eles.
    i = 0
    while i < len(vetor)-1:
        j = i+1
        while j < len(vetor):
            #desenha a linha para o grafico 2D
            if(opcao == 1):
                ax.plot([vetor[i][0], vetor[j][0]], [vetor[i][1], vetor[j][1]], 'r')

            #desenha a linha para o grafico 3D
            elif(opcao == 2):
                ax.plot([vetor[i][0], vetor[j][0]], [vetor[i][1], vetor[j][1]], [vetor[i][2], vetor[j][2]], 'r')
            j+=1
        i+=1
    
    #aguardar um tempo para cada interacao
    plt.pause(0.75)
    
def grafico2D():
    #prepara a variavel 'ax' para desenar o grafico

    #modifica a estilo de desenhar o grafico.
    plt.style.use('_mpl-gallery-nogrid')

    #calcula os valores para criar as curvas de niveis.
    X, Y = np.meshgrid(np.linspace(-1, 4, 256), np.linspace(-1, 4, 256))
    Z = (X-2)**4 + (X - 2 * Y)**2
    levels = np.linspace(Z.min(), Z.max(), 25)

    plt.ion()

    #cria a figura e o grafico para plotar.
    figura = plt.figure()
    ax = figura.add_subplot(111)

    #plota as curvas de niveis
    ax.contourf(X, Y, Z, levels=levels)
    
    #desenha o grafico na tela.
    figura.canvas.draw()

    return ax

def grafico3D():
    plt.ion()

    #cria a figura e o grafico para plotar.
    figura = plt.figure()
    ax = figura.add_subplot(111, projection="3d")
    
    #desenha o grafico na tela.
    figura.canvas.draw()

    return ax

while 1:
    print("Digite o numero da opcao que desejar.")
    print("-------------------------------------")
    print("1 - Fazer problema de R2")
    print("2 - Fazer problema de R3")
    print("")
    print("0 - Sair")

    escolha = int(input())

    if escolha == 1:
        ax = grafico2D()
        ControleNelder(1, ax)
    
    elif escolha == 2:
        ax = grafico3D()
        ControleNelder(2, ax)

    elif escolha == 0:
        exit()

    else:print("\n\n\nPor favor escolha um numero corretamente\n")