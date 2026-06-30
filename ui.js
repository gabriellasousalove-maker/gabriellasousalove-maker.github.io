// ui.js

import { tenantData } from "./tenants.js";
import { ownerData } from "./owners.js";
import {
  generateTenantReceiptHTML,
  generateOwnerReceiptHTML,
} from "./receipt-generator.js";

// LISTA DE MESES MOVIDA PARA CÁ PARA SER USADA GLOBALMENTE
const nomeMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// --- NOVAS FUNÇÕES DE FORMATAÇÃO DE MOEDA ---

/**
 * Converte um valor de string formatada (ex: "R$ 1.234,56") para um número (ex: 1234.56)
 * @param {string} value - A string formatada.
 * @returns {number}
 */
function unformatCurrency(value) {
  if (!value || typeof value !== "string") return 0;
  const numericString = value.replace(/[R$\s.]/g, "").replace(",", ".");
  return parseFloat(numericString) || 0;
}

/**
 * Converte um número para uma string de moeda formatada (ex: R$ 1.234,56)
 * @param {number} number - O número a ser formatado.
 * @returns {string}
 */
function formatNumberToCurrency(number) {
  if (typeof number !== "number" || isNaN(number) || number === 0) {
    return "";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

/**
 * Manipulador de evento para formatar o input em tempo real enquanto o usuário digita.
 * @param {Event} event
 */
function handleCurrencyInput(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, "");

  if (value === "") {
    input.value = "";
    return;
  }
  const numericValue = parseInt(value, 10) / 100;
  input.value = formatNumberToCurrency(numericValue);
}

export function initializeUI() {
  // --- SELETORES DE ELEMENTOS ---
  const choiceContainer = document.getElementById("choice-container");
  const tenantFormContainer = document.getElementById("tenant-form-container");
  const ownerFormContainer = document.getElementById("owner-form-container");
  const receiptOutput = document.getElementById("receipt-output");
  
  // --- LÓGICA DE TÍTULO DINÂMICO ---
  const originalTitle = document.title;
  window.addEventListener('afterprint', () => {
    document.title = originalTitle;
  });

  // --- FUNÇÕES DE INTERAÇÃO ---
  function showReceipt(html) {
    const activeForm = !tenantFormContainer.classList.contains("hidden")
      ? tenantFormContainer
      : ownerFormContainer;
    const loadingAnimation = document.getElementById("loading-animation");

    activeForm.classList.add("hidden");
    loadingAnimation.classList.remove("hidden");

    setTimeout(() => {
      loadingAnimation.classList.add("hidden");
      document.getElementById("recibo-content").innerHTML = html;
      receiptOutput.classList.remove("hidden");
    }, 1000);
  }

  function setupCheckboxToggle(checkId, targetId) {
    const checkbox = document.getElementById(checkId);
    const target = document.getElementById(targetId);
    checkbox.addEventListener("change", function () {
      target.classList.toggle("hidden", !this.checked);
      if (!this.checked) {
        const input = target.querySelector("input") || target;
        if (input) input.value = "";
      }
    });
  }

  // --- EVENT LISTENERS ---

  const currencyFields = document.querySelectorAll(".currency-input");
  currencyFields.forEach((field) => {
    field.addEventListener("input", handleCurrencyInput);
  });

  document
    .getElementById("btn-tenant-receipt")
    .addEventListener("click", () => {
      choiceContainer.classList.add("hidden");
      tenantFormContainer.classList.remove("hidden");
    });

  document.getElementById("btn-owner-receipt").addEventListener("click", () => {
    choiceContainer.classList.add("hidden");
    ownerFormContainer.classList.remove("hidden");
  });

  // Autofill do formulário do Inquilino
  const tenantInput = document.getElementById("tenant-inquilino-input");
  const tenantMonthInput = document.getElementById("tenant-mes-referencia");

  function populateTenantForm(tenantName) {
    const data = tenantData[tenantName];
    const fieldsToClear = [
      "endereco-imovel", "valor-aluguel", "valor-condominio", "desconto-pontualidade",
      "valor-agua", "valor-iptu", "encargos-extra", "compensacao-desc", "compensacao-valor",
    ];

    if (data) {
      document.getElementById("tenant-endereco-imovel").value = data.endereco || "";
      document.getElementById("tenant-valor-aluguel").value = formatNumberToCurrency(data.aluguel);
      document.getElementById("tenant-valor-condominio").value = formatNumberToCurrency(data.condominio);
      document.getElementById("tenant-desconto-pontualidade").value = formatNumberToCurrency(data.desconto);
      document.getElementById("tenant-valor-agua").value = formatNumberToCurrency(data.agua);
      document.getElementById("tenant-valor-iptu").value = formatNumberToCurrency(data.iptu);
      document.getElementById("tenant-encargos-extra").value = formatNumberToCurrency(data.encargos);
      document.getElementById("tenant-compensacao-desc").value = data.compensacaoDesc || "";
      document.getElementById("tenant-compensacao-valor").value = formatNumberToCurrency(data.compensacaoValor);

      const mesReferencia = tenantMonthInput.value;
      if (mesReferencia && data.vencimentoDia) {
        const diaVencimento = String(data.vencimentoDia).padStart(2, "0");
        document.getElementById("tenant-data-vencimento").value = `${mesReferencia}-${diaVencimento}`;
      }
    } else {
      fieldsToClear.forEach((field) => {
        document.getElementById(`tenant-${field}`).value = "";
      });
      document.getElementById("tenant-data-vencimento").value = "";
    }
  }
  tenantInput.addEventListener("input", (e) => populateTenantForm(e.target.value));
  tenantMonthInput.addEventListener("change", () => populateTenantForm(tenantInput.value));

  // Autofill do formulário do Proprietário
  const ownerInput = document.getElementById("owner-proprietario-input");
  function populateOwnerForm(ownerName) {
    const data = ownerData[ownerName];
    const fieldsToClear = [
      "repasse-nome", "dados-repasse", "endereco-imovel", "valor-aluguel", "valor-condominio",
      "desconto-pontualidade", "valor-agua", "valor-iptu", "compensacao-desc", "compensacao-valor",
    ];

    if (data) {
      document.getElementById("owner-repasse-nome").value = data.repasseNome || "";
      document.getElementById("owner-dados-repasse").value = data.dadosRepasse || "";
      document.getElementById("owner-endereco-imovel").value = data.endereco || "";
      document.getElementById("owner-valor-aluguel").value = formatNumberToCurrency(data.aluguel);
      document.getElementById("owner-valor-condominio").value = formatNumberToCurrency(data.condominio);
      document.getElementById("owner-desconto-pontualidade").value = formatNumberToCurrency(data.desconto);
      document.getElementById("owner-valor-agua").value = formatNumberToCurrency(data.agua);
      document.getElementById("owner-valor-iptu").value = formatNumberToCurrency(data.iptu);
      document.getElementById("owner-compensacao-desc").value = data.compensacaoDesc || "";
      document.getElementById("owner-compensacao-valor").value = formatNumberToCurrency(data.compensacaoValor);
    } else {
      fieldsToClear.forEach((field) => {
        document.getElementById(`owner-${field}`).value = "";
      });
    }
  }
  ownerInput.addEventListener("input", (e) => populateOwnerForm(e.target.value));

  setupCheckboxToggle("tenant-add-juros", "tenant-valor-juros");
  setupCheckboxToggle("owner-add-juros", "owner-valor-juros");
  setupCheckboxToggle("owner-primeiro-aluguel", "owner-corretagem-reais-group");

  // Submissão dos formulários
  document.getElementById("tenant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = {
      inquilinoNome: document.getElementById("tenant-inquilino-input").value,
      corretorCreci: document.getElementById("corretor-creci").value,
      enderecoImovel: document.getElementById("tenant-endereco-imovel").value,
      mesReferenciaInput: document.getElementById("tenant-mes-referencia").value,
      dataVencimentoInput: document.getElementById("tenant-data-vencimento").value,
      dataDocumentoInput: document.getElementById("tenant-data-documento").value,
      valorAluguel: unformatCurrency(document.getElementById("tenant-valor-aluguel").value),
      valorCondominio: unformatCurrency(document.getElementById("tenant-valor-condominio").value),
      valorIptu: unformatCurrency(document.getElementById("tenant-valor-iptu").value),
      valorAgua: unformatCurrency(document.getElementById("tenant-valor-agua").value),
      valorJuros: unformatCurrency(document.getElementById("tenant-valor-juros").value),
      descontoPontualidade: unformatCurrency(document.getElementById("tenant-desconto-pontualidade").value),
      encargosExtra: unformatCurrency(document.getElementById("tenant-encargos-extra").value),
      compensacaoDesc: document.getElementById("tenant-compensacao-desc").value,
      compensacaoValor: unformatCurrency(document.getElementById("tenant-compensacao-valor").value),
      condoOp: document.querySelector('input[name="tenant-condo-op"]:checked').value,
      iptuOp: document.querySelector('input[name="tenant-iptu-op"]:checked').value,
      aguaOp: document.querySelector('input[name="tenant-agua-op"]:checked').value,
      compensacaoOp: document.querySelector('input[name="tenant-compensacao-op"]:checked').value,
    };
    
    // --- LÓGICA DE NOME DE ARQUIVO ---
    const [anoRef, mesRef] = formData.mesReferenciaInput.split("-");
    const mesPorExtenso = nomeMeses[parseInt(mesRef) - 1];
    const dataParaArquivo = formData.dataDocumentoInput.replace(/-/g, "");
    const newTitle = `${dataParaArquivo}_Recibo de Aluguel - ${mesPorExtenso} - ${formData.inquilinoNome}`;
    document.title = newTitle;
    
    const reciboHTML = generateTenantReceiptHTML(formData);
    showReceipt(reciboHTML);
  });

  document.getElementById("owner-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = {
      proprietarioNome: document.getElementById("owner-proprietario-input").value,
      repasseNome: document.getElementById("owner-repasse-nome").value,
      dadosRepasse: document.getElementById("owner-dados-repasse").value,
      enderecoImovel: document.getElementById("owner-endereco-imovel").value,
      mesReferenciaInput: document.getElementById("owner-mes-referencia").value,
      dataDocumentoInput: document.getElementById("owner-data-documento").value,
      valorAluguel: unformatCurrency(document.getElementById("owner-valor-aluguel").value),
      descontoPontualidade: unformatCurrency(document.getElementById("owner-desconto-pontualidade").value),
      valorCondominio: unformatCurrency(document.getElementById("owner-valor-condominio").value),
      valorIptu: unformatCurrency(document.getElementById("owner-valor-iptu").value),
      valorAgua: unformatCurrency(document.getElementById("owner-valor-agua").value),
      valorJuros: unformatCurrency(document.getElementById("owner-valor-juros").value),
      compensacaoDesc: document.getElementById("owner-compensacao-desc").value,
      compensacaoValor: unformatCurrency(document.getElementById("owner-compensacao-valor").value),
      isPrimeiroAluguel: document.getElementById("owner-primeiro-aluguel").checked,
      valorCorretagemReais: unformatCurrency(document.getElementById("owner-corretagem-reais").value),
      condoOp: document.querySelector('input[name="owner-condo-op"]:checked').value,
      iptuOp: document.querySelector('input[name="owner-iptu-op"]:checked').value,
      aguaOp: document.querySelector('input[name="owner-agua-op"]:checked').value,
      compensacaoOp: document.querySelector('input[name="owner-compensacao-op"]:checked').value,
    };
    
    // --- LÓGICA DE NOME DE ARQUIVO ---
    const [anoRef, mesRef] = formData.mesReferenciaInput.split("-");
    const mesPorExtenso = nomeMeses[parseInt(mesRef) - 1];
    const dataParaArquivo = formData.dataDocumentoInput.replace(/-/g, "");
    const newTitle = `${dataParaArquivo}_Recibo e Repasse de Aluguel - ${mesPorExtenso} - ${formData.proprietarioNome}`;
    document.title = newTitle;
    
    const reciboHTML = generateOwnerReceiptHTML(formData);
    showReceipt(reciboHTML);
  });

  // Datas padrão
  function setDefaultDates() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const monthFormat = `${year}-${month}`;
    const dateFormat = `${year}-${month}-${day}`;

    document.getElementById("tenant-mes-referencia").value = monthFormat;
    document.getElementById("tenant-data-documento").value = dateFormat;
    document.getElementById("owner-mes-referencia").value = monthFormat;
    document.getElementById("owner-data-documento").value = dateFormat;
  }
  setDefaultDates();
}