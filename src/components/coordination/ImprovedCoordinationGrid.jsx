import React, { useState, useRef } from 'react';

/**
 * ImprovedCoordinationGrid Component
 * 
 * Displays a grid for coordinating work orders (OT) by equipment and shift.
 * Implements drag & drop functionality with a fix for moving OT 15 minutes
 * forward/backward on the same equipment.
 * 
 * Problem: Browser doesn't fire onDrop when dragging over the same visual element
 * Solution: Use display:none during drag to remove element from DOM event flow
 */

const ImprovedCoordinationGrid = ({ workOrders = [], equipments = [], onUpdateWorkOrder }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const draggedElementRef = useRef(null);

  // Helper function to check if two work orders are the same
  const isSameWorkOrder = (wo1, wo2) => {
    if (!wo1 || !wo2) return false;
    return wo1.id === wo2.id;
  };

  // Helper function to check for collisions, excluding the same work order
  const hasCollision = (equipment, startTime, endTime, excludeWO) => {
    return workOrders.some(wo => {
      if (isSameWorkOrder(wo, excludeWO)) return false; // Exclude self
      if (wo.equipment !== equipment) return false;
      
      // Check time overlap
      const woStart = new Date(wo.startTime);
      const woEnd = new Date(wo.endTime);
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      
      return (newStart < woEnd && newEnd > woStart);
    });
  };

  /**
   * Handle drag start - CRITICAL FIX
   * Using display:none instead of opacity-0 to remove element from DOM event flow
   * This allows the browser to fire onDrop events on the slot even when dragging
   * the OT over its own previous position
   */
  const handleDragStart = (e, workOrder) => {
    setDraggedItem(workOrder);
    
    // Store reference to the dragged element
    draggedElementRef.current = e.target;
    
    // CRITICAL: Use display:none instead of opacity-0
    // This removes the element from the browser's event flow
    // allowing drops on the same position
    e.target.style.display = 'none';
    
    // Set drag data for browser compatibility
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(workOrder));
  };

  /**
   * Handle drag end - restore visibility
   * Restores the element's display property after drag completes
   */
  const handleDragEnd = (e) => {
    // Restore display to original state
    if (draggedElementRef.current) {
      draggedElementRef.current.style.display = '';
    }
    
    // Clear dragged item state
    setDraggedItem(null);
    draggedElementRef.current = null;
  };

  /**
   * Handle drag over - required to allow drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Handle drop - process the work order move
   * Now this will fire even when dropping on the same equipment/time
   * because the OT element is hidden with display:none during drag
   */
  const handleDrop = (e, equipment, slotTime) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Calculate new time range (assuming 15-minute slots)
    const newStartTime = new Date(slotTime);
    const newEndTime = new Date(newStartTime.getTime() + 15 * 60 * 1000);
    
    // Check for collisions (excluding self)
    if (hasCollision(equipment, newStartTime, newEndTime, draggedItem)) {
      console.log('Collision detected: Cannot move OT', draggedItem.id, 'to', equipment, 
                  'at', newStartTime.toISOString(), '- another work order occupies this time slot');
      return;
    }
    
    // Update work order
    const updatedWO = {
      ...draggedItem,
      equipment,
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString()
    };
    
    // Call parent update handler
    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(updatedWO);
    }
    
    console.log('Work order moved successfully:', {
      id: draggedItem.id,
      from: { equipment: draggedItem.equipment, time: draggedItem.startTime },
      to: { equipment, time: newStartTime.toISOString() }
    });
  };

  // Generate time slots (5-minute granularity)
  const generateTimeSlots = (shiftStart, shiftEnd) => {
    const slots = [];
    const start = new Date(`2024-01-01 ${shiftStart}`);
    const end = new Date(`2024-01-01 ${shiftEnd}`);
    
    let current = new Date(start);
    while (current < end) {
      slots.push(new Date(current));
      current = new Date(current.getTime() + 5 * 60 * 1000); // 5 minutes
    }
    
    return slots;
  };

  // Shifts configuration
  const shifts = [
    { name: 'Mañana', start: '08:00', end: '13:00' },
    { name: 'Tarde', start: '13:00', end: '19:00' }
  ];

  return (
    <div className="coordination-grid">
      <h2 className="text-2xl font-bold mb-4">Coordinación de Trabajos</h2>
      
      {shifts.map(shift => (
        <div key={shift.name} className="shift-section mb-8">
          <h3 className="text-xl font-semibold mb-2">
            Turno {shift.name} ({shift.start} - {shift.end})
          </h3>
          
          <div className="grid-container overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">Equipo</th>
                  {generateTimeSlots(shift.start, shift.end).map((slot, idx) => (
                    <th 
                      key={idx} 
                      className="border border-gray-300 p-1 bg-gray-100 text-xs"
                    >
                      {slot.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipments.map(equipment => (
                  <tr key={equipment.id}>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                      {equipment.name}
                    </td>
                    {generateTimeSlots(shift.start, shift.end).map((slot, idx) => {
                      // Find work order for this slot
                      const wo = workOrders.find(w => {
                        if (w.equipment !== equipment.id) return false;
                        const woStart = new Date(w.startTime);
                        const woEnd = new Date(w.endTime);
                        return slot >= woStart && slot < woEnd;
                      });

                      return (
                        <td
                          key={idx}
                          className="border border-gray-300 p-1 min-w-[40px] h-16 relative"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, equipment.id, slot)}
                        >
                          {wo && (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, wo)}
                              onDragEnd={handleDragEnd}
                              className="work-order bg-blue-500 text-white p-1 rounded cursor-move text-xs absolute inset-0 flex items-center justify-center"
                              title={`OT ${wo.id} - ${wo.description}`}
                            >
                              OT-{wo.id}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold mb-2">Instrucciones:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Arrastra las OT para moverlas entre equipos y horarios</li>
          <li>Granularidad de 5 minutos permite ajustes precisos</li>
          <li>Puedes mover una OT 15 minutos adelante/atrás en el mismo equipo</li>
          <li>El sistema valida automáticamente las colisiones</li>
          <li>
            <strong>Fix implementado:</strong> Se usa <code>display: none</code> durante
            el drag para permitir drops sobre la misma posición
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImprovedCoordinationGrid;
