import math

# Parâmetros fixos (Tabela 1)
V0 = 0.8    # m³
t = 0.03    # m (3 cm)
rho = 8000  # kg/m³
L_max = 2.0 # m
D_max = 1.0 # m
c_m = 4.5   # $/kg
c_w = 20    # $/m

def cost(x):
    """Função objetivo: custo total do tanque"""
    L, D = x
    
    # Cálculo da massa
    # Volume do cilindro (paredes laterais)
    V_cil = L * math.pi * ((D/2 + t)**2 - (D/2)**2)
    # Volume das duas placas
    V_placa = 2 * math.pi * (D/2 + t)**2 * t
    massa = rho * (V_cil + V_placa)
    
    # Comprimento da solda
    solda = 4 * math.pi * (D + t)
    
    return c_m * massa + c_w * solda

def volume(x):
    """Volume interno do tanque"""
    L, D = x
    return (math.pi * D**2 * L) / 4

def constraints(x):
    """Restrições do problema"""
    L, D = x
    vol = volume(x)
    return [
        0.9*V0 - vol,  # Volume mínimo
        vol - 1.1*V0,   # Volume máximo
        L - L_max,      # Comprimento máximo
        D - D_max       # Diâmetro máximo
    ]

def penalty_function(x, penalty_factor=1e6):
    c = cost(x)
    violations = constraints(x)
    penalty = 0.0
    for v in violations:
        if v > 0:
            penalty += penalty_factor * (v ** 2)
    return c + penalty
