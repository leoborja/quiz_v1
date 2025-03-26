require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/quiz-beneficios', express.static('quiz-beneficios'));
app.use(express.json());

// Rota para processar o lead e enviar para o Manychat
app.post('/api/lead', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Formata o telefone para o padrão internacional
    const formattedPhone = phone.replace(/\D/g, '');
    const whatsappPhone = `55${formattedPhone}`; // Formato específico para WhatsApp (sem +)

    // Envia o lead para o Manychat
    const response = await axios.post('https://api.manychat.com/fb/subscriber/createSubscriber', {
      first_name: name,
      whatsapp_phone: whatsappPhone,
      has_opt_in_sms: true,
      has_opt_in_email: false,
      consent_phrase: "Aceito receber comunicações via WhatsApp"
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Adiciona a tag ao subscriber
    if (response.data && response.data.data && response.data.data.id) {
      const subscriberId = response.data.data.id;
      
      await axios.post('https://api.manychat.com/fb/subscriber/addTagByName', {
        subscriber_id: subscriberId,
        tag_name: "form-beneficios"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Resposta do Manychat:', response.data);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Erro ao processar lead:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Erro ao processar lead', 
      details: error.response?.data || error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 