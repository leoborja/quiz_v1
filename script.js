const redirectURL = "https://mcmpovos.com.br/go-us-p1-shein-de-graca-spa-alt/";
const deliveryURL = "https://mcmpovos.com.br/go-us-p1-shein-de-graca-spa-alt/";
let currentQuestionIndex = 0;
const answers = [];
let isSubmitting = false;

const quizConfig = {
  questions: [
    {
      question: "¿Ya recibiste productos gratis de Shein?",
      options: [
        { text: "No, ¡quiero saber más!" },
        { text: "Sí, ¡pero quiero recibir más productos!" }
      ]
    }
  ]
};

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function formatPhone(phone) {
  let formatted = phone.replace(/\D/g, '');
  formatted = formatted.replace(/^(\d{2})(\d)/g, '($1) $2');
  formatted = formatted.replace(/(\d)(\d{4})$/, '$1-$2');
  return formatted;
}

function updateProgress() {
  const progress = (currentQuestionIndex / quizConfig.questions.length) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
}

function renderQuestion() {
  updateProgress();
  const quizContainer = document.getElementById("quiz");
  quizContainer.innerHTML = "";
  const q = quizConfig.questions[currentQuestionIndex];
  const div = document.createElement("div");
  div.className = "question";
  div.innerHTML = `<p>${q.question}</p>`;
  const ul = document.createElement("ul");
  ul.className = "options";

  q.options.forEach((opt, i) => {
    const id = `q${currentQuestionIndex}-${i}`;
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="radio" name="question" id="${id}" />
      <label for="${id}">${opt.text}</label>`;
    li.querySelector("input").addEventListener("change", () => {
      if (opt.eliminatory) return redirectUser(false);
      answers[currentQuestionIndex] = { ...opt, question: currentQuestionIndex };
      redirectUser(true);
    });
    ul.appendChild(li);
  });

  div.appendChild(ul);
  quizContainer.appendChild(div);
}

function showUserInfo() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("user-info").style.display = "block";
  const btn = document.getElementById("submit");
  btn.style.display = "block";

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  phoneInput.addEventListener('input', (e) => e.target.value = formatPhone(e.target.value));

  function toggleButton() {
    btn.disabled = !(
      nameInput.value.trim() &&
      validatePhone(phoneInput.value.trim())
    );
  }

  [nameInput, phoneInput].forEach(input => input.addEventListener("input", toggleButton));
}

function redirectUser(success) {
  const params = new URLSearchParams(window.location.search);
  const queryString = params.toString();
  window.location.href = queryString ? `${redirectURL}?${queryString}` : redirectURL;
}


document.addEventListener("DOMContentLoaded", () => {
  renderQuestion();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !validatePhone(phone)) {
      console.log('[Validação] Dados incompletos. Não redirecionar.');
      isSubmitting = false;
      return;
    }

    isSubmitting = true;

    try {
      // Envia os dados para o backend
      const response = await fetch('https://responda.recomendador.com.br/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados');
      }

      // Dispara evento do Facebook Pixel
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'LeadConverted');
        console.log('[FB Pixel] Evento personalizado LeadConverted disparado');
      }

      // Redireciona o usuário
      redirectUser(true);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      isSubmitting = false;
      alert('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
    }
  };

  // Adiciona os event listeners para submit do form e click do botão
  document.getElementById("lead-form").addEventListener("submit", handleSubmit);
  document.getElementById("submit").addEventListener("click", handleSubmit);
}); 