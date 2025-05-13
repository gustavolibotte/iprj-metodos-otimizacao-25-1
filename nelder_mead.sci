clc
clear
function [xmin, fmin, simplex_history] = nelder_mead(f, x0, tol, max_iter)
    // x0: ponto inicial (coluna de dimensão n)
    n = length(x0);
    // Inicializa o simplex: x0 e n pontos vizinhos obtidos com pequenos deslocamentos
    simplex = zeros(n, n+1);
    simplex(:,1) = x0;
    for i = 1:n
        x_temp = x0;
        if abs(x_temp(i)) > 1e-4 then
            x_temp(i) = 1.05 * x_temp(i);
        else
            x_temp(i) = 0.00025;
        end
        simplex(:, i+1) = x_temp;
    end

    // Parâmetros clássicos do Nelder–Mead
    alpha = 1;      // coeficiente de reflexão
    gamma_ = 2;      // coeficiente de expansão
    beta_  = 0.5;    // coeficiente de contração
    delta = 0.5;    // coeficiente de encolhimento

    // Armazena o histórico do simplex (dim: n x (n+1) x (max_iter+1))
    simplex_history = zeros(n, n+1, max_iter+1);
    simplex_history(:,:,1) = simplex;
    
    iter = 0;
    while iter < max_iter do
        // Avalia a função em cada vértice
        fvals = zeros(1, n+1);
        for j = 1:(n+1)
            fvals(j) = f(simplex(:, j));
        end

        // Ordena os vértices do simplex com base no valor da função (crescente)
        [fvals_sorted, idx] = gsort(fvals, "g", "i");
        simplex = simplex(:, idx);

        // Cálculo manual do desvio padrão dos valores
        mean_val = sum(fvals_sorted) / (n+1);
        squared_diffs = 0;
        for j = 1:(n+1)
            squared_diffs = squared_diffs + (fvals_sorted(j) - mean_val)^2;
        end
        std_val = sqrt(squared_diffs / (n+1));
        if std_val < tol then
            break;
        end

        // Cálculo do centróide dos n melhores pontos (exclui o pior)
        centroid = mean(simplex(:, 1:n), 2);

        // Etapa de reflexão
        xr = centroid + alpha * (centroid - simplex(:, n+1));
        if f(xr) < fvals_sorted(1) then
            // Tenta expansão se a reflexão gera uma solução melhor que o melhor atual
            xe = centroid + gamma_ * (xr - centroid);
            if f(xe) < f(xr) then
                simplex(:, n+1) = xe;
            else
                simplex(:, n+1) = xr;
            end
        elseif f(xr) < fvals_sorted(n) then
            // Aceita a reflexão se estiver entre o melhor e o penúltimo
            simplex(:, n+1) = xr;
        else
            // Etapa de contração
            if f(xr) < fvals_sorted(n+1) then
                // Contração externa
                xc = centroid + beta_ * (xr - centroid);
            else
                // Contração interna
                xc = centroid - beta_ * (centroid - simplex(:, n+1));
            end
            if f(xc) < f(simplex(:, n+1)) then
                simplex(:, n+1) = xc;
            else
                // Etapa de encolhimento: todos os pontos (exceto o melhor) aproximam-se do melhor
                for j = 2:(n+1)
                    simplex(:, j) = simplex(:, 1) + delta * (simplex(:, j) - simplex(:, 1));
                end
            end
        end

        iter = iter + 1;
        simplex_history(:,:,iter+1) = simplex;
    end
    xmin = simplex(:, 1);
    fmin = f(xmin);
    // Recorta o histórico para o número efetivo de iterações
    simplex_history = simplex_history(:,:,1:iter+1);
endfunction


// Função objetivo para o problema 2D
function y = obj_2d(x)
    y = (x(1) - 2)^2 + (x(2) - 2)^2;
endfunction

// Parâmetros iniciais e chamada do algoritmo (com x0 podendo ser modificado)
x0 = [1; 0];
tol = 1e-6;
max_iter = 200;
[xmin, fmin, hist2d] = nelder_mead(obj_2d, x0, tol, max_iter);

disp("Solução ótima (2D):")
disp(xmin)
disp("Valor ótimo da função:")
disp(fmin)

// Define a grade para as curvas de nível
x = linspace(-2, 4, 100);
y = linspace(-2, 6, 100);
[X, Y] = ndgrid(x, y);
[m, n] = size(X);
Z = zeros(m, n);
for i = 1:m
    for j = 1:n
        Z(i, j) = obj_2d([X(i, j); Y(i, j)]);
    end
end

// Cria a figura com as curvas de nível
figure(1); clf;
contour(x, y, Z, 20);
title("Evolução do Simplex - Problema 2D");
xlabel("x"); ylabel("y");
xtitle("Curvas de Nível e Trajetória do Simplex");

// Plota, iterativamente, os triângulos que representam o simplex
num_iter = size(hist2d, 3);
for k = 1:num_iter
    simplex = hist2d(:, :, k);
    // Conecta os vértices para formar o triângulo (com fechamento do loop)
    x_points = [simplex(1, :), simplex(1, 1)];
    y_points = [simplex(2, :), simplex(2, 1)];
    h_line = plot(x_points, y_points, "r-o", "lineWidth", 2);
    drawnow;
    sleep(500); // pausa de 500ms para visualização
    // Remove o triângulo desenhado para limpar a figura
    delete(h_line);
end

// Plota a solução ótima em destaque
h_opt = plot(xmin(1), xmin(2), "ro", "MarkerSize", 10);
drawnow;


// Função para Desenhar o Tetraedro Utilizando  //
// a Função param3d (em substituição ao plot3)  //

function h_edges = plot_tetraedro(simplex)
    // 'simplex' é uma matriz 3x4 (cada coluna é um vértice)
    // Define os pares de vértices que formam as arestas do tetraedro
    edges = [1, 2;
             1, 3;
             1, 4;
             2, 3;
             2, 4;
             3, 4];
    h_edges = [];
    for i = 1:size(edges, 1)
         pts = simplex(:, edges(i, :));
         // Prepara os vetores de coordenadas para a aresta
         x_line = pts(1, :);
         y_line = pts(2, :);
         z_line = pts(3, :);
         // Desenha a aresta usando param3d (linha azul)
         h = param3d(x_line, y_line, z_line, "k-");
         // Armazena os handles retornados, para que possam ser removidos em seguida
         h_edges = [h_edges, h];
    end
endfunction


// Problema 3D: Otimização com NM      //


// Define a função objetivo 3D: f(x,y,z) = (x-3)² + (y-2)² + (z-1)²
function f_val = obj_3d(x)
    f_val = (x(1) - 3)^2 + (x(2) - 2)^2 + (x(3) - 1)^2;
endfunction

// Parâmetros iniciais e chamada do algoritmo Nelder–Mead (podendo ser modificado)
x0_3d = [1; 0; 2];
tol = 1e-6;
max_iter = 200;
[xmin3, fmin3, hist3d] = nelder_mead(obj_3d, x0_3d, tol, max_iter);

disp("Solução ótima (3D):")
disp(xmin3)
disp("Valor ótimo da função:")
disp(fmin3)

// Configuração da visualização 3D
figure(1); clf;
set(gca(), "data_bounds", [-1, -1, -1; 6, 6, 6]); // Matriz 2x3: [mínimos; máximos]
title("Evolução do Simplex - Problema 3D");
xlabel("x"); ylabel("y"); zlabel("z");
xtitle("Trajetória dos Tetraedros no Espaço");

// Itera sobre o histórico para desenhar (e depois remover) os tetraedros
num_iter3 = size(hist3d, 3);
for k = 1:num_iter3
    simplex = hist3d(:, :, k);
    // Desenha as arestas do tetraedro usando param3d
    h_edges = plot_tetraedro(simplex);
    drawnow;
    sleep(500); // pausa de 500 milissegundos
    // Remove os objetos gráficos desenhados para a próxima iteração
    for i = 1:length(h_edges)
         delete(h_edges(i));
    end
end

// Destaca o local da solução ótima utilizando scatter3d (ponto vermelho)
scatter3d([xmin3(1)], [xmin3(2)], [xmin3(3)], 70, "r");
drawnow;
