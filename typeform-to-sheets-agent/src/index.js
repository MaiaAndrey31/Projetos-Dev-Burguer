require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para log de requisições
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    // Log do corpo da requisição (exceto para arquivos grandes)
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Corpo da requisição:', JSON.stringify(req.body, null, 2));
    }
    
    // Capturar a resposta original para poder logar o status
    const originalSend = res.send;
    res.send = function(body) {
        const responseTime = Date.now() - start;
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
        return originalSend.call(this, body);
    };
    
    next();
});

// Middleware para processar JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Helper function to get answer by ref
const getAnswer = (answers, ref) => {
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
};

// Webhook endpoint for Typeform
app.post('/webhook', async (req, res) => {
    console.log('Nova requisição recebida do Typeform');
    
    try {
        // Verificar se o corpo da requisição está presente
        if (!req.body || !req.body.form_response) {
            console.error('Formato de requisição inválido');
            return res.status(400).json({ error: 'Formato de requisição inválido' });
        }

        const formResponse = req.body.form_response;
        const answers = formResponse.answers || [];
        
        console.log(`Processando resposta do formulário ID: ${formResponse.form_id}`);
        console.log(`Número de respostas recebidas: ${answers.length}`);

        // Extrair dados do formulário
        const nome = getAnswer(answers, 'nome_completo');
        const cpf = getAnswer(answers, 'cpf');
        const email = getAnswer(answers, 'email');
        const linkedin = getAnswer(answers, 'linkedin');
        const telefone = getAnswer(answers, 'celular');
        const enderecoCompleto = getAnswer(answers, 'endereco');
        const bonus1 = getAnswer(answers, 'bonus1');
        const bonus2 = getAnswer(answers, 'bonus2');
        const turma = getAnswer(answers, 'turma');
        const idade = getAnswer(answers, 'idade');
        const projeto = getAnswer(answers, 'projeto');
        const comentario = getAnswer(answers, 'comentario');
        const observacao = getAnswer(answers, 'observacao');

        // Processar endereço estruturado
        let endereco = '';
        let cidade = '';
        let estado = '';
        let cep = '';

        console.log('Processando endereço:', enderecoCompleto);

        if (enderecoCompleto) {
            try {
                let enderecoObj;
                // Verificar se é uma string JSON
                if (typeof enderecoCompleto === 'string') {
                    try {
                        // Tentar fazer parse se for JSON
                        enderecoObj = JSON.parse(enderecoCompleto);
                        console.log('Endereço em formato JSON detectado');
                    } catch (e) {
                        // Se não for JSON, tratar como texto simples
                        console.log('Endereço não está em formato JSON, usando como texto simples');
                        endereco = enderecoCompleto;
                    }
                } else {
                    // Já é um objeto
                    enderecoObj = enderecoCompleto;
                }

                // Se temos um objeto de endereço, extrair os campos
                if (enderecoObj && typeof enderecoObj === 'object') {
                    // Mapear campos do Typeform para o formato esperado
                    // O Typeform pode retornar os campos com nomes diferentes
                    const addressMap = {
                        // Mapeamento para nomes de campos comuns do Typeform
                        endereco: ['address_line1', 'street', 'endereco', 'logradouro'],
                        numero: ['address_number', 'numero', 'number'],
                        complemento: ['address_line2', 'complemento', 'complement', 'apto'],
                        bairro: ['neighborhood', 'bairro', 'district'],
                        cidade: ['city', 'cidade', 'localidade'],
                        estado: ['state', 'uf', 'estado'],
                        cep: ['postal_code', 'zip_code', 'cep']
                    };

                    // Função auxiliar para encontrar o primeiro valor não vazio
                    const findFirstValue = (obj, keys) => {
                        for (const key of keys) {
                            if (obj[key] !== undefined && obj[key] !== '') {
                                return obj[key];
                            }
                        }
                        return '';
                    };

                    // Extrair valores
                    const enderecoRua = findFirstValue(enderecoObj, addressMap.endereco) || '';
                    const numero = findFirstValue(enderecoObj, addressMap.numero) || '';
                    const complemento = findFirstValue(enderecoObj, addressMap.complemento) || '';
                    const bairro = findFirstValue(enderecoObj, addressMap.bairro) || '';
                    
                    // Construir endereço completo
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

                console.log('Endereço processado:', { endereco, cidade, estado, cep });
                
            } catch (e) {
                console.error('Erro ao processar endereço:', e);
                // Em caso de erro, tenta salvar o que for possível
                endereco = typeof enderecoCompleto === 'string' 
                    ? enderecoCompleto 
                    : (enderecoCompleto?.address_line1 || JSON.stringify(enderecoCompleto));
            }
        }

        // Processar nome com OpenAI (opcional)
        let processedName = nome;
        if (nome && process.env.OPENAI_API_KEY) {
            try {
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'user',
                            content: `Formate este nome próprio corretamente: "${nome}". Apenas o nome formatado, sem aspas.`
                        }]
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                processedName = response.data.choices[0].message.content.trim();
            } catch (error) {
                console.error('Erro ao processar nome com OpenAI:', error.message);
            }
        }

        // Preparar dados para a planilha
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Página1!A2';

        // Garantir que os valores não sejam undefined
        const safeValue = (value) => value !== undefined ? value : '';

        const rowData = [
            safeValue(processedName),  // NOME
            safeValue(email),          // EMAIL
            safeValue(telefone),       // TELEFONE
            safeValue(cpf),            // CPF
            safeValue(endereco),       // ENDEREÇO
            safeValue(cidade),         // CIDADE
            safeValue(estado),         // ESTADO
            safeValue(cep),            // CEP
            '',                       // RASTREIO (vazio inicialmente)
            'Novo',                   // STATUS
            safeValue(bonus1 || bonus2 || '')  // BÔNUS ESCOLHIDO
        ];
        
        console.log('Dados a serem salvos na planilha:', rowData);

        // Adicionar à planilha do Google
        try {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [rowData]
                }
            });
            console.log('Dados salvos com sucesso no Google Sheets');
        } catch (error) {
            console.error('Erro ao salvar no Google Sheets:', error.message);
            throw error;
        }

        // Enviar notificação por WhatsApp (se configurado)
        if (telefone && process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_INSTANCE_ID) {
            const phoneNumber = telefone.startsWith('+') ? telefone : `+55${telefone.replace(/\D/g, '')}`;
            const whatsappUrl = `https://api.ultramsg.com/${process.env.WHATSAPP_INSTANCE_ID}/messages/chat`;
            const message = {
                token: process.env.WHATSAPP_API_KEY,
                to: phoneNumber,
                body: `Olá ${processedName || 'cliente'}, recebemos os seus dados 🎉\n\n` +
                      `Seu premio foi adicionado ao seu perfil no Dev Club.\n\n` +
                      `Parabéns pelo seu resultado!`
            };

            console.log(`Enviando WhatsApp para: ${phoneNumber} (${processedName || 'sem nome'})`);
            
            try {
                // Timeout de 10 segundos para a requisição
                const response = await axios({
                    method: 'post',
                    url: whatsappUrl,
                    data: message,
                    timeout: 10000, // 10 segundos de timeout
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                if (response.data.sent) {
                    console.log('✅ Notificação por WhatsApp enviada com sucesso');
                    console.log(`📱 ID da mensagem: ${response.data.id}`);
                } else {
                    console.warn('⚠️ WhatsApp: Resposta inesperada da API:', response.data);
                }
            } catch (error) {
                console.error('❌ Erro ao enviar WhatsApp:');
                if (error.response) {
                    // Erro da resposta do servidor
                    console.error(`- Status: ${error.response.status}`);
                    console.error(`- Dados:`, error.response.data);
                } else if (error.request) {
                    // A requisição foi feita mas não houve resposta
                    console.error('- Não foi possível se conectar ao servidor do WhatsApp');
                    console.error(`- Timeout: ${error.code === 'ECONNABORTED' ? 'Sim' : 'Não'}`);
                } else {
                    // Erro ao configurar a requisição
                    console.error('- Erro:', error.message);
                }
                
                // Log detalhado do erro para depuração
                console.error('Detalhes do erro:', {
                    url: whatsappUrl,
                    telefone: phoneNumber,
                    error: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        } else {
            console.warn('⚠️ WhatsApp não enviado: configurações ausentes');
            if (!telefone) console.warn('   - Número de telefone não fornecido');
            if (!process.env.WHATSAPP_API_KEY) console.warn('   - WHATSAPP_API_KEY não configurada');
            if (!process.env.WHATSAPP_INSTANCE_ID) console.warn('   - WHATSAPP_INSTANCE_ID não configurado');
        }

        res.status(200).send('Dados processados com sucesso');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Erro ao processar os dados');
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Verificar conexão com o Google Sheets
        if (process.env.GOOGLE_SHEET_ID) {
            const sheets = google.sheets({ version: 'v4', auth });
            await sheets.spreadsheets.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                fields: 'properties/title',
            });
        }
        
        // Verificar se as variáveis de ambiente necessárias estão definidas
        const requiredEnvVars = ['GOOGLE_SHEET_ID'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.warn(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
            return res.status(200).json({
                status: 'warning',
                message: 'Servidor funcionando, mas algumas configurações estão faltando',
                missingVariables: missingVars,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        }
        
        res.status(200).json({
            status: 'ok',
            message: 'Servidor funcionando corretamente',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            services: {
                googleSheets: process.env.GOOGLE_SHEET_ID ? 'configurado' : 'não configurado',
                whatsapp: process.env.WHATSAPP_API_KEY ? 'configurado' : 'não configurado',
                openai: process.env.OPENAI_API_KEY ? 'configurado' : 'não configurado'
            }
        });
    } catch (error) {
        console.error('Erro no health check:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar a saúde do serviço',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
