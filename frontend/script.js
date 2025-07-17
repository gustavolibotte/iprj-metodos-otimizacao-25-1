const executions = []; // guarda resultados para múltiplas execuções
const colors = ['#e74c3c', '#27ae60', '#2980b9', '#f39c12', '#8e44ad', '#16a085', '#d35400']; 
// cores para diferenciar cada execução
let comparisonData = {
    steepest: null,
    newton: null,
    dfp: null
};

document.getElementById("form-otimizacao").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const alertDiv = document.getElementById("input-alert");

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        alertDiv.textContent = "Por favor, preencha todos os campos corretamente antes de continuar.";
        alertDiv.classList.remove("d-none");
        alertDiv.classList.add("show");
        return;
    }

    // Pegando os dados
    const V0 = 0.8; // volume
    const L = parseFloat(document.getElementById("L0").value);
    const D = parseFloat(document.getElementById("D0").value);
    const volume = (Math.PI * D * D * L) / 4;

    let restricaoViolada = "";

    if (D > 1.0) {
        restricaoViolada = "O diâmetro D excede o máximo permitido (1 m).";
    } else if (L > 2.0) {
        restricaoViolada = "O comprimento L excede o máximo permitido (2 m).";
    } else if (volume < 0.9 * V0 || volume > 1.1 * V0) {
        restricaoViolada = `O volume calculado (${volume.toFixed(4)} m³) está fora da faixa permitida (±10% de 0.8 m³).`;
    }

    if (restricaoViolada !== "") {
        alertDiv.textContent = restricaoViolada;
        alertDiv.classList.remove("d-none");
        alertDiv.classList.add("show");
        return;
    }

    // Tudo certo, envia para o backend
    alertDiv.classList.add("d-none");
    alertDiv.classList.remove("show");

    const dados = {
        method: document.getElementById("method").value,
        L,
        D,
        tol: parseFloat(document.getElementById("tol").value),
        max_iter: parseInt(document.getElementById("max_iter").value),
        h: parseFloat(document.getElementById("h").value)
    };

    const resposta = await fetch("/otimizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const json = await resposta.json();

    document.getElementById("iterations").textContent = json.iteracoes || "-";
    document.getElementById("evaluations").textContent = json.iteracoes || "-";
    document.getElementById("sol-L").textContent = json.melhor_solucao.L.toFixed(4);
    document.getElementById("sol-D").textContent = json.melhor_solucao.D.toFixed(4);
    document.getElementById("final-cost").textContent = json.melhor_solucao.custo.toFixed(2);

    document.getElementById("resultado").style.display = "block";
    plotarTrajetoria(json.historico);
    plotarConvergencia(json.historico);
});


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-btn').addEventListener('click', runOptimization);
    generateContourPlot(); // Pré-gera as curvas de nível
});

document.getElementById('compare-btn').addEventListener('click', runAllMethodsComparison);

async function runAllMethodsComparison() {
    const L0 = parseFloat(document.getElementById('L0').value);
    const D0 = parseFloat(document.getElementById('D0').value);
    const tol = parseFloat(document.getElementById('tol').value);
    const maxIter = parseInt(document.getElementById('max_iter').value);
    const h = parseFloat(document.getElementById('h').value);
    
    // Limpar resultados anteriores
    comparisonData = { steepest: null, newton: null, dfp: null };
    clearCanvases();
    generateContourPlot();
    
    // Desabilitar botão durante a execução
    const compareBtn = document.getElementById('compare-btn');
    compareBtn.disabled = true;
    compareBtn.innerHTML = '<i class="bi bi-hourglass"></i> Executando...';
    
    try {
        // Executar todos os métodos sequencialmente
        comparisonData.steepest = await runOptimizationMethod('steepest', [L0, D0], tol, maxIter, h);
        comparisonData.newton = await runOptimizationMethod('newton', [L0, D0], tol, maxIter, h);
        comparisonData.dfp = await runOptimizationMethod('dfp', [L0, D0], tol, maxIter, h);
        
        // Exibir resultados comparativos
        displayComparisonResults();
        
        // Mostrar a seção de comparação
        document.getElementById('comparison-section').style.display = 'block';
        
        // Plotar todas as trajetórias
        plotAllComparisons();
        
    } catch (error) {
        alert('Erro na comparação: ' + error.message);
        console.error('Erro na comparação:', error);
    } finally {
        compareBtn.disabled = false;
        compareBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Executar Todos os Métodos';
    }
}

async function runOptimizationMethod(method, x0, tol, maxIter, h) {
    const startTime = performance.now();
    
    const payload = {
        method: method,
        x0: x0,
        tol: tol,
        max_iter: maxIter,
        h: h
    };
    
    const response = await fetch('http://localhost:8000/otimizar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Erro no método ${method}: ${response.statusText}`);
    }
    
    const data = await response.json();
    data.executionTime = performance.now() - startTime;
    
    return data;
}

function displayComparisonResults() {
    // Gradiente Descendente
    if (comparisonData.steepest) {
        const s = comparisonData.steepest;
        document.getElementById('comp-steepest-iter').textContent = s.iterations;
        document.getElementById('comp-steepest-cost').textContent = s.costs[s.costs.length - 1].toFixed(2);
        document.getElementById('comp-steepest-time').textContent = s.executionTime.toFixed(2);
        document.getElementById('comp-steepest-L').textContent = s.solution[0].toFixed(4);
        document.getElementById('comp-steepest-D').textContent = s.solution[1].toFixed(4);
    }
    
    // Newton
    if (comparisonData.newton) {
        const n = comparisonData.newton;
        document.getElementById('comp-newton-iter').textContent = n.iterations;
        document.getElementById('comp-newton-cost').textContent = n.costs[n.costs.length - 1].toFixed(2);
        document.getElementById('comp-newton-time').textContent = n.executionTime.toFixed(2);
        document.getElementById('comp-newton-L').textContent = n.solution[0].toFixed(4);
        document.getElementById('comp-newton-D').textContent = n.solution[1].toFixed(4);
    }
    
    // DFP
    if (comparisonData.dfp) {
        const d = comparisonData.dfp;
        document.getElementById('comp-dfp-iter').textContent = d.iterations;
        document.getElementById('comp-dfp-cost').textContent = d.costs[d.costs.length - 1].toFixed(2);
        document.getElementById('comp-dfp-time').textContent = d.executionTime.toFixed(2);
        document.getElementById('comp-dfp-L').textContent = d.solution[0].toFixed(4);
        document.getElementById('comp-dfp-D').textContent = d.solution[1].toFixed(4);
    }
}

function plotAllComparisons() {
    const executions = [];
    
    if (comparisonData.steepest) {
        executions.push({
            method: 'Gradiente Descendente',
            history: comparisonData.steepest.history,
            costs: comparisonData.steepest.costs,
            solution: comparisonData.steepest.solution,
            iterations: comparisonData.steepest.iterations,
            evaluations: comparisonData.steepest.evaluations
        });
    }
    
    if (comparisonData.newton) {
        executions.push({
            method: 'Newton',
            history: comparisonData.newton.history,
            costs: comparisonData.newton.costs,
            solution: comparisonData.newton.solution,
            iterations: comparisonData.newton.iterations,
            evaluations: comparisonData.newton.evaluations
        });
    }
    
    if (comparisonData.dfp) {
        executions.push({
            method: 'DFP',
            history: comparisonData.dfp.history,
            costs: comparisonData.dfp.costs,
            solution: comparisonData.dfp.solution,
            iterations: comparisonData.dfp.iterations,
            evaluations: comparisonData.dfp.evaluations
        });
    }
    
    if (executions.length > 0) {
        plotAllTrajectories(executions);
        plotAllConvergences(executions);
        displayResultsMultiple(executions);
    }
}


async function runOptimization() {
      // Limpa os canvas antes de começar tem que faazer
    clearCanvases();
    
    // Gera as curvas de nível novamente
    generateContourPlot();

    const method = document.getElementById('method').value;
    const L0 = parseFloat(document.getElementById('L0').value);
    const D0 = parseFloat(document.getElementById('D0').value);
    const tol = parseFloat(document.getElementById('tol').value);
    const maxIter = parseInt(document.getElementById('max_iter').value);
    const h = parseFloat(document.getElementById('h').value);
    
    const payload = {
        method: method,
        x0: [L0, D0],
        tol: tol,
        max_iter: maxIter,
        h: h
    };
    
    try {
        // Chamada para o backend Python
        const response = await fetch('http://localhost:8000/otimizar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayResults(data);
        plotTrajectory(data.history);
        plotConvergence(data.costs);
        
    } catch (error) {
        alert('Erro: ' + error.message);
        console.error('Erro na otimização:', error);
    }
}


function displayResults(data) {
    const custoFinal = data.costs[data.costs.length - 1];
    
    document.getElementById('iterations').textContent = data.iterations;
    document.getElementById('evaluations').textContent = data.evaluations;
    document.getElementById('sol-L').textContent = data.solution[0].toFixed(4);
    document.getElementById('sol-D').textContent = data.solution[1].toFixed(4);
    document.getElementById('final-cost').textContent = custoFinal.toFixed(2);

    // Mostra resultado
    document.getElementById("resultado").style.display = "block";

    // Verificação de custo negativo
    const alertaCusto = document.getElementById("alert-custo-negativo");
    console.log("Custo final:", custoFinal);
    
    if (custoFinal < 0) {
        alertaCusto.classList.remove("d-none");
        alertaCusto.classList.add("show");
    } else {
        alertaCusto.classList.add("d-none");
        alertaCusto.classList.remove("show");
    }
    const tabelaBody = document.querySelector("#tabela-historico tbody");
    tabelaBody.innerHTML = ""; // limpa antes de preencher

    for (let i = 0; i < data.history.length; i++) {
        const row = document.createElement("tr");

        const iterCell = document.createElement("td");
        iterCell.textContent = i + 1;

        const LCell = document.createElement("td");
        LCell.textContent = data.history[i][0].toFixed(4);

        const DCell = document.createElement("td");
        DCell.textContent = data.history[i][1].toFixed(4);

        const custoCell = document.createElement("td");
        custoCell.textContent = data.costs[i].toFixed(2);

        row.appendChild(iterCell);
        row.appendChild(LCell);
        row.appendChild(DCell);
        row.appendChild(custoCell);

        tabelaBody.appendChild(row);
    }

}


function generateContourPlot(steps = 50) {
    const canvas = document.getElementById('contour-plot');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grade de fundo (opcional)
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo((width / 10) * i, 0);
        ctx.lineTo((width / 10) * i, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, (height / 10) * i);
        ctx.lineTo(width, (height / 10) * i);
        ctx.stroke();
    }

    // Parâmetros para curvas de nível
    const L_min = 0.1, L_max = 2.0;
    const D_min = 0.1, D_max = 1.0;

    const costs = [];
    let minCost = Infinity;
    let maxCost = -Infinity;

    for (let i = 0; i <= steps; i++) {
        costs[i] = [];
        const L = L_min + (L_max - L_min) * (i / steps);

        for (let j = 0; j <= steps; j++) {
            const D = D_min + (D_max - D_min) * (j / steps);
            const costVal = penaltyFunction([L, D]);
            costs[i][j] = costVal;

            if (costVal < minCost) minCost = costVal;
            if (costVal > maxCost) maxCost = costVal;
        }
    }

    const costRange = maxCost - minCost;
    const levels = 10;

    for (let level = 1; level <= levels; level++) {
        const threshold = minCost + (costRange * level) / levels;
        ctx.beginPath();

        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                if ((costs[i][j] <= threshold && costs[i + 1][j] > threshold) ||
                    (costs[i][j] > threshold && costs[i + 1][j] <= threshold)) {

                    const x = (i / steps) * width;
                    const y = height - (j / steps) * height;
                    ctx.lineTo(x, y);
                }
            }
        }

        ctx.strokeStyle = `rgba(52, 152, 219, ${0.3 + 0.7 * level / levels})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }

    // Eixos
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('L (m)', width - 40, height - 5);
    ctx.fillText('D (m)', 5, 10);
}


function plotTrajectory(history) {
    const canvas = document.getElementById('contour-plot');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Parâmetros de escala
    const L_min = 0.1, L_max = 2.0;
    const D_min = 0.1, D_max = 1.0;
    
    // Função para mapear coordenadas
    const toCanvasX = L => ((L - L_min) / (L_max - L_min)) * width;
    const toCanvasY = D => height - ((D - D_min) / (D_max - D_min)) * height;
    
    // Desenhar trajetória
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
        const [L, D] = history[i];
        const x = toCanvasX(L);
        const y = toCanvasY(D);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]); // linha sólida

    for (let i = 0; i < history.length; i++) {
        const [L, D] = history[i];
        const x = toCanvasX(L);
        const y = toCanvasY(D);

        if (i === 0) {
            // Ponto inicial (verde)
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        } else if (i === history.length - 1) {
            // Ponto final (vermelho escuro)
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();

            // Texto: Solução final
            ctx.fillStyle = '#000';
            ctx.font = '12px sans-serif';
            ctx.fillText('Solução', x + 8, y - 8);
        } else {
            // Ponto intermediário (azul claro)
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

}

function plotConvergence(costs) {
    const canvas = document.getElementById('convergence-plot');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const slicedCosts = costs.slice(1);

    const minCost = Math.min(...slicedCosts);
    const maxCost = Math.max(...slicedCosts);
    const costRange = maxCost - minCost || 1;

    const topPadding = 20;
    const bottomPadding = 30;
    const marginRight = 50;
    const marginLeft = 80;  // aumentei para dar mais espaço
    const usableWidth = width - marginRight - marginLeft;
    const usableHeight = height - topPadding - bottomPadding;

    // Desenhar curva
    ctx.beginPath();
    for (let i = 0; i < slicedCosts.length; i++) {
        const x = marginLeft + (i / (slicedCosts.length - 1)) * usableWidth;
        const y = topPadding + ((maxCost - slicedCosts[i]) / costRange) * usableHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Pontos
    for (let i = 0; i < slicedCosts.length; i++) {
        const x = marginLeft + (i / (slicedCosts.length - 1)) * usableWidth;
        const y = topPadding + ((maxCost - slicedCosts[i]) / costRange) * usableHeight;

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#2980b9';
        ctx.fill();
    }

    // Eixos
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // eixo X
    ctx.moveTo(marginLeft, height - bottomPadding);
    ctx.lineTo(marginLeft + usableWidth, height - bottomPadding);
    // eixo Y
    ctx.moveTo(marginLeft, topPadding);
    ctx.lineTo(marginLeft, height - bottomPadding);
    ctx.stroke();

    // Rótulos dos eixos
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('Iteração', marginLeft + usableWidth - 40, height - 5);
    ctx.fillText('Custo', 10, 15);

    // Valor final
    ctx.fillText(`Custo final: R$${slicedCosts[slicedCosts.length - 1].toFixed(2)}`, marginLeft + usableWidth - 180, topPadding);

    // Ticks no eixo X
    ctx.fillStyle = '#555';
    ctx.font = '10px Arial';
    ctx.strokeStyle = '#aaa';
    for (let i = 0; i <= 5; i++) {
        const x = marginLeft + (i / 5) * usableWidth;
        const iterValue = Math.round((i * (slicedCosts.length - 1)) / 5) + 1;
        ctx.fillText(iterValue, x - 5, height - bottomPadding + 15);
        ctx.beginPath();
        ctx.moveTo(x, height - bottomPadding - 5);
        ctx.lineTo(x, height - bottomPadding);
        ctx.stroke();
    }

    // Ticks no eixo Y
    const numTicksY = 5;
    for (let i = 0; i <= numTicksY; i++) {
        const y = topPadding + (i / numTicksY) * usableHeight;
        const costValue = (maxCost - (i / numTicksY) * costRange).toFixed(2);

        ctx.fillText(costValue, marginLeft - 60, y + 3); // texto alinhado sem cortar

        ctx.beginPath();
        ctx.moveTo(marginLeft - 5, y);
        ctx.lineTo(marginLeft, y);
        ctx.stroke();
    }
}




// Função simplificada para cálculo de custo no frontend (para curvas de nível)
function penaltyFunction(x) {
    // Implementação simplificada para demonstração
    const [L, D] = x;
    const V_cil = L * Math.PI * ((D/2 + 0.03)**2 - (D/2)**2);
    const V_placa = 2 * Math.PI * (D/2 + 0.03)**2 * 0.03;
    const massa = 8000 * (V_cil + V_placa);
    const solda = 4 * Math.PI * (D + 0.03);
    return 4.5 * massa + 20 * solda;
}

function clearCanvases() {
    const contourCtx = document.getElementById('contour-plot').getContext('2d');
    const convergenceCtx = document.getElementById('convergence-plot').getContext('2d');
    
    // Limpa completamente os canvas
    contourCtx.clearRect(0, 0, contourCtx.canvas.width, contourCtx.canvas.height);
    convergenceCtx.clearRect(0, 0, convergenceCtx.canvas.width, convergenceCtx.canvas.height);
    
    // Redesenha os eixos e rótulos básicos
    drawContourAxes(contourCtx);
    drawConvergenceAxes(convergenceCtx);
}
function drawContourAxes(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('L (m)', width - 40, height - 5);
    ctx.fillText('D (m)', 5, 10);
}

function drawConvergenceAxes(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('Iteração', width - 40, height - 5);
    ctx.fillText('Custo', 5, 10);
}
function displayResultsMultiple(execArray) {
    const tabelaBody = document.querySelector("#tabela-historico tbody");
    tabelaBody.innerHTML = "";

    // Cabeçalho da tabela comparativa
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>Método</th>
        <th>Iterações</th>
        <th>Custo Final</th>
        <th>Tempo (ms)</th>
        <th>L (m)</th>
        <th>D (m)</th>
    `;
    tabelaBody.appendChild(headerRow);

    execArray.forEach((exec, idx) => {
        const finalCost = exec.costs[exec.costs.length - 1];
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><span class="badge rounded-pill" style="background-color: ${colors[idx % colors.length]}">${exec.method}</span></td>
            <td>${exec.iterations}</td>
            <td>R$${finalCost.toFixed(2)}</td>
            <td>${exec.executionTime ? exec.executionTime.toFixed(2) : '-'}</td>
            <td>${exec.solution[0].toFixed(4)}</td>
            <td>${exec.solution[1].toFixed(4)}</td>
        `;
        
        tabelaBody.appendChild(row);
    });

    // Mostrar a melhor solução
    const bestSolution = execArray.reduce((best, current) => {
        const currentCost = current.costs[current.costs.length - 1];
        const bestCost = best.costs[best.costs.length - 1];
        return currentCost < bestCost ? current : best;
    }, execArray[0]);

    document.getElementById('iterations').textContent = bestSolution.iterations;
    document.getElementById('evaluations').textContent = bestSolution.evaluations || '-';
    document.getElementById('sol-L').textContent = bestSolution.solution[0].toFixed(4);
    document.getElementById('sol-D').textContent = bestSolution.solution[1].toFixed(4);
    document.getElementById('final-cost').textContent = bestSolution.costs[bestSolution.costs.length - 1].toFixed(2);

    // Alerta custo negativo
    const alertaCusto = document.getElementById("alert-custo-negativo");
    const custoFinal = bestSolution.costs[bestSolution.costs.length - 1];
    
    if (custoFinal < 0) {
        alertaCusto.classList.remove("d-none");
        alertaCusto.classList.add("show");
    } else {
        alertaCusto.classList.add("d-none");
        alertaCusto.classList.remove("show");
    }

    document.getElementById("resultado").style.display = "block";
}
function plotAllTrajectories(execArray, steps = 50) {
    const canvas = document.getElementById('contour-plot');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar e redesenhar as curvas de nível
    ctx.clearRect(0, 0, width, height);
    generateContourPlot(steps);

    // Parâmetros de escala
    const L_min = 0.1, L_max = 2.0;
    const D_min = 0.1, D_max = 1.0;

    const toCanvasX = L => ((L - L_min) / (L_max - L_min)) * width;
    const toCanvasY = D => height - ((D - D_min) / (D_max - D_min)) * height;

    // Desenhar cada trajetória
    execArray.forEach((exec, idx) => {
        const color = colors[idx % colors.length];
        const methodName = exec.method.substring(0, 3).toUpperCase(); // "STP", "NEW", "DFP"

        ctx.beginPath();
        exec.history.forEach(([L, D], i) => {
            const x = toCanvasX(L);
            const y = toCanvasY(D);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            if (i % 5 === 0) {
                ctx.fillStyle = color;
                ctx.font = 'bold 10px Arial';
                ctx.fillText(methodName, x + 5, y - 5);
            }
        });
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Desenhar pontos importantes
        exec.history.forEach(([L, D], i) => {
            const x = toCanvasX(L);
            const y = toCanvasY(D);

            ctx.beginPath();
            if (i === 0) {
                // Ponto inicial
                ctx.fillStyle = '#27ae60';
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
                
                // Texto do método
                ctx.fillStyle = color;
                ctx.font = 'bold 12px Arial';
                ctx.fillText(`${exec.method}`, x + 10, y + 5);
            } else if (i === exec.history.length - 1) {
                // Ponto final
                ctx.fillStyle = '#c0392b';
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
                
                // Valor do custo final
                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                ctx.fillText(`${exec.costs[exec.costs.length - 1].toFixed(2)}`, x + 8, y - 8);
            }
        });
    });
}

function plotAllConvergences(execArray) {
    const canvas = document.getElementById('convergence-plot');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const marginRight = 50;
    const marginLeft = 80;
    const topPadding = 20;
    const bottomPadding = 30;
    const usableWidth = width - marginRight - marginLeft;
    const usableHeight = height - topPadding - bottomPadding;

    // Determinar range global de custos
    let allCosts = execArray.flatMap(e => e.costs);
    const minCost = Math.min(...allCosts);
    const maxCost = Math.max(...allCosts);
    const costRange = maxCost - minCost || 1;

    // Desenhar eixos
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - bottomPadding);
    ctx.lineTo(marginLeft + usableWidth, height - bottomPadding);
    ctx.moveTo(marginLeft, topPadding);
    ctx.lineTo(marginLeft, height - bottomPadding);
    ctx.stroke();

    // Rótulos dos eixos
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('Iteração', marginLeft + usableWidth - 40, height - 5);
    ctx.fillText('Custo', 10, 15);

    // Desenhar cada curva de convergência
    execArray.forEach((exec, idx) => {
        const costs = exec.costs;
        const color = colors[idx % colors.length];
        const methodName = exec.method.substring(0, 3).toUpperCase();

        ctx.beginPath();
        for (let i = 0; i < costs.length; i++) {
            const x = marginLeft + (i / (costs.length - 1)) * usableWidth;
            const y = topPadding + ((maxCost - costs[i]) / costRange) * usableHeight;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            if (i % 5 === 0) {
                ctx.fillStyle = color;
                ctx.font = 'bold 10px Arial';
                ctx.fillText(methodName, x + 2, y - 5);
            }
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Desenhar pontos
        for (let i = 0; i < costs.length; i++) {
            const x = marginLeft + (i / (costs.length - 1)) * usableWidth;
            const y = topPadding + ((maxCost - costs[i]) / costRange) * usableHeight;

            if (i === 0 || i === costs.length - 1) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                
                // Texto para o primeiro e último ponto
                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                if (i === 0) {
                    ctx.fillText(`${costs[i].toFixed(2)}`, x + 5, y - 8);
                } else {
                    ctx.fillText(`${costs[i].toFixed(2)}`, x - 30, y + 15);
                }
            }
        }
    });

    // Legenda
    ctx.font = 'bold 12px Arial';
    execArray.forEach((exec, idx) => {
        const color = colors[idx % colors.length];
        const yPos = topPadding + idx * 20;
        
        ctx.fillStyle = color;
        ctx.fillRect(width - marginRight + 10, yPos, 15, 10);
        
        ctx.fillStyle = '#000';
        ctx.fillText(`${exec.method} (${exec.iterations} iterações)`, width - marginRight + 30, yPos + 10);
    });
}

document.getElementById('export-contour').addEventListener('click', () => {
    const canvas = document.getElementById('contour-plot');
    const link = document.createElement('a');
    link.download = 'curvas_nivel_trajetoria.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

document.getElementById('export-convergence').addEventListener('click', () => {
    const canvas = document.getElementById('convergence-plot');
    const link = document.createElement('a');
    link.download = 'convergencia_metodo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
