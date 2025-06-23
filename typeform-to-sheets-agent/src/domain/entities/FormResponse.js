export class FormResponse {
  constructor({
    formId,
    submittedAt,
    answers = [],
    processedName = '',
    address = {},
    bonus = {},
    contact = {}
  }) {
    this.formId = formId;
    this.submittedAt = submittedAt || new Date().toISOString();
    this.answers = answers;
    this.processedName = processedName;
    this.address = address;
    this.bonus = bonus;
    this.contact = contact;
  }

  getAnswer(ref) {
    const answer = this.answers.find(a => a.field.ref === ref);
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

  extractContactInfo() {
    this.contact = {
      name: this.getAnswer('nome_completo'),
      email: this.getAnswer('email'),
      phone: this.getAnswer('celular'),
      cpf: this.getAnswer('cpf'),
      linkedin: this.getAnswer('linkedin')
    };
    return this.contact;
  }

  extractAddress() {
    const addressRaw = this.getAnswer('endereco');
    
    if (!addressRaw) {
      this.address = {};
      return this.address;
    }

    try {
      // Tenta fazer parse se for JSON
      const addressObj = typeof addressRaw === 'string' ? JSON.parse(addressRaw) : addressRaw;
      
      if (typeof addressObj === 'object') {
        const addressMap = {
          street: ['address_line1', 'street', 'endereco', 'logradouro'],
          number: ['address_number', 'numero', 'number'],
          complement: ['address_line2', 'complemento', 'complement', 'apto'],
          neighborhood: ['neighborhood', 'bairro', 'district'],
          city: ['city', 'cidade', 'localidade'],
          state: ['state', 'uf', 'estado'],
          zipCode: ['postal_code', 'zip_code', 'cep']
        };

        const findFirstValue = (obj, keys) => {
          for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== '') {
              return obj[key];
            }
          }
          return '';
        };

        const street = findFirstValue(addressObj, addressMap.street);
        const number = findFirstValue(addressObj, addressMap.number);
        const complement = findFirstValue(addressObj, addressMap.complement);
        const neighborhood = findFirstValue(addressObj, addressMap.neighborhood);
        
        this.address = {
          street,
          number,
          complement,
          neighborhood,
          city: findFirstValue(addressObj, addressMap.city),
          state: findFirstValue(addressObj, addressMap.state),
          zipCode: findFirstValue(addressObj, addressMap.zipCode),
          fullAddress: [
            street,
            number ? `, ${number}` : '',
            complement ? `, ${complement}` : '',
            neighborhood ? ` - ${neighborhood}` : ''
          ].filter(Boolean).join('')
        };
      } else {
        this.address = { fullAddress: addressRaw };
      }
    } catch (e) {
      this.address = { fullAddress: typeof addressRaw === 'string' ? addressRaw : JSON.stringify(addressRaw) };
    }

    return this.address;
  }

  extractBonus() {
    this.bonus = {
      bonus1: this.getAnswer('bonus1'),
      bonus2: this.getAnswer('bonus2')
    };
    return this.bonus;
  }

  toSpreadsheetRow() {
    this.extractContactInfo();
    this.extractAddress();
    this.extractBonus();

    return [
      this.processedName || this.contact.name,
      this.contact.email,
      this.contact.phone,
      this.contact.cpf,
      this.address.fullAddress,
      this.address.city,
      this.address.state,
      this.address.zipCode,
      '', // RASTREIO
      'Novo', // STATUS
      this.bonus.bonus1 || this.bonus.bonus2 || '' // BÔNUS ESCOLHIDO
    ];
  }
}


