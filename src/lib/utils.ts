const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const dezenas  = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function centena(n: number): string {
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c) partes.push(centenas[c]);
  if (resto < 20) {
    if (unidades[resto]) partes.push(unidades[resto]);
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (dezenas[d]) partes.push(dezenas[d]);
    if (unidades[u]) partes.push(unidades[u]);
  }
  return partes.join(' e ');
}

function grupoExtenso(n: number): string {
  if (n === 0) return '';
  if (n < 1000) return centena(n);
  const mil = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (mil === 1) partes.push('mil');
  else partes.push(centena(mil) + ' mil');
  if (resto) partes.push(centena(resto));
  return partes.join(' e ');
}

export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor < 0) return '';
  if (valor === 0) return 'zero reais';

  const inteiro   = Math.floor(valor);
  const centavos  = Math.round((valor - inteiro) * 100);

  const partes: string[] = [];

  if (inteiro > 0) {
    const ext = grupoExtenso(inteiro);
    partes.push(ext + (inteiro === 1 ? ' real' : ' reais'));
  }

  if (centavos > 0) {
    const ext = centavos < 20
      ? unidades[centavos]
      : dezenas[Math.floor(centavos / 10)] + (centavos % 10 ? ' e ' + unidades[centavos % 10] : '');
    partes.push(ext + (centavos === 1 ? ' centavo' : ' centavos'));
  }

  return partes.join(' e ');
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseMoeda(str: string): number {
  const limpo = str.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(limpo) || 0;
}

const MESES = [
  '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export function formatarDataExtenso(ddmmaaaa: string, cidade = 'Salvador'): string {
  const d = ddmmaaaa.replace(/\D/g, '');
  if (d.length !== 8) return '';
  const dia = parseInt(d.substring(0, 2));
  const mes = parseInt(d.substring(2, 4));
  const ano = d.substring(4, 8);
  if (mes < 1 || mes > 12) return '';
  return `${cidade}, ${dia} de ${MESES[mes]} de ${ano}`;
}

export function formatarDataISO(ddmmaaaa: string): string {
  const d = ddmmaaaa.replace(/\D/g, '');
  if (d.length !== 8) return '';
  return `${d.substring(4, 8)}-${d.substring(2, 4)}-${d.substring(0, 2)}`;
}

export function maskData(raw: string): string {
  const d = raw.replace(/\D/g, '').substring(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.substring(0, 2) + '/' + d.substring(2);
  return d.substring(0, 2) + '/' + d.substring(2, 4) + '/' + d.substring(4);
}
