// server.js

// --- 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- 2. MIDDLEWARES ---
// Habilita o CORS para permitir requisições do front-end
app.use(cors()); 
// Habilita o parsing de JSON no corpo das requisições
app.use(express.json());

// --- 3. FUNÇÕES DE INTEGRAÇÃO (BOA PRÁTICA) ---
// Cada função tem uma única responsabilidade: integrar com um serviço.

const addToActiveCampaign = async (name, email) => {
  const data = { contact: { email, firstName: name } };
  const headers = { 'Api-Token': process.env.AC_API_KEY };
  await axios.post(`${process.env.AC_API_URL}/api/3/contacts`, data, { headers });
  console.log(`Lead [${email}] adicionado ao ActiveCampaign.`);
};

const addToDevzapp = async (name) => {
  // ATENÇÃO: Esta função é um exemplo. Você precisará de um campo de telefone no formulário.
  // E deverá ajustar a URL e os dados conforme a documentação oficial do Devzapp.
  const data = { name, phone: "5548999999999" }; // Telefone viria do formulário
  const headers = { 'Authorization': `Bearer ${process.env.DEVZAPP_API_KEY}` };
  await axios.post(`https://api.exemplo.devzapp.com/groups/${process.env.DEVZAPP_GROUP_ID}/users`, data, { headers });
  console.log(`Lead [${name}] adicionado ao Devzapp.`);
};

const addToManyChat = async (name, email) => {
  const data = { first_name: name, email, "custom_fields": { "fonte_de_cadastro": "LP Flora 10K" } };
  const headers = { 'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}` };
  await axios.post('https://api.manychat.com/fb/subscriber/createSubscriber', data, { headers });
  console.log(`Lead [${email}] adicionado ao ManyChat.`);
};


// --- 4. ENDPOINT PRINCIPAL DA API ---
// Este é o URL que o nosso front-end irá chamar.

app.post('/api/subscribe', async (req, res) => {
  const { name, email } = req.body;

  // Validação de segurança no servidor
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Nome e e-mail são obrigatórios.' });
  }

  console.log(`Recebido novo lead: ${name} <${email}>. A iniciar integrações...`);

  try {
    // Usamos Promise.allSettled para executar todas as integrações em paralelo.
    // Ele não para se uma delas falhar, o que é ótimo para garantir que o lead entre
    // nos outros sistemas mesmo que um esteja com problemas.
    const results = await Promise.allSettled([
      addToActiveCampaign(name, email),
      // addToDevzapp(name), // Descomente quando tiver o campo de telefone
      addToManyChat(name, email)
    ]);

    // Opcional: verificar os resultados
    results.forEach(result => {
        if (result.status === 'rejected') {
            console.error('Uma integração falhou:', result.reason.message);
        }
    });
    
    res.status(200).json({ success: true, message: 'Inscrição realizada e integrações iniciadas com sucesso!' });

  } catch (error) {
    console.error('Erro geral no processo de inscrição:', error);
    res.status(500).json({ success: false, message: 'Ocorreu um erro inesperado no servidor.' });
  }
});


// --- 5. INICIAR O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor back-end a correr em http://localhost:${PORT}`);
});