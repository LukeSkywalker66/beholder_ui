import React, { useState } from 'react';
import ImprovedCoordinationGrid from './ImprovedCoordinationGrid';

/**
 * Example usage of ImprovedCoordinationGrid with drag & drop fix
 * This demonstrates how the component handles moving work orders
 */

const CoordinationGridExample = () => {
  // Sample equipment data
  const equipments = [
    { id: 'EQ-01', name: 'Camioneta 1' },
    { id: 'EQ-02', name: 'Camioneta 2' },
    { id: 'EQ-03', name: 'Camioneta 3' },
  ];

  // Sample work orders
  const [workOrders, setWorkOrders] = useState([
    {
      id: '001',
      equipment: 'EQ-01',
      startTime: new Date('2024-01-01T08:00:00').toISOString(),
      endTime: new Date('2024-01-01T08:15:00').toISOString(),
      description: 'Instalación fibra óptica',
    },
    {
      id: '002',
      equipment: 'EQ-01',
      startTime: new Date('2024-01-01T09:00:00').toISOString(),
      endTime: new Date('2024-01-01T09:30:00').toISOString(),
      description: 'Reparación router',
    },
    {
      id: '003',
      equipment: 'EQ-02',
      startTime: new Date('2024-01-01T13:00:00').toISOString(),
      endTime: new Date('2024-01-01T13:45:00').toISOString(),
      description: 'Mantenimiento preventivo',
    },
  ]);

  // Handler for work order updates
  const handleUpdateWorkOrder = (updatedWO) => {
    console.log('Updating work order:', updatedWO);
    
    // Update state with new work order
    setWorkOrders(prevOrders =>
      prevOrders.map(wo =>
        wo.id === updatedWO.id ? updatedWO : wo
      )
    );

    // Here you would typically make a PATCH request to the backend
    // Example:
    // fetch(`/api/work-orders/${updatedWO.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedWO)
    // })
    //   .then(response => response.json())
    //   .then(data => console.log('Work order updated on server:', data))
    //   .catch(error => console.error('Error updating work order:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 bg-green-50 border border-green-200 rounded p-4">
        <h2 className="text-lg font-bold mb-2">✅ Drag & Drop Fix Implementado</h2>
        <p className="text-sm">
          Este componente usa <code className="bg-gray-100 px-1 rounded">display: none</code> durante
          el drag para resolver el problema de drop sobre la misma posición.
        </p>
      </div>

      <ImprovedCoordinationGrid
        workOrders={workOrders}
        equipments={equipments}
        onUpdateWorkOrder={handleUpdateWorkOrder}
      />

      {/* Debug panel */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
        <h3 className="font-semibold mb-2">Estado Actual de OTs:</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(workOrders, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CoordinationGridExample;
