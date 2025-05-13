-- Módulo principal
module Main where

-- Importação de funções de ordenação e formatação
import Data.List (sortBy)
import Data.Ord (comparing)
import Text.Printf (printf)
import System.IO (writeFile)



-- Ponto é uma lista de números reais
-- PontoAvaliado é um par (coordenadas, valor da função)
type Ponto = [Double]
type PontoAvaliado = (Ponto, Double)

-- Implementação do método de otimização Nelder-Mead
-- Recebe uma função a ser minimizada, um simplex inicial, os parâmetros alpha, gamma, tolerância e número máximo de iterações
-- Retorna uma lista com um "histórico" das iterações sendo que cada elemento é o simplex avaliado e seu centroide.
nelderMead :: (Ponto -> Double) -> [Ponto] -> Double -> Double -> Double -> Int -> [([PontoAvaliado], Ponto)]
nelderMead funcao simplexInicial alfa gama tolerancia maxIteracoes = 
    -- Inicia a primeira iteração chamando a função auxiliar `iterar`
    iterar (avaliarPontos funcao simplexInicial) alfa gama tolerancia maxIteracoes
  where -- permite "declarar no final", sem interromper a expressão principal.
    -- Caso base: se o número de iterações chegar a zero, retorna o simplex atual e seu centroide
    iterar simplex _ _ _ 0 = [(simplex, centroide $ map fst simplex)]

    -- Função recursiva que executa uma iteração do algoritmo por vez
    iterar simplex alfa gama tolerancia iteracoes =
        -- Ordena os pontos avaliados do simplex do melhor (menor valor) para o pior (maior valor)
        let ordenado = sortBy (comparing snd) simplex
            valorMelhor = snd $ head ordenado  -- valor do melhor ponto
            valorPior = snd $ last ordenado    -- valor do pior ponto
        in 
        -- Verifica critério de parada baseado na tolerância
        if abs (valorPior - valorMelhor) <= tolerancia
            then [(ordenado, centroide $ map fst ordenado)]  -- Retorna se convergiu
            else
                -- Se não convergiu, realiza uma nova iteração

                let (melhor, intermediarios) = (head ordenado, init $ tail ordenado)
                    pior = last ordenado

                    -- Calcula o centroide dos melhores pontos (exceto o pior)
                    centro = centroide $ map fst intermediarios

                    -- REFLEXÃO: reflete o ponto pior em relação ao centroide
                    refletido = refletir centro (fst pior) alfa
                    valorRefletido = funcao refletido

                    -- Decide o próximo passo com base no valor do ponto refletido
                    (novoSimplex, _) =
                        if valorRefletido < snd melhor then
                            -- EXPANSÃO: se o refletido for melhor que o melhor atual, tenta expandir
                            let expandido = refletir centro refletido gama
                                valorExpandido = funcao expandido
                            in 
                                if valorExpandido < valorRefletido then
                                    -- Se a expansão for ainda melhor, substitui o pior pelo expandido
                                    (substituirPior ordenado expandido valorExpandido, "Expansão")
                                else
                                    -- Caso contrário, fica com o refletido
                                    (substituirPior ordenado refletido valorRefletido, "Reflexão")

                        else if valorRefletido < snd (last intermediarios) then
                            -- Se o refletido for melhor que pelo menos o segundo pior, aceita reflexão
                            (substituirPior ordenado refletido valorRefletido, "Reflexão")
                        else
                            -- Se o refletido não for bom, faz CONTRAÇÃO ou ENCOLHIMENTO
                            if valorRefletido < snd pior then
                                -- CONTRAÇÃO externa: tenta aproximar do centro
                                let contraido = contrair centro refletido 0.5
                                    valorContraido = funcao contraido
                                in 
                                    if valorContraido < valorRefletido then
                                        (substituirPior ordenado contraido valorContraido, "Contração")
                                    else
                                        (encolherParaMelhor funcao ordenado melhor, "Encolhimento")
                            else
                                -- CONTRAÇÃO interna: tenta contrair diretamente do pior para o centro
                                let contraido = contrair centro (fst pior) 0.5
                                    valorContraido = funcao contraido
                                in 
                                    if valorContraido < snd pior then
                                        (substituirPior ordenado contraido valorContraido, "Contração")
                                    else
                                        (encolherParaMelhor funcao ordenado melhor, "Encolhimento")

                -- Armazena o simplex atual e o centro para visualização, e continua recursivamente
                in (simplex, centro) : iterar novoSimplex alfa gama tolerancia (iteracoes - 1)


-- Avalia todos os pontos com a função
avaliarPontos :: (Ponto -> Double) -> [Ponto] -> [PontoAvaliado]
avaliarPontos f = map (\p -> (p, f p))

-- Calcula o centroide de uma lista de pontos
centroide :: [Ponto] -> Ponto
centroide pontos = map (\xs -> sum xs / fromIntegral (length xs)) (transpor pontos)

-- Reflexão de um ponto em relação ao centroide
refletir :: Ponto -> Ponto -> Double -> Ponto
refletir centro ponto alfa = zipWith (+) centro (map (* alfa) (zipWith (-) centro ponto))

-- Contração de um ponto em direção ao centroide
contrair :: Ponto -> Ponto -> Double -> Ponto
contrair centro ponto beta = zipWith (+) centro (map (* beta) (zipWith (-) ponto centro))

-- Substitui o pior ponto no simplex pelo novo ponto avaliado
-- O novo ponto é adicionado ao final da lista, e o pior ponto é removido
substituirPior :: [PontoAvaliado] -> Ponto -> Double -> [PontoAvaliado]
substituirPior ordenado novoPonto novoValor = sortBy (comparing snd) (init ordenado ++ [(novoPonto, novoValor)])

-- Encolhe todos os pontos em direção ao melhor ponto
-- Isso é feito multiplicando a diferença entre o ponto e o melhor ponto por 0.5
-- e somando ao melhor ponto    
-- O resultado é uma lista de pontos encolhidos, ordenados pelo valor da função
-- O primeiro elemento da lista é o melhor ponto, e o segundo é o valor do melhor ponto
encolherParaMelhor :: (Ponto -> Double) -> [PontoAvaliado] -> PontoAvaliado -> [PontoAvaliado]
encolherParaMelhor f ordenado (melhorPonto, valorMelhor) =
    let encolher (p, _) = 
            let novoPonto = zipWith (+) melhorPonto (map (* 0.5) (zipWith (-) p melhorPonto))
            in (novoPonto, f novoPonto)
    in sortBy (comparing snd) $ (melhorPonto, valorMelhor) : map encolher (tail ordenado)

-- Transposição de uma matriz
-- Transforma uma lista de listas em uma lista de listas transposta
-- Exemplo: [[1,2,3], [4,5,6]] -> [[1,4], [2,5], [3,6]]
-- Caso base: se a primeira linha for vazia, retorna uma lista vazia
-- Caso contrário, pega o primeiro elemento de cada linha e aplica recursivamente
transpor :: [[a]] -> [[a]]
transpor ([]:_) = []
transpor x = map head x : transpor (map tail x)

-- Exemplo de função objetivo em R^2
esfera2D :: Ponto -> Double
esfera2D [x,y] = (x-2)^2 + (y-3)^2
esfera2D _ = error "esfera2D: dimensionalidade errada"

-- Exemplo de função objetivo em R^3
esfera3D :: Ponto -> Double
esfera3D [x,y,z] = (x-1)^2 + (y-2)^2 + (z-3)^2
esfera3D _ = error "esfera3D: dimensionalidade errada"

-- Formata um ponto para printar
-- Exemplo: [1.234567, 2.345678] -> "(1.2346, 2.3457)"
-- Utiliza printf para formatar com 4 casas decimais
formatarPonto :: Ponto -> String
formatarPonto p = "(" ++ intercalar ", " (map (printf "%.4f") p) ++ ")"

-- Exporta os resultados de cada iteração para um arquivo txt
-- Cada iteração é formatada com o simplex atual e o centroide
exportarResultados :: FilePath -> [([PontoAvaliado], Ponto)] -> IO ()
exportarResultados caminho resultados = writeFile caminho (paraTexto resultados)
  where
    paraTexto = unlines . map formatarIteracao
    formatarIteracao (simplex, centro) =
        "Iteracao:\n" ++
        "Simplex:\n" ++ 
        unlines (map (\(p,v) -> "  " ++ formatarPonto p ++ " -> " ++ printf "%.6f" v) simplex) ++
        "Centroide: " ++ formatarPonto centro ++ "\n"

-- Função principal
main :: IO ()
main = do
    -- Otimização no espaço 2D  
    -- Inicializa o simplex com 3 pontos
    let inicial2D = [[0,0], [1,0], [0,1]]
        resultados2D = nelderMead esfera2D inicial2D 1.0 2.0 1e-5 100
    exportarResultados "resultados2d.txt" resultados2D
    putStrLn "Resultados 2D exportados para resultados2d.txt"

    -- Otimização no espaço 3D
    -- Inicializa o simplex com 4 pontos
    let inicial3D = [[0,0,0], [1,0,0], [0,1,0], [0,0,1]]
        resultados3D = nelderMead esfera3D inicial3D 1.0 2.0 1e-5 100
    exportarResultados "resultados3d.txt" resultados3D
    putStrLn "Resultados 3D exportados para resultados3d.txt"

-- Implementação local da função intercalate 
intercalar :: [a] -> [[a]] -> [a]
intercalar _ [] = []
intercalar _ [x] = x
intercalar s (x:xs) = x ++ s ++ intercalar s xs