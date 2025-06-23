require('dotenv').config();
const axios = require('axios');

// Dados de exemplo que simulam um envio do Typeform
const testData = {
    "event_id": "L3ftfCaXV7pQAPZrqGJVHm",
    "event_type": "form_response",
    "form_response": {
        "form_id": "lT4Z7j7e",
        "token": "a1b2c3d4e5f6g7h8i9j0",
        "submitted_at": new Date().toISOString(),
        "landed_at": new Date(Date.now() - 5000).toISOString(),
        "calculated": {
            "score": 0
        },
        "definition": {
            "id": "lT4Z7j7e",
            "title": "Formulário de Inscrição",
            "fields": [
                {
                    "id": "nome_completo",
                    "ref": "nome_completo",
                    "type": "short_text",
                    "title": "Nome Completo"
                },
                {
                    "id": "email",
                    "ref": "email",
                    "type": "email",
                    "title": "E-mail"
                },
                {
                    "id": "celular",
                    "ref": "celular",
                    "type": "phone_number",
                    "title": "Celular"
                },
                {
                    "id": "cpf",
                    "ref": "cpf",
                    "type": "short_text",
                    "title": "CPF"
                },
                {
                    "id": "endereco",
                    "ref": "endereco",
                    "type": "short_text",
                    "title": "Endereço Completo"
                },
                {
                    "id": "bonus_escolhido",
                    "ref": "bonus_escolhido",
                    "type": "multiple_choice",
                    "title": "Bônus Escolhido"
                }
            ]
        },
        "answers": [
            {
                "type": "text",
                "text": "João da Silva",
                "field": {
                    "id": "nome_completo",
                    "type": "short_text",
                    "ref": "nome_completo"
                }
            },
            {
                "type": "email",
                "email": "joao@exemplo.com",
                "field": {
                    "id": "email",
                    "type": "email",
                    "ref": "email"
                }
            },
            {
                "type": "phone_number",
                "phone_number": "18997519440",
                "field": {
                    "id": "celular",
                    "type": "phone_number",
                    "ref": "celular"
                }
            },
            {
                "type": "text",
                "text": "123.456.789-00",
                "field": {
                    "id": "cpf",
                    "type": "short_text",
                    "ref": "cpf"
                }
            },
            {
                "type": "text",
                "text": JSON.stringify({
                    "address_line1": "Rua Exemplo, 123",
                    "address_line2": "Apto 101",
                    "city": "São Paulo",
                    "state": "SP",
                    "postal_code": "01234-567",
                    "country": "Brasil"
                }),
                "field": {
                    "id": "endereco",
                    "type": "short_text",
                    "ref": "endereco"
                }
            },
            {
                "type": "choice",
                "choice": {
                    "label": "Curso de JavaScript"
                },
                "field": {
                    "id": "bonus_escolhido",
                    "type": "multiple_choice",
                    "ref": "bonus_escolhido"
                }
            }
        ]
    }
};

async function testWebhook() {
    try {
        const url = process.env.TEST_WEBHOOK_URL || 'http://localhost:3000/webhook';
        
        console.log(`Enviando requisição de teste para: ${url}`);
        
        const response = await axios.post(url, testData, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Typeform-Webhooks',
                'Typeform-Signature': process.env.TYPEFORM_WEBHOOK_SECRET ? 
                    `t=${Math.floor(Date.now() / 1000)},v1=${require('crypto')
                        .createHmac('sha256', process.env.TYPEFORM_WEBHOOK_SECRET)
                        .update(JSON.stringify(testData))
                        .digest('hex')}` : ''
            }
        });
        
        console.log('✅ Webhook testado com sucesso!');
        console.log('Status:', response.status);
        console.log('Resposta:', response.data);
    } catch (error) {
        console.error('❌ Erro ao testar webhook:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

// Executar o teste
if (require.main === module) {
    testWebhook();
}

module.exports = testWebhook;
