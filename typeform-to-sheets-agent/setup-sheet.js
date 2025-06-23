import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

async function setupGoogleSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        if (!spreadsheetId) {
            throw new Error('GOOGLE_SHEET_ID not found in .env file');
        }

        // Define as colunas da planilha
        const headers = [
            'DATA',
            'NOME',
            'EMAIL',
            'TELEFONE',
            'CPF',
            'ENDEREÇO',
            'CIDADE',
            'ESTADO',
            'CEP',
            'RASTREIO',
            'STATUS',
            'BÔNUS ESCOLHIDO',
            'LINKEDIN',
            'IDADE',
            'PROJETO',
            'COMENTÁRIOS',
            'OBSERVAÇÕES',
            'DATA DE CRIAÇÃO',
            'ORIGEM'
        ];

        // Update the sheet with headers
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Respostas!A1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [headers]
            }
        });

        // Formatar o cabeçalho e a planilha
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    // Formatar cabeçalho
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 0,
                                endRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: headers.length
                            },
                            cell: {
                                userEnteredFormat: {
                                    textFormat: { 
                                        bold: true,
                                        fontSize: 11
                                    },
                                    backgroundColor: {
                                        red: 0.2,
                                        green: 0.4,
                                        blue: 0.8
                                    },
                                    horizontalAlignment: 'CENTER',
                                    verticalAlignment: 'MIDDLE',
                                    wrapStrategy: 'WRAP',
                                    textFormat: {
                                        foregroundColor: { red: 1, green: 1, blue: 1 },
                                        bold: true
                                    }
                                }
                            },
                            fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy)'
                        }
                    },
                    // Congelar linha do cabeçalho
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId: 0,
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            },
                            fields: 'gridProperties.frozenRowCount'
                        }
                    },
                    // Ajustar largura das colunas
                    {
                        updateDimensionProperties: {
                            range: {
                                sheetId: 0,
                                dimension: 'COLUMNS',
                                startIndex: 0,
                                endIndex: headers.length
                            },
                            properties: {
                                pixelSize: 150
                            },
                            fields: 'pixelSize'
                        }
                    },
                    // Formatar coluna de data
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    numberFormat: {
                                        type: 'DATE',
                                        pattern: 'dd/mm/yyyy HH:MM:SS'
                                    }
                                }
                            },
                            fields: 'userEnteredFormat.numberFormat'
                        }
                    },
                    // Adicionar filtro
                    {
                        setBasicFilter: {
                            filter: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: headers.length
                                }
                            }
                        }
                    }
                ]
            }
        });

        console.log('✅ Google Sheet has been set up successfully!');
        console.log(`🔗 https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    } catch (error) {
        console.error('Error setting up Google Sheet:', error.message);
        process.exit(1);
    }
}

// Run the setup
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupGoogleSheet().catch(console.error);
}
