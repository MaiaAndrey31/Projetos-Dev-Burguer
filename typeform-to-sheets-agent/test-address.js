// Função auxiliar para simular a função getAnswer do index.js
function getAnswer(answers, ref) {
    const answer = answers.find(a => a.field.ref === ref);
    if (!answer) return '';
    
    switch (answer.type) {
        case 'text':
        case 'short_text':
            return answer.text || '';
        case 'email':
            return answer.email || '';
        case 'phone_number':
            return answer.phone_number || '';
        case 'choice':
            return answer.choice?.label || '';
        case 'choices':
            return answer.choices?.labels?.join(', ') || '';
        case 'date':
            return answer.date || '';
        case 'boolean':
            return answer.boolean ? 'Sim' : 'Não';
        case 'number':
            return answer.number?.toString() || '';
        default:
            return '';
    }
}

// Função de teste para processar endereço
async function testAddressProcessing() {
    console.log('\n=== INÍCIO DOS TESTES DE ENDEREÇO ===\n');

    // Teste 1: Endereço em formato JSON
    const test1 = {
        form_response: {
            answers: [
                {
                    field: { ref: 'endereco' },
                    type: 'text',
                    text: JSON.stringify({
                        address_line1: 'Rua das Flores',
                        address_number: '123',
                        complemento: 'Apto 101',
                        bairro: 'Centro',
                        city: 'São Paulo',
                        state: 'SP',
                        cep: '01001-000'
                    })
                }
            ]
        }
    };
    testAddress('Teste 1: Endereço em JSON', test1.form_response.answers);

    // Teste 2: Endereço em objeto direto (sem ser string JSON)
    const test2 = {
        form_response: {
            answers: [
                {
                    field: { ref: 'endereco' },
                    type: 'text',
                    text: {
                        street: 'Avenida Paulista',
                        numero: '1000',
                        complemento: 'Sala 10',
                        bairro: 'Bela Vista',
                        cidade: 'São Paulo',
                        uf: 'SP',
                        cep: '01310-100'
                    }
                }
            ]
        }
    };
    testAddress('Teste 2: Endereço em objeto direto', test2.form_response.answers);

    // Teste 3: Endereço em texto simples
    const test3 = {
        form_response: {
            answers: [
                {
                    field: { ref: 'endereco' },
                    type: 'text',
                    text: 'Rua das Palmeiras, 456, Jardim América, Rio de Janeiro - RJ, 20000-000'
                }
            ]
        }
    };
    testAddress('Teste 3: Endereço em texto simples', test3.form_response.answers);
}

function testAddress(testName, answers) {
    console.log(`\n${testName}`);
    console.log('='.repeat(testName.length));
    
    const enderecoCompleto = getAnswer(answers, 'endereco');
    console.log('Endereço recebido:', JSON.stringify(enderecoCompleto, null, 2));
    
    // Processar endereço (mesma lógica do código principal)
    let endereco = '';
    let cidade = '';
    let estado = '';
    let cep = '';

    if (enderecoCompleto) {
        try {
            let enderecoObj;
            if (typeof enderecoCompleto === 'string') {
                try {
                    enderecoObj = JSON.parse(enderecoCompleto);
                    console.log('✅ Endereço em formato JSON detectado');
                } catch (e) {
                    console.log('ℹ️ Endereço não está em formato JSON, usando como texto simples');
                    endereco = enderecoCompleto;
                }
            } else {
                enderecoObj = enderecoCompleto;
            }

            if (enderecoObj && typeof enderecoObj === 'object') {
                const addressMap = {
                    endereco: ['address_line1', 'street', 'endereco', 'logradouro'],
                    numero: ['address_number', 'numero', 'number'],
                    complemento: ['address_line2', 'complemento', 'complement', 'apto'],
                    bairro: ['neighborhood', 'bairro', 'district'],
                    cidade: ['city', 'cidade', 'localidade'],
                    estado: ['state', 'uf', 'estado'],
                    cep: ['postal_code', 'zip_code', 'cep']
                };

                const findFirstValue = (obj, keys) => {
                    for (const key of keys) {
                        if (obj[key] !== undefined && obj[key] !== '') {
                            return obj[key];
                        }
                    }
                    return '';
                };

                const enderecoRua = findFirstValue(enderecoObj, addressMap.endereco) || '';
                const numero = findFirstValue(enderecoObj, addressMap.numero) || '';
                const complemento = findFirstValue(enderecoObj, addressMap.complemento) || '';
                const bairro = findFirstValue(enderecoObj, addressMap.bairro) || '';
                
                const enderecoParts = [
                    enderecoRua,
                    numero ? `, ${numero}` : '',
                    complemento ? `, ${complemento}` : '',
                    bairro ? ` - ${bairro}` : ''
                ].filter(Boolean);
                
                endereco = enderecoParts.join('');
                cidade = findFirstValue(enderecoObj, addressMap.cidade) || '';
                estado = findFirstValue(enderecoObj, addressMap.estado) || '';
                cep = findFirstValue(enderecoObj, addressMap.cep) || '';
            }

            console.log('\n🔍 Resultado do processamento:');
            console.log('Endereço:', endereco);
            console.log('Cidade:', cidade);
            console.log('Estado:', estado);
            console.log('CEP:', cep);
            
        } catch (e) {
            console.error('❌ Erro ao processar endereço:', e);
        }
    }
    
    console.log('\n' + '-'.repeat(50));
}

// Executar os testes
if (require.main === module) {
    console.log('Iniciando testes de processamento de endereço...\n');
    testAddressProcessing()
        .then(() => console.log('\n✅ Testes concluídos!'))
        .catch(err => console.error('❌ Erro nos testes:', err));
}
