import React, { useRef } from 'react';
import { Container, Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function InformesDesempeño() {
  const metrics = [
    { label: 'Ventas totales', value: '$12,500' },
    { label: 'Productos vendidos', value: '1,230' },
    { label: 'Clientes nuevos', value: '85' },
    { label: 'Margen de ganancia', value: '32%' },
  ];

  // Datos de ejemplo para los gráficos
  const ventasMensuales = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas ($)',
        data: [2000, 2500, 1800, 3000, 2200, 3000],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const productosVendidos = {
    labels: ['Herramientas', 'Tornillos', 'Fijaciones', 'Medición'],
    datasets: [
      {
        label: 'Productos',
        data: [400, 300, 200, 330],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  const reportRef = useRef();

  // Exportar a PDF
  const exportPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('informe-desempeno.pdf');
  };

  // Exportar a Excel
  const exportExcel = () => {
    // Resumen de métricas
    const wsData = [
      ['Métrica', 'Valor'],
      ...metrics.map(m => [m.label, m.value]),
      [],
      ['Ventas mensuales'],
      ['Mes', 'Ventas ($)'],
      ...ventasMensuales.labels.map((mes, i) => [mes, ventasMensuales.datasets[0].data[i]]),
      [],
      ['Productos vendidos por categoría'],
      ['Categoría', 'Cantidad'],
      ...productosVendidos.labels.map((cat, i) => [cat, productosVendidos.datasets[0].data[i]])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
    XLSX.writeFile(wb, 'informe-desempeno.xlsx');
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Informes de Desempeño</h2>
      <div className="mb-3 d-flex gap-2">
        <Button variant="outline-primary" onClick={exportPDF}>Exportar PDF</Button>
        <Button variant="outline-success" onClick={exportExcel}>Exportar Excel</Button>
      </div>
      <div ref={reportRef}>
        <Row className="mb-4">
          {metrics.map((m, idx) => (
            <Col md={3} key={idx}>
              <Card className="mb-3 text-center">
                <Card.Body>
                  <Card.Title>{m.label}</Card.Title>
                  <Card.Text className="fs-4 fw-bold">{m.value}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Ventas mensuales</Card.Title>
                <Bar data={ventasMensuales} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Productos vendidos por categoría</Card.Title>
                <Pie data={productosVendidos} options={{ responsive: true }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}

export default InformesDesempeño;
