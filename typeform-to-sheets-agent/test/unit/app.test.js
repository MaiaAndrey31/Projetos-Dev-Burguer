import { formatName } from '../../src/utils/helpers.js';

describe('Formatação de Nomes', () => {
  test('Deve formatar nome completo corretamente', () => {
    expect(formatName('joão da silva')).toBe('João da Silva');
    expect(formatName('MARIA APARECIDA')).toBe('Maria Aparecida');
  });

  test('Deve lidar com strings vazias', () => {
    expect(formatName('')).toBe('');
    expect(formatName(null)).toBe('');
    expect(formatName(undefined)).toBe('');
  });
});

describe('Validação de CPF', () => {
  test('Deve validar CPF corretamente', () => {
    // Adicione testes de validação de CPF aqui
    expect(true).toBe(true);
  });
});
