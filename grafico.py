import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from itertools import combinations
import numpy as np

# Função 2D 
def funcao_objetivo(x, y):
    return (x-2)**2 + (y-3)**2  

# Carregar resultados do arquivo txt do Haskell
# Função modular, que tem como colocar o limite de iterações(True ou False) 
# def carregar_resultados(nome_arquivo, limitar_iteracoes=False, max_iter=30):
def carregar_resultados(nome_arquivo, limitar_iteracoes=True, max_iter=30):
    with open(nome_arquivo) as arquivo:
        conteudo = arquivo.read()
    iteracoes = conteudo.split("Iteracao:")[1:]
    resultados = []

    for i, iteracao in enumerate(iteracoes):
        if limitar_iteracoes and i >= max_iter:
            break
        linhas = iteracao.strip().split('\n')
        simplex = []
        centroide = None
        for linha in linhas:
            if linha.startswith("  ("):
                ponto_string, valor = linha.split("->")
                ponto = tuple(map(float, ponto_string.strip()[1:-1].split(',')))
                simplex.append((ponto, float(valor.strip())))
            elif linha.startswith("Centroide:"):
                centroide = tuple(map(float, linha.split('(')[1].split(')')[0].split(',')))
        resultados.append((simplex, centroide))
    return resultados

# platagem 2Dc com todas as iterações
def plotar_2d(resultados):
    plt.figure(figsize=(10, 8))
    for i, (simplex, centroide) in enumerate(resultados):
        pontos, _ = zip(*simplex)
        x, y = zip(*pontos)
        plt.plot(x + (x[0],), y + (y[0],), 'o-', label=f'Iteração {i+1}')
        plt.scatter(*centroide, marker='x', color='blue', s=100)
    plt.title('Evolução do Nelder-Mead (2D)')
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.legend()
    plt.grid(True)
    plt.show()


# plotagem 2D com curvas de nível da função objetivo
def plotar_2d_com_curvas(resultados):
    plt.figure(figsize=(10, 8))
    x = np.linspace(-6, 6, 400)
    y = np.linspace(-6, 6, 400)
    X, Y = np.meshgrid(x, y)
    Z = funcao_objetivo(X, Y)

    plt.contour(X, Y, Z, levels=30, cmap='viridis')

    for i, (simplex, centroide) in enumerate(resultados):
        pontos, _ = zip(*simplex)
        xs, ys = zip(*pontos)
        xs = list(xs) + [xs[0]]
        ys = list(ys) + [ys[0]]
        plt.plot(xs, ys, marker='o', label=f'Iteração {i+1}')
        plt.scatter(*centroide, color='blue', marker='o', s=100)

    plt.title("Evolução dos triângulos (simplexes) sobre as curvas de nível")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.legend()
    plt.grid(True)
    plt.axis('equal')
    plt.show()

# Trajetória dos centroides (2D) 
def plotar_trajetoria_centroides_2d(resultados):
    centroides = [centroide for _, centroide in resultados]
    x, y = zip(*centroides)
    plt.figure(figsize=(8, 6))
    plt.plot(x, y, 'r-o')
    plt.title("Trajetória dos Centroides (2D)")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.grid(True)
    plt.show()

# plotagem 3D com todas as iterações
def plotar_3d(resultados):
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')
    
    for i, (simplex, centroide) in enumerate(resultados[:10]):
        pontos, _ = zip(*simplex)
        x, y, z = zip(*pontos)
        for a, b in combinations(pontos, 2):
            ax.plot([a[0], b[0]], [a[1], b[1]], [a[2], b[2]], 'b-', alpha=0.3)
        ax.scatter(x, y, z, label=f'Iteração {i}')
        ax.scatter(*centroide, marker='x', color='red', s=100)
    
    ax.set_title('Evolução do Nelder-Mead (3D)')
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    plt.legend()
    plt.show()

# Trajetória dos centroides (3D)
def plotar_trajetoria_centroides_3d(resultados):
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')
    
    centroides = [centroide for _, centroide in resultados]
    x, y, z = zip(*centroides)
    
    ax.plot(x, y, z, 'r-o')
    ax.set_title("Trajetória dos Centroides (3D)")
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    plt.show()

# Função principal
if __name__ == "__main__":
    # Resultados 2D
    try:
        resultados_2d = carregar_resultados("resultados2d.txt")
        plotar_2d(resultados_2d)
        plotar_2d_com_curvas(resultados_2d)
        plotar_trajetoria_centroides_2d(resultados_2d)
    except FileNotFoundError:
        print("Arquivo resultados2d.txt não encontrado. Favor executar primeiro o programa em Haskell.")

    # Resultados 3D
    try:
        resultados_3d = carregar_resultados("resultados3d.txt")
        plotar_3d(resultados_3d)
        plotar_trajetoria_centroides_3d(resultados_3d)
    except FileNotFoundError:
        print("Arquivo resultados3d.txt não encontrado. Favor executar primeiro o programa em Haskell.")
