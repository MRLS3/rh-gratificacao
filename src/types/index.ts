export interface Permissoes {
  emitir_gratificacoes: boolean;
  ver_historico: boolean;
  cadastrar_funcionarios: boolean;
  baixar_pdf: boolean;
  excluir_historico: boolean;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'operador';
  ativo: boolean;
  permissoes: Permissoes;
  created_at: string;
  updated_at: string;
}

export interface Funcionario {
  id: string;
  apelido: string;
  nome_completo: string;
  chave_pix?: string;
  telefone?: string;
  ferias_inicio?: string;
  ferias_fim?: string;
  ativo: boolean;
  criado_em: string;
}

export interface Gratificacao {
  id: string;
  ref_mes_ano: string;
  funcionario_id: string;
  funcionarios?: Funcionario;
  valor: number;
  valor_extenso: string;
  discriminacao?: string;
  observacao?: string;
  data_emissao: string;
  cidade: string;
  emitido_por?: string;
  profiles?: Profile;
  pdf_gerado: boolean;
  created_at: string;
}