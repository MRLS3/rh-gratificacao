import jsPDF from 'jspdf';
import { valorPorExtenso, formatarMoeda } from './utils';

export interface GratificacaoRecibo {
  ref: string;
  funcionarioNome: string;
  valor: number;
  discriminacao?: string;
  observacao?: string;
  dataExtenso: string; // "Salvador, 24 de março de 2026"
}

// A4: 210 x 297 mm — 4 linhas × 2 colunas = 8 recibos por folha
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 7;
const COLS   = 2;
const ROWS   = 4;
const SLIP_W = (PAGE_W - MARGIN * 3) / COLS;  // ~97.5mm
const SLIP_H = (PAGE_H - MARGIN * 5) / ROWS;  // ~62mm

export async function gerarPDFGratificacoes(recibos: GratificacaoRecibo[]): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  // Monta lista de slips — principal + discriminação (se houver)
  const slips: Array<GratificacaoRecibo & { tipo: 'principal' | 'discriminacao' }> = [];
  for (const r of recibos) {
    slips.push({ ...r, tipo: 'principal' });
    if (r.discriminacao) {
      slips.push({ ...r, tipo: 'discriminacao' });
    }
  }

  slips.forEach((slip, idx) => {
    if (idx > 0 && idx % (COLS * ROWS) === 0) doc.addPage();
    const pos = idx % (COLS * ROWS);
    const col = pos % COLS;
    const row = Math.floor(pos / COLS);
    const x = MARGIN + col * (SLIP_W + MARGIN);
    const y = MARGIN + row * (SLIP_H + MARGIN);
    drawSlip(doc, slip, x, y, SLIP_W, SLIP_H);
  });

  doc.save(`gratificacoes_${recibos[0]?.ref?.replace('/', '-') ?? 'lote'}.pdf`);
}

function drawSlip(
  doc: jsPDF,
  slip: GratificacaoRecibo & { tipo: string },
  x: number, y: number, w: number, h: number
) {
  const isDisco = slip.tipo === 'discriminacao';
  const px = x + 3;   // padding horizontal interno
  const lw = w - 6;   // largura útil do conteúdo

  // ── Borda externa ────────────────────────────────────────────
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.6);
  doc.rect(x, y, w, h);

  // ── Cabeçalho ────────────────────────────────────────────────
  const headerH = 11;
  doc.setFillColor(232, 232, 232);
  doc.rect(x, y, w, headerH, 'F');
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(x, y + headerH, x + w, y + headerH);

  // Título GRATIFICAÇÃO
  const titleW = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('GRATIFICAÇÃO', x + 3, y + 7.5);

  // Divisor título | Ref
  doc.setLineWidth(0.4);
  doc.line(x + titleW, y, x + titleW, y + headerH);

  // Ref
  const refW = 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('Ref', x + titleW + 2.5, y + 4.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(slip.ref, x + titleW + 2.5, y + 9);

  // Divisor Ref | Valor
  doc.line(x + titleW + refW, y, x + titleW + refW, y + headerH);

  // Valor
  const vx = x + titleW + refW + 2.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('VALOR', vx, y + 4.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(formatarMoeda(slip.valor), vx, y + 9);

  // ── Corpo ────────────────────────────────────────────────────
  let cy = y + headerH + 2;
  doc.setTextColor(20, 20, 20);

  if (!isDisco) {
    // ── Valor — label pequeno + extenso em itálico ─────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text('Valor', px, cy + 3.8);

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    const extenso = valorPorExtenso(slip.valor);
    const extensoLines = doc.splitTextToSize(extenso, lw - 14);
    doc.text(extensoLines, px + 13, cy + 3.8);

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    const extensoH = Math.max(6.5, extensoLines.length * 4.8);
    doc.line(px, cy + extensoH, px + lw, cy + extensoH);
    cy += extensoH + 2.5;

    // ── Observação opcional ────────────────────────────────────
    if (slip.observacao) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const obsLines = doc.splitTextToSize(slip.observacao, lw);
      doc.text(obsLines, px, cy + 3.5);
      const obsH = 5 + (obsLines.length - 1) * 4.2;
      doc.setDrawColor(180, 180, 180);
      doc.line(px, cy + obsH, px + lw, cy + obsH);
      cy += obsH + 2.5;
    }

    // ── Nome em negrito itálico ────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text('Nome', px, cy + 4);

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(slip.funcionarioNome, px + 13, cy + 4);

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(px, cy + 7, px + lw, cy + 7);
    cy += 10;

    // ── Data ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(slip.dataExtenso, px, cy + 3.5);
    cy += 8;

    // ── Assinatura ─────────────────────────────────────────────
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.35);
    doc.line(px, cy, px + lw, cy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('Assinatura', px, cy + 4);

  } else {
    // ── Slip de Discriminação ─────────────────────────────────
    // Retângulo branco com borda, ocupando todo o corpo do slip
    const bodyY = y + headerH + 2;
    const bodyH = h - headerH - 4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.35);
    doc.rect(px, bodyY, lw, bodyH - 6, 'FD');

    // Label "Discriminação"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Discriminação:', px + 2, bodyY + 5.5);

    // Conteúdo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const discoLines = doc.splitTextToSize(slip.discriminacao ?? '', lw - 4);
    doc.text(discoLines, px + 2, bodyY + 11);

    // Assinatura na base do retângulo
    const sigY = bodyY + bodyH - 14;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(px + 2, sigY, px + lw - 2, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('Assinatura', px + 2, sigY + 4.5);
  }
}
