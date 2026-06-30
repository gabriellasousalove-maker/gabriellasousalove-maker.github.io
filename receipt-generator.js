// receipt-generator.js

const nomeMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatNegative = (value) => `-${formatCurrency(Math.abs(value))}`;

// --- FUNÇÕES DE CONSTRUÇÃO DE PARTES DO RECIBO ---
function buildHeader(creci) {
  return `<header class="recibo-header"><div class="header-left"><h2>Recibo de Aluguel</h2></div><div class="header-right"><img src="logo.svg" alt="Logo" class="header-logo"></div></header>`;
}

function buildFooter(corretorNome) {
  return `<footer class="recibo-footer">
  <div class="footer-contact">
    <span>(11) 92007-2265 | (11) 96111-1115  - </span>
    <span>aconteceonline@outlook.com</span>
  </div>
  <div class="footer-realtor"><span>${corretorNome}</span><br></div></footer>`;
}

// --- GERADOR DE RECIBO DO INQUILINO ---
export function generateTenantReceiptHTML(data) {
  let valorTotal =
    data.valorAluguel -
    data.descontoPontualidade +
    data.encargosExtra +
    data.valorJuros;
  if (data.valorCondominio > 0)
    valorTotal +=
      data.condoOp === "add" ? data.valorCondominio : -data.valorCondominio;
  if (data.valorIptu > 0)
    valorTotal += data.iptuOp === "add" ? data.valorIptu : -data.valorIptu;
  if (data.valorAgua > 0)
    valorTotal += data.aguaOp === "add" ? data.valorAgua : -data.valorAgua;
  if (data.compensacaoValor > 0)
    valorTotal += data.compensacaoOp === "add" ? data.compensacaoValor : -data.compensacaoValor;

  const [anoRef, mesRef] = data.mesReferenciaInput.split("-");
  const mesReferenciaFormatado = nomeMeses[parseInt(mesRef) - 1];
  const dataVencimento = new Date(
    data.dataVencimentoInput + "T12:00:00"
  ).toLocaleDateString("pt-BR");
  const dataDocumento = new Date(data.dataDocumentoInput + "T12:00:00");
  const dataExtenso = `Barueri SP, ${String(dataDocumento.getDate()).padStart(
    2,
    "0"
  )} de ${
    nomeMeses[dataDocumento.getMonth()]
  } de ${dataDocumento.getFullYear()}`;

  return `
        ${buildHeader(data.corretorCreci)}
        <div class="recibo-body" ">
            <div class="date-line">${dataExtenso}</div>
            <p>Recebi do(a) sr(a). <strong>${
              data.inquilinoNome
            }</strong>, o valor do aluguel com vencimento em <strong>${dataVencimento}</strong>.</p>
            <p>Dando plena, total e irrevogável quitação do mês de <strong>${mesReferenciaFormatado}</strong> e demais encargos contratuais descritos abaixo, referente imóvel situado à:</p>
            <div class="address">
              <img src="adress.png" alt="Icon adress" class="adress-icon">
              ${data.enderecoImovel}
            </div>
            <div class="value-table">
                <div class="row"><span>Valor aluguel:</span><span>${formatCurrency(
                  data.valorAluguel
                )}</span></div>
                ${
                  data.valorCondominio > 0
                    ? `<div class="row"><span>
                      Valor Condomínio:</span><span class="${
                        data.condoOp === "subtract" ? "negative" : ""
                      }">${
                        data.condoOp === "subtract"
                          ? formatNegative(data.valorCondominio)
                          : formatCurrency(data.valorCondominio)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorIptu > 0
                    ? `<div class="row"><span> 
                      IPTU:</span><span class="${
                        data.iptuOp === "subtract" ? "negative" : ""
                      }">${
                        data.iptuOp === "subtract"
                          ? formatNegative(data.valorIptu)
                          : formatCurrency(data.valorIptu)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorAgua > 0
                    ? `<div class="row"><span>
                      Consumo de Água:</span><span class="${
                        data.aguaOp === "subtract" ? "negative" : ""
                      }">${
                        data.aguaOp === "subtract"
                          ? formatNegative(data.valorAgua)
                          : formatCurrency(data.valorAgua)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorJuros > 0
                    ? `<div class="row"><span>Juros e Multa:</span><span>${formatCurrency(
                        data.valorJuros
                      )}</span></div>`
                    : ""
                }
                ${
                  data.descontoPontualidade > 0
                    ? `<div class="row"><span>Desconto de Pontualidade:</span><span class="negative">${formatNegative(
                        data.descontoPontualidade
                      )}</span></div>`
                    : ""
                }
                ${
                  data.compensacaoValor > 0
                    ? `<div class="row"><span>${
                        data.compensacaoDesc || "Compensação Extra"
                      }:</span><span class="${
                        data.compensacaoOp === "subtract" ? "negative" : ""
                      }">${data.compensacaoOp === "subtract"
                          ? formatNegative(data.compensacaoValor)
                          : formatCurrency(data.compensacaoValor)
                      }</span></div>`
                    : ""
                }
                ${
                  data.encargosExtra > 0
                    ? `<div class="row"><span>Outros Encargos:</span><span>${formatCurrency(
                        data.encargosExtra
                      )}</span></div>`
                    : ""
                }
                <div class="row total"><span>Total Geral:</span><span><strong>${formatCurrency(
                  valorTotal
                )}</strong></span></div>
            </div>
            <div class="space">
            </div>
        </div>
        ${buildFooter("Sávio Costa", data.corretorCreci)}
    `;
}

// --- GERADOR DE RECIBO DO PROPRIETÁRIO ---
export function generateOwnerReceiptHTML(data) {
  let totalPagoInquilino =
    data.valorAluguel -
    data.descontoPontualidade +
    data.valorJuros;
  if (data.valorCondominio > 0)
    totalPagoInquilino +=
      data.condoOp === "add" ? data.valorCondominio : -data.valorCondominio;
  if (data.valorIptu > 0)
    totalPagoInquilino +=
      data.iptuOp === "add" ? data.valorIptu : -data.valorIptu;
  if (data.valorAgua > 0)
    totalPagoInquilino +=
      data.aguaOp === "add" ? data.valorAgua : -data.valorAgua;
  if (data.compensacaoValor > 0)
    totalPagoInquilino +=
      data.compensacaoOp === "add" ? data.compensacaoValor : -data.compensacaoValor;

  let valorCorretagem = 0;
  let corretagemHtml = "";

  if (data.isPrimeiroAluguel) {
    valorCorretagem = data.valorCorretagemReais;
    corretagemHtml = `<div class="row"><span>Corretagem (Taxa Fixa):</span><span class="negative">${formatNegative(
      valorCorretagem
    )}</span></div>`;
  } else {
    const baseCalculoCorretagem = data.valorAluguel - data.descontoPontualidade;
    valorCorretagem = baseCalculoCorretagem * 0.1;
    corretagemHtml = `
            <div class="row"><span>Despesas corretagem:</span>
            <span>(base ${formatCurrency( baseCalculoCorretagem )})</span></div>
            <div class="row"><span>Corretagem 10%:</span><span class="negative">${formatNegative(
              valorCorretagem
            )}</span></div>
        `;
  }

  const valorRepasse = totalPagoInquilino - valorCorretagem;
  const [anoRef, mesRef] = data.mesReferenciaInput.split("-");
  const mesReferenciaFormatado = nomeMeses[parseInt(mesRef) - 1];
  const dataDocumento = new Date(data.dataDocumentoInput + "T12:00:00");
  const dataExtenso = `Barueri SP, ${String(dataDocumento.getDate()).padStart(
    2,
    "0"
  )} de ${
    nomeMeses[dataDocumento.getMonth()]
  } de ${dataDocumento.getFullYear()}`;

  return `
        ${buildHeader("")}
        <div class="recibo-body">
            <div class="date-line">${dataExtenso}</div>
            <h2 class="title">Recibo e Repasse de Aluguel</h2>
            <p>Enviado ao sr(a). <strong>${
              data.proprietarioNome
            }</strong> o valor referente ao mês de <strong>${mesReferenciaFormatado}</strong>, dando plena, total e irrevogável quitação de aluguel e demais encargos contratuais escritos abaixo, referente imóvel situado à:</p>
            <div class="address">
              <img src="adress.png" alt="Icon adress" class="adress-icon">
              ${data.enderecoImovel}
            </div>
            <div class="value-table">
                <div class="row"><span>Valor aluguel:</span><span>${formatCurrency(
                  data.valorAluguel
                )}</span></div>
                ${
                  data.valorCondominio > 0
                    ? `<div class="row">
                      <span>Valor Condomínio:</span><span class="${
                        data.condoOp === "subtract" ? "negative" : ""
                      }">${
                        data.condoOp === "subtract"
                          ? formatNegative(data.valorCondominio)
                          : formatCurrency(data.valorCondominio)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorIptu > 0
                    ? `<div class="row"><span>
                      IPTU:</span><span class="${
                        data.iptuOp === "subtract" ? "negative" : ""
                      }">${
                        data.iptuOp === "subtract"
                          ? formatNegative(data.valorIptu)
                          : formatCurrency(data.valorIptu)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorAgua > 0
                    ? `<div class="row"><span>
                      Consumo de Água:</span><span class="${
                        data.aguaOp === "subtract" ? "negative" : ""
                      }">${
                        data.aguaOp === "subtract"
                          ? formatNegative(data.valorAgua)
                          : formatCurrency(data.valorAgua)
                      }</span></div>`
                    : ""
                }
                ${
                  data.valorJuros > 0
                    ? `<div class="row"><span>Juros e Multa:</span><span>${formatCurrency(
                        data.valorJuros
                      )}</span></div>`
                    : ""
                }
                ${
                  data.descontoPontualidade > 0
                    ? `<div class="row"><span>Desconto de Pontualidade:</span><span class="negative">${formatNegative(
                        data.descontoPontualidade
                      )}</span></div>`
                    : ""
                }
                ${
                  data.compensacaoValor > 0
                    ? `<div class="row"><span>${
                        data.compensacaoDesc || "Compensação Extra"
                      }:</span><span class="${
                        data.compensacaoOp === "subtract" ? "negative" : ""
                      }">${data.compensacaoOp === "subtract"
                          ? formatNegative(data.compensacaoValor)
                          : formatCurrency(data.compensacaoValor)
                      }</span></div>`
                    : ""
                }
                <div class="row total"><span>Total Recebido:</span><span><strong>${formatCurrency(
                  totalPagoInquilino
                )}</span></div>
            </div>
            <div class="value-table">
                ${corretagemHtml}
            </div>
            <div class="value-table">
                <div class="row"><span>Pagamento repasse para:</span><strong>${
                  data.repasseNome
                }</strong></div>
                <div class="row total"><span>Valor de Repasse:</span><strong>${formatCurrency(
                  valorRepasse
                )}</strong></div>
                <div class="row"><span class="payment-methods">
                  (&nbsp;&nbsp;) Boleto &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  (&nbsp;&nbsp;) Transferência Bancária &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  ( X )  PIX &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  (&nbsp;&nbsp;)  Cartão de Crédito
                </span></div>
                <div class="row"><span>Dados do Pagamento:</span><strong>${
                  data.dadosRepasse
                }</strong></div>
            </div>
            <div class="space">
            </div>
        </div>
        ${buildFooter("Sávio Costa")}
    `;
}
