import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# ===========================
# Funções Objetivo
# ===========================
def funcao_r2_exemplo(x):
    """Função exemplo R²: (x1 − 2)^4 + (x1 − 2x2)^2"""
    return (x[0] - 2)**4 + (x[0] - 2 * x[1])**2

def funcao_r3_exemplo(x):
    """Função exemplo R³: x1² + 2x2² + 3x3²"""
    return x[0]**2 + 2 * x[1]**2 + 3 * x[2]**2

# ===========================
# Inicialização do Símplex
# ===========================
def inicializar_simplex(p0, passo):
    n = len(p0)
    simplex = [p0.copy()]
    for i in range(n):
        pi = p0.copy()
        pi[i] += passo
        simplex.append(pi)
    return np.array(simplex)

# ===========================
# Método de Nelder-Mead (melhorado)
# ===========================
def otimizar_nelder_mead(f, p0, passo, tolerancia=1e-6, max_iter=1000, verbose=True):
    n = len(p0)
    simplex = inicializar_simplex(p0, passo)
    historico = []

    for iteracao in range(max_iter):
        valores = np.array([f(x) for x in simplex])
        ordem = np.argsort(valores)
        simplex = simplex[ordem]
        valores = valores[ordem]
        historico.append(simplex.copy())

        if valores[-1] - valores[0] < tolerancia:
            if verbose:
                print(f"Convergiu após {iteracao} iterações")
            return simplex[0], valores[0], iteracao, historico

        centroide = np.mean(simplex[:-1], axis=0)
        refletido = centroide + 1.0 * (centroide - simplex[-1])
        f_refletido = f(refletido)

        if f_refletido < valores[0]:
            expandido = centroide + 2.0 * (refletido - centroide)
            f_expandido = f(expandido)
            simplex[-1] = expandido if f_expandido < f_refletido else refletido
        elif f_refletido < valores[-2]:
            simplex[-1] = refletido
        else:
            contraido = centroide + 0.5 * (simplex[-1] - centroide)
            f_contraido = f(contraido)
            if f_contraido < valores[-1]:
                simplex[-1] = contraido
            else:
                for i in range(1, n+1):
                    simplex[i] = simplex[0] + 0.5 * (simplex[i] - simplex[0])

    if verbose:
        print("Número máximo de iterações atingido")
    return simplex[0], valores[0], max_iter, historico

# ===========================
# Execução Múltipla
# ===========================
def executar_multiplas_otimizacoes(f, dim, num_execucoes, min_valor, max_valor, passo, tolerancia, max_iter):
    melhor_valor = float('inf')
    melhor_ponto = None
    for i in range(num_execucoes):
        p0 = np.random.uniform(min_valor, max_valor, dim)
        ponto, valor, iters, _ = otimizar_nelder_mead(f, p0, passo, tolerancia, max_iter, verbose=False)
        print(f"Execução {i+1}: Valor = {valor:.2e}, Ponto = {ponto}, Iterações = {iters}")
        if valor < melhor_valor:
            melhor_valor = valor
            melhor_ponto = ponto
    return melhor_ponto, melhor_valor

# ===========================
# Visualização em R²
# ===========================
def visualizar_2d(f):
    p0 = np.array([1.0, 1.0])
    passo = 0.1
    _, _, _, historico = otimizar_nelder_mead(f, p0, passo, verbose=False)

    X, Y = np.meshgrid(np.linspace(-1, 4, 400), np.linspace(-1, 4, 400))
    Z = np.array([f(np.array([x, y])) for x, y in zip(X.ravel(), Y.ravel())]).reshape(X.shape)

    plt.ion()
    fig, ax = plt.subplots()
    for k, simplex in enumerate(historico):
        ax.clear()
        ax.contour(X, Y, Z, levels=50, cmap='viridis')
        ax.plot(simplex[:, 0], simplex[:, 1], 'bo-')
        ax.plot(simplex[0, 0], simplex[0, 1], 'ro')
        ax.set_title(f"Iteração {k}")
        plt.pause(0.05)
    plt.ioff()
    plt.show()

# ===========================
# Visualização em R³
# ===========================
def visualizar_3d(f):
    p0 = np.array([1.0, 1.0, 1.0])
    passo = 0.1
    _, _, _, historico = otimizar_nelder_mead(f, p0, passo, verbose=False)

    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    plt.ion()

    for k, simplex in enumerate(historico):
        ax.clear()
        for i in range(len(simplex)):
            ax.scatter(*simplex[i], c='b')
        for i in range(len(simplex)):
            for j in range(i+1, len(simplex)):
                ax.plot([simplex[i][0], simplex[j][0]], [simplex[i][1], simplex[j][1]], [simplex[i][2], simplex[j][2]], 'gray')
        ax.scatter(*simplex[0], c='r', s=100)
        ax.set_xlim(-1, 2)
        ax.set_ylim(-1, 2)
        ax.set_zlim(-1, 2)
        ax.set_title(f"Iteração {k}")
        plt.pause(0.1)
    plt.ioff()
    plt.show()

# ===========================
# Execução Principal
# ===========================
if __name__ == "__main__":
    print("--- Otimização em R² ---")
    melhor_ponto, melhor_valor = executar_multiplas_otimizacoes(
        funcao_r2_exemplo, dim=2, num_execucoes=5,
        min_valor=-2, max_valor=4, passo=0.1,
        tolerancia=1e-6, max_iter=1000)
    print(f"Melhor ponto R²: {melhor_ponto}, valor: {melhor_valor:.2e}\n")

    print("--- Otimização em R³ ---")
    p0 = np.array([1.0, 1.0, 1.0])
    ponto_3d, valor_3d, iteracoes, _ = otimizar_nelder_mead(funcao_r3_exemplo, p0, passo=0.1)
    print(f"Melhor ponto R³: {ponto_3d}, valor: {valor_3d:.2e}, iterações: {iteracoes}\n")

    print("--- Visualização R² ---")
    visualizar_2d(funcao_r2_exemplo)

    print("--- Visualização R³ ---")
    visualizar_3d(funcao_r3_exemplo)
