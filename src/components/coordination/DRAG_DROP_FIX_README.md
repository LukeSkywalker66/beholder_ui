# Fix para Drag & Drop en ImprovedCoordinationGrid

## Problema Original

El usuario no podía mover una Orden de Trabajo (OT) 15 minutos hacia adelante en el mismo equipo. Cuando arrastraba la OT sobre sí misma, el evento `onDrop` NO se disparaba.

### Causa Raíz

- **`opacity-0` solo oculta visualmente**: El elemento seguía presente en el DOM y en el flujo de eventos del navegador
- **Colisión consigo mismo**: El navegador detectaba que estabas dropeando sobre la misma OT visual
- **Evento bloqueado**: El evento `onDrop` del slot NO se disparaba cuando el cursor estaba sobre la OT original

## Solución Implementada: Opción 1 (Recomendada)

### Remover OT del DOM durante drag usando `display: none`

```javascript
const handleDragStart = (e, workOrder) => {
  setDraggedItem(workOrder);
  draggedElementRef.current = e.target;
  
  // CRITICAL: Use display:none instead of opacity-0
  // This removes the element from the browser's event flow
  e.target.style.display = 'none';
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify(workOrder));
};

const handleDragEnd = (e) => {
  // Restore display to original state
  if (draggedElementRef.current) {
    draggedElementRef.current.style.display = '';
  }
  
  setDraggedItem(null);
  draggedElementRef.current = null;
};
```

### Por qué funciona

1. **`display: none` remueve completamente el elemento del flujo de renderizado**
   - A diferencia de `opacity: 0`, que solo lo hace invisible
   - El navegador NO considera el elemento para eventos de mouse/touch
   
2. **Los slots siempre reciben el evento `onDrop`**
   - Sin importar si la OT estaba en esa posición antes
   - Permite mover 15 minutos adelante/atrás en el mismo equipo

3. **La validación de colisiones sigue funcionando**
   - Se usa `isSameWorkOrder()` para excluir la OT siendo movida
   - Previene colisiones con otras OTs

## Alternativas Consideradas

### Opción 2: Ignorar colisión consigo misma en drag

**Problema**: No resuelve el problema raíz de que `onDrop` no se dispara

```javascript
// NO resuelve el problema - onDrop nunca se llama
const handleDrop = (e, equipment, slotTime) => {
  if (isSameWorkOrder(draggedItem, currentWO)) {
    // Esto nunca se ejecuta porque onDrop no se dispara
    allowDrop();
  }
};
```

### Opción 3: Usar `pointer-events: none`

**Problema**: Menos preciso y puede afectar otros comportamientos

```javascript
// Funciona pero menos elegante
const handleDragStart = (e, workOrder) => {
  // Afecta todos los elementos hijos también
  containerRef.current.style.pointerEvents = 'none';
};
```

## Características del Grid

- **Equipos**: Múltiples equipos en filas
- **Turnos**: Mañana (08:00-13:00) y Tarde (13:00-19:00)
- **Granularidad**: 5 minutos (permite ajustes precisos)
- **Validación**: Automática de colisiones excluyendo la misma OT
- **Drag & Drop**: Ahora permite mover OT sobre sí misma

## Testing

Para verificar el fix:

1. Crear una OT en un slot
2. Intentar moverla 15 minutos adelante en el mismo equipo
3. Verificar que el `onDrop` se dispara correctamente
4. Confirmar que el PATCH request se envía al backend

## Logs Esperados

```
Work order moved successfully: {
  id: "123",
  from: { equipment: "EQ-01", time: "2024-01-01T08:00:00Z" },
  to: { equipment: "EQ-01", time: "2024-01-01T08:15:00Z" }
}
```

## Conclusión

La solución implementada es **simple, efectiva y no invasiva**:
- Solo modifica el estilo durante el drag
- No afecta la lógica de validación existente
- Resuelve completamente el problema del evento `onDrop`
- Permite el caso de uso requerido: mover OT 15 min sobre sí misma
