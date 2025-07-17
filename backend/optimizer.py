import numpy as np

def gradient(f, x, h=1e-6):
    """Calcula o gradiente por diferenças finitas centradas"""
    grad = np.zeros_like(x)
    for i in range(len(x)):
        x_plus = x.copy()
        x_minus = x.copy()
        x_plus[i] += h
        x_minus[i] -= h
        grad[i] = (f(x_plus) - f(x_minus)) / (2 * h)
    return grad

def hessian(f, x, h=1e-6):
    """Calcula a Hessiana por diferenças finitas centradas"""
    n = len(x)
    hess = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            # Derivada em relação a x_i e x_j
            x_ij = x.copy()
            x_ij[i] += h
            x_ij[j] += h
            x_i = x.copy()
            x_i[i] += h
            x_j = x.copy()
            x_j[j] += h
            hess[i, j] = (f(x_ij) - f(x_i) - f(x_j) + f(x)) / (h**2)
    return (hess + hess.T) / 2  # Tornar simétrica

def line_search(f, x, direction, max_iter=100):
    """Busca linear usando a condição de Armijo"""
    alpha = 1.0
    beta = 0.5
    c = 1e-4
    fx = f(x)
    g = gradient(f, x)
    
    for _ in range(max_iter):
        x_new = x + alpha * direction
        if f(x_new) <= fx + c * alpha * np.dot(g, direction):
            return alpha
        alpha *= beta
    return alpha

def steepest_descent(f, x0, tol=1e-6, max_iter=1000, h=1e-6):
    """Método do Gradiente Descendente"""
    x = np.array(x0, dtype=float)
    history = [x.copy()]
    costs = [f(x)]
    evaluations = 1
    
    for i in range(max_iter):
        g = gradient(f, x, h)
        evaluations += 1
        
        # Direção de descida
        direction = -g
        
        # Busca linear
        alpha = line_search(f, x, direction)
        
        # Atualização
        x = x + alpha * direction
        
        history.append(x.copy())
        costs.append(f(x))
        evaluations += 1
        
        # Critério de parada
        if np.linalg.norm(g) < tol:
            break
            
    return x, history, costs, i+1, evaluations

def newton_method(f, x0, tol=1e-6, max_iter=1000, h=1e-6):
    """Método de Newton"""
    x = np.array(x0, dtype=float)
    history = [x.copy()]
    costs = [f(x)]
    evaluations = 1
    
    for i in range(max_iter):
        g = gradient(f, x, h)
        H = hessian(f, x, h)
        evaluations += 1 + len(x)**2  # Avaliações do gradiente e hessiana
        
        # Resolver sistema para a direção de Newton
        try:
            direction = np.linalg.solve(H, -g)
        except np.linalg.LinAlgError:
            direction = -g  # Fallback para gradiente
        
        # Busca linear
        alpha = line_search(f, x, direction)
        
        # Atualização
        x = x + alpha * direction
        
        history.append(x.copy())
        costs.append(f(x))
        evaluations += 1
        
        # Critério de parada
        if np.linalg.norm(g) < tol:
            break
            
    return x, history, costs, i+1, evaluations

def dfp_method(f, x0, tol=1e-6, max_iter=1000, h=1e-6):
    """Método Davidon-Fletcher-Powell (DFP)"""
    n = len(x0)
    x = np.array(x0, dtype=float)
    H = np.eye(n)  # Aproximação inicial da inversa da Hessiana
    history = [x.copy()]
    costs = [f(x)]
    evaluations = 1
    
    g = gradient(f, x, h)
    evaluations += 1
    
    for i in range(max_iter):
        # Direção de busca
        direction = -H @ g
        
        # Busca linear
        alpha = line_search(f, x, direction)
        
        # Novo ponto
        x_new = x + alpha * direction
        g_new = gradient(f, x_new, h)
        evaluations += 1
        
        # Atualização DFP
        s = x_new - x
        y = g_new - g
        rho = 1.0 / (y @ s)
        
        # Atualização da matriz H
        H = (np.eye(n) - rho * np.outer(s, y)) @ H @ (np.eye(n) - rho * np.outer(y, s)) + rho * np.outer(s, s)
        
        # Armazenar e atualizar
        history.append(x_new.copy())
        costs.append(f(x_new))
        
        # Critério de parada
        if np.linalg.norm(g_new) < tol:
            break 
            
        x = x_new
        g = g_new
        
    return x_new, history, costs, i+1, evaluations