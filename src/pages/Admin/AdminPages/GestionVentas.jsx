import React, { useState, useEffect } from 'react';
import { Table, Spin, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GestionVentas = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transacciones');
        const data = (response.data.data || []).map(t => {
          let sucursal = t.sucursal || 'Sucursal desconocida';
          return {
            id: t.id_transaccion,
            fecha: t.fecha_transaccion,
            cliente: t.run_cliente,
            monto: t.monto,
            estado: t.estado || 'Completado',
            sucursal,
            metodo_pago: t.metodo_pago || '',
            descripcion: t.descripcion || '',
          };
        });
        setTransacciones(data);
      } catch (error) {
        console.error('Error al cargar las transacciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransacciones();
  }, []);

  // Formatear fecha a español
  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const dateObj = new Date(fecha);
    return dateObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generar PDF
  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text('Informe de Ventas', 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Fecha', 'Rut Cliente', 'Monto', 'Estado', 'Sucursal', 'Método de Pago', 'Detalle']],
      body: transacciones.map(t => [
        t.id,
        formatFecha(t.fecha),
        t.cliente,
        `$${Number(t.monto).toLocaleString()}`,
        t.estado,
        t.sucursal,
        t.metodo_pago,
        t.descripcion
      ]),
    });
    doc.save('informe_ventas.pdf');
  };

  const columnas = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => formatFecha(fecha),
    },
    {
      title: 'Rut Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto) => `$${Number(monto).toLocaleString()}`,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
    },
    {
      title: 'Detalle',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Informes de Ventas</h1>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={generarPDF}
        >
          Generar PDF
        </Button>
      </div>
      {loading ? (
        <Spin tip="Cargando transacciones..." />
      ) : (
        <Table
          dataSource={transacciones}
          columns={columnas}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default GestionVentas;