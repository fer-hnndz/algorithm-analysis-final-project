// Se define una interfaz para representar los elementos seleccionados en la mochila, incluyendo su nombre, valor y peso.
export interface ElementoSeleccionado {
    nombre: string;
    valor: number;
    peso: number;
}

export interface SimulationResult {
    maximo_valor: number;
    elementos: ElementoSeleccionado[];
    espacio_vacio: number;
}

/**
 * ALGORITMO ACEPTADO POR LA COMUNIDAD 
 * Solución exacta para el problema de la Mochila 0/1 usando Programación Dinámica Bottom-Up.
 * Resuelve el problema de forma iterativa llenando una matriz para mantener una eficiencia de O(N * W).
**/
export function knapsack_01(W: number, valores: number[], pesos: number[], nombres: string[]) {
    // n representa la cantidad total de elementos disponibles para evaluar
    const n = valores.length;

    
    //1. Inicialización de la matriz DP llena de ceros.(Cubre el Casos Base (Fila 0 y Columna 0)
    const dp: number[][] = Array(n + 1)
        .fill(0)
        .map(() => Array(W + 1).fill(0));

    // 2. Construcción de la tabla de abajo hacia arriba (Ciclos for anidados)
    // El ciclo exterior 'i' controla los elementos disponibles (desde el primero hasta el 'n').
    for (let i = 1; i <= n; i++) {
        const pesoActual = pesos[i - 1];
        const valorActual = valores[i - 1];

        // El ciclo interior 'j' representa las capacidades de la mochila desde 0 hasta W,
        //  evaluando si el elemento actual puede ser incluido o no.
        for (let j = 1; j <= W; j++) {
            if (pesoActual <= j) {
                // Decisión entre incluir el elemento actual o no
                dp[i][j] = Math.max(
                    dp[i - 1][j],
                    dp[i - 1][j - pesoActual] + valorActual
                );
            } else {
                // Si el elemento no cabe, hereda el valor óptimo de la fila anterior
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    // 3. Reconstrucción de los elementos seleccionados (Backtracking)
    // Viajamos de regreso por la matriz para saber exactamente qué objetos se empacaron
    const seleccionados: ElementoSeleccionado[] = [];
    let wRestante = W;

    for (let i = n; i > 0; i--) {
        // Si el valor en la celda actual es diferente al de la fila de arriba,
        // significa que este elemento SÍ aportó valor y fue elegido.
        if (dp[i][wRestante] !== dp[i - 1][wRestante]) {
            seleccionados.push({
                nombre: nombres[i - 1],
                valor: valores[i - 1],
                peso: pesos[i - 1]
            });
            // Restamos el peso del objeto elegido para actualizar la 
            // capacidad disponible antes de evaluar la fila anterior
            wRestante -= pesos[i - 1]; 
        }
    }
    // Como la reconstrucción se hace del último hacia el primero, 
    // invertimos el arreglo para que mantenga el orden original de entrada.
    seleccionados.reverse();

    // Devolvemos el resultado final estructurado en un objeto
    return {
        maximo_valor: dp[n][W],
        elementos: seleccionados,
        espacio_vacio: wRestante // Para mostrar cuánto espacio quedó sin usar en la mochila
    };
}


export function greedy_knapsack_variant(W: number, valores: number[], pesos: number[], nombres: string[]) {
    const n = valores.length;
    // Creamos un arreglo de objetos que contenga el nombre, valor, peso y ratio valor/peso de cada elemento
    const elementos: any[] = [];
    for (let i = 0; i < n; i++) {
        elementos.push({ nombre: nombres[i], valor: valores[i], peso: pesos[i], ratio: valores[i] / pesos[i] // valor por unidad de peso para ordenanamiento
        });
    }
    // Ordenamos los elementos por su ratio valor/peso en orden descendente
    elementos.sort((a, b) => b.ratio - a.ratio);

    const seleccionados: ElementoSeleccionado[] = [];
    const no_seleccionados: any[] = [];
    let valorTotal = 0;
    let  wRestante = W;
    //ciclo greedy donde solo se van agregando los elementos 
    for (let i = 0; i < n; i++) {
        const elementoActual = elementos[i];
        if (elementoActual.peso <= wRestante) {
            seleccionados.push({nombre: elementoActual.nombre, valor: elementoActual.valor,peso: elementoActual.peso});
            valorTotal += elementoActual.valor;
            wRestante -= elementoActual.peso;
        }else if(seleccionados.length > 0){ 
            const ultimoAgregado = seleccionados[seleccionados.length - 1];
            const capacidadSimulada = wRestante + ultimoAgregado.peso; 
            if (elementoActual.valor > ultimoAgregado.valor && elementoActual.peso <= capacidadSimulada) {
                seleccionados.pop();
                valorTotal -= ultimoAgregado.valor;
                wRestante += ultimoAgregado.peso;
                seleccionados.push({nombre: elementoActual.nombre, valor: elementoActual.valor,peso: elementoActual.peso});
                valorTotal += elementoActual.valor;
                wRestante -= elementoActual.peso;
            }else{
                no_seleccionados.push(elementoActual);
            }
        }else{
            no_seleccionados.push(elementoActual);
        }       
    }
    //proceso de llenado de la mochila para evitar espacios vacios 
    if(wRestante > 0 && no_seleccionados.length > 0){
        no_seleccionados.sort((a, b) => a.valor - b.valor);
        for(let i = 0; i < no_seleccionados.length; i++){
            const no_seleccionado_Actual = no_seleccionados[i];
            if(no_seleccionado_Actual.peso <= wRestante){
                seleccionados.push({ nombre: no_seleccionado_Actual.nombre, valor: no_seleccionado_Actual.valor, peso: no_seleccionado_Actual.peso});
                valorTotal += no_seleccionado_Actual.valor;
                wRestante -= no_seleccionado_Actual.peso;
                }

                if(wRestante==0){
                    break; // Si la mochila ya está llena, salimos del ciclo
                }
            }
        }
    return {
        maximo_valor: valorTotal,
        elementos: seleccionados,
        espacio_vacio: wRestante // Para mostrar cuánto espacio quedó sin usar en la mochila
    };
}
