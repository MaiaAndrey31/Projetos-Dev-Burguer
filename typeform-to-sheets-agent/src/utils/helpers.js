/**
 * Formata um nome próprio com a primeira letra de cada palavra em maiúscula
 * @param {string} name - O nome a ser formatado
 * @returns {string} O nome formatado
 */
export function formatName(name = '') {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Valida um CPF (apenas formato, não verifica se é válido)
 * @param {string} cpf - O CPF a ser validado
 * @returns {boolean} Se o formato do CPF é válido
 */
export function validateCPF(cpf = '') {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos e não é uma sequência repetida
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  // Algoritmo de validação de CPF
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }
  
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return false;
  }
  
  sum = 0;
  
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }
  
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return false;
  }
  
  return true;
}

