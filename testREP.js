const object = {
    type: 'P',
    customer: {
      legal_name: 'Dunder Mifflin',
      email: 'email@example.com',
      tax_id: 'ABC101010111',
      tax_system: '601',
      address: {
        zip: '85900'
      }
    },
    complements: [
      {
        type: 'pago',
        data: {
          payment_form: '28', // Tarjeta de Crédito
          related_documents: [
            {
              uuid: 'E55BDEC1-8F48-4BCF-842C-26AF9758375C',
              amount: 345.60,
              installment: 1,
              last_balance: 0,
              taxes: [
                {
                  base: 297.93,
                  type: 'IVA',
                  rate: 0.16
                }
              ]
            },
            {
              uuid: '30B37D89-BA5A-439C-A63D-0EE2147FA2FB',
              amount: 100.50,
              installment: 1,
              last_balance: 0,
              taxes: [
                {
                  base: 297.93,
                  type: 'IVA',
                  rate: 0.16
                }
              ]
            }
          ]
        }
      }
    ]
  };
  
  const totalFactura = object.complements?.reduce((total, complement) => {
    if (complement.data && complement.data.related_documents) {
      const relatedDocsTotal = complement.data.related_documents.reduce((sum, doc) => {
        return sum + (doc.amount || 0);
      }, 0);
      return total + relatedDocsTotal;
    }
    return total;
  }, 0) || 0;
  
  // Imprimo el total de la factura
  console.log(totalFactura);
  