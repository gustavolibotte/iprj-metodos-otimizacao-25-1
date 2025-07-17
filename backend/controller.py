from model import penalty_function
from optimizer import steepest_descent, newton_method, dfp_method

def resolver_problema(dados):
    """Controla a otimização com base nos dados recebidos"""
    method = dados['method']
    x0 = dados['x0']
    tol = dados['tol']
    max_iter = dados['max_iter']
    h = dados.get('h', 1e-6)
    
    # Função de penalidade para restrições
    def f(x):
        return penalty_function(x)
    
    # Seleciona o método
    if method == "steepest":
        sol, history, costs, iterations, evaluations = steepest_descent(f, x0, tol, max_iter, h)
    elif method == "newton":
        sol, history, costs, iterations, evaluations = newton_method(f, x0, tol, max_iter, h)
    elif method == "dfp":
        sol, history, costs, iterations, evaluations = dfp_method(f, x0, tol, max_iter, h)
    else:
        raise ValueError(f"Método desconhecido: {method}")
    
    # Preparar resultado para JSON
    return {
        'solution': sol.tolist(),
        'history': [x.tolist() for x in history],
        'costs': costs,
        'iterations': iterations,
        'evaluations': evaluations
    }