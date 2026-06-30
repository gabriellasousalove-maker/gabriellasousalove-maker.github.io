document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DE PREENCHIMENTO AUTOMÁTICO DE DATAS ---
    function setDefaultDates() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const monthFormat = `${year}-${month}`;
        const dateFormat = `${year}-${month}-${day}`;

        document.getElementById('tenant-mes-referencia').value = monthFormat;
        document.getElementById('tenant-data-documento').value = dateFormat;
        document.getElementById('owner-mes-referencia').value = monthFormat;
        document.getElementById('owner-data-documento').value = dateFormat;
    }
    setDefaultDates();

    // --- CONTROLE DA INTERFACE ---
    const choiceContainer = document.getElementById('choice-container');
    const tenantFormContainer = document.getElementById('tenant-form-container');
    const ownerFormContainer = document.getElementById('owner-form-container');
    const receiptOutput = document.getElementById('receipt-output');

    document.getElementById('btn-tenant-receipt').addEventListener('click', () => {
        choiceContainer.classList.add('hidden');
        tenantFormContainer.classList.remove('hidden');
    });

    document.getElementById('btn-owner-receipt').addEventListener('click', () => {
        choiceContainer.classList.add('hidden');
        ownerFormContainer.classList.remove('hidden');
    });
    
    const tenantInput = document.getElementById('tenant-inquilino-input');
    const tenantMonthInput = document.getElementById('tenant-mes-referencia');

    function populateTenantForm(tenantName) {
        const data = tenantData[tenantName];
        if (!data) return; // Se não encontrar o inquilino, não faz nada

        // Preenche os campos de texto e valores
        document.getElementById('tenant-endereco-imovel').value = data.endereco || '';
        document.getElementById('tenant-valor-aluguel').value = data.aluguel || '';
        document.getElementById('tenant-valor-condominio').value = data.condominio || '';
        document.getElementById('tenant-desconto-pontualidade').value = data.desconto || '';
        document.getElementById('tenant-valor-agua').value = data.agua || '';
        document.getElementById('tenant-valor-iptu').value = data.iptu || '';
        document.getElementById('tenant-encargos-extra').value = data.encargos || '';
        
        // Preenche a data de vencimento com base no mês de referência selecionado
        const mesReferencia = tenantMonthInput.value; // Pega o valor 'YYYY-MM'
        if (mesReferencia && data.vencimentoDia) {
            const diaVencimento = String(data.vencimentoDia).padStart(2, '0');
            document.getElementById('tenant-data-vencimento').value = `${mesReferencia}-${diaVencimento}`;
        }
    }

    // Adiciona os gatilhos para o preenchimento automático
    tenantInput.addEventListener('input', (e) => populateTenantForm(e.target.value));
    tenantMonthInput.addEventListener('change', () => populateTenantForm(tenantInput.value));


    // Base de dados e preenchimento para Proprietários (sem alterações)
    const ownerData = { "Rodrigo": { repasseNome: "SUZANA DE ALBUQUERQUE SANTOS", dadosRepasse: "PIX CPF-709.675.414-84", endereco: "Estrada das Pitas, 952, Apt 123 Torre C - Votupoca, Barueri/SP, CEP 06449-300." }, "Tânia": { repasseNome: "TÂNIA MARIA NERIS DOS SANTOS", dadosRepasse: "PIX Celular – (11) 9 6183-5377", endereco: "Avenida Presidente Kennedy nº 218, Casa 3 - Jardim Audir, CEP: 06433-040, Barueri/SP" } };
    const ownerInput = document.getElementById('owner-proprietario-input');
    ownerInput.addEventListener('input', function() {
        const ownerInfo = ownerData[this.value];
        if (ownerInfo) {
            document.getElementById('owner-repasse-nome').value = ownerInfo.repasseNome;
            document.getElementById('owner-dados-repasse').value = ownerInfo.dadosRepasse;
            document.getElementById('owner-endereco-imovel').value = ownerInfo.endereco;
        }
    });

    // --- CONTROLES DE EXIBIÇÃO DE CAMPOS ---
    function setupCheckboxToggle(checkId, targetId) {
        const checkbox = document.getElementById(checkId);
        const target = document.getElementById(targetId);
        checkbox.addEventListener('change', function() {
            target.classList.toggle('hidden', !this.checked);
            if (!this.checked) {
                const input = target.querySelector('input') || target;
                if (input) input.value = '';
            }
        });
    }
    setupCheckboxToggle('tenant-add-juros', 'tenant-valor-juros');
    setupCheckboxToggle('owner-add-juros', 'owner-valor-juros');
    setupCheckboxToggle('owner-primeiro-aluguel', 'owner-corretagem-reais-group');

    // --- LÓGICA PRINCIPAL DOS FORMULÁRIOS ---
    document.getElementById('tenant-form').addEventListener('submit', generateTenantReceipt);
    document.getElementById('owner-form').addEventListener('submit', generateOwnerReceipt);

    const nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatNegative = (value) => `(${formatCurrency(Math.abs(value))})`;

    function generateTenantReceipt(event) {
        event.preventDefault();
        const inquilinoNome = document.getElementById('tenant-inquilino-input').value;
        const corretorCreci = document.getElementById('corretor-creci').value;
        const enderecoImovel = document.getElementById('tenant-endereco-imovel').value;
        const mesReferenciaInput = document.getElementById('tenant-mes-referencia').value;
        const dataVencimentoInput = document.getElementById('tenant-data-vencimento').value;
        const dataDocumentoInput = document.getElementById('tenant-data-documento').value;
        const valorAluguel = parseFloat(document.getElementById('tenant-valor-aluguel').value) || 0;
        const valorCondominio = parseFloat(document.getElementById('tenant-valor-condominio').value) || 0;
        const valorIptu = parseFloat(document.getElementById('tenant-valor-iptu').value) || 0;
        const valorAgua = parseFloat(document.getElementById('tenant-valor-agua').value) || 0;
        const valorJuros = parseFloat(document.getElementById('tenant-valor-juros').value) || 0;
        const descontoPontualidade = parseFloat(document.getElementById('tenant-desconto-pontualidade').value) || 0;
        const encargosExtra = parseFloat(document.getElementById('tenant-encargos-extra').value) || 0;
        const compensacaoDesc = document.getElementById('tenant-compensacao-desc').value;
        const compensacaoValor = parseFloat(document.getElementById('tenant-compensacao-valor').value) || 0;
        const condoOp = document.querySelector('input[name="tenant-condo-op"]:checked').value;
        const iptuOp = document.querySelector('input[name="tenant-iptu-op"]:checked').value;
        const aguaOp = document.querySelector('input[name="tenant-agua-op"]:checked').value;
        let valorTotal = valorAluguel - descontoPontualidade - compensacaoValor + encargosExtra + valorJuros;
        if (valorCondominio > 0) valorTotal += (condoOp === 'add' ? valorCondominio : -valorCondominio);
        if (valorIptu > 0) valorTotal += (iptuOp === 'add' ? valorIptu : -valorIptu);
        if (valorAgua > 0) valorTotal += (aguaOp === 'add' ? valorAgua : -valorAgua);
        const [anoRef, mesRef] = mesReferenciaInput.split('-');
        const mesReferenciaFormatado = nomeMeses[parseInt(mesRef) - 1];
        const dataVencimento = new Date(dataVencimentoInput + "T12:00:00").toLocaleDateString('pt-BR');
        const dataDocumento = new Date(dataDocumentoInput + "T12:00:00");
        const dataExtenso = `Barueri SP, ${String(dataDocumento.getDate()).padStart(2, '0')} de ${nomeMeses[dataDocumento.getMonth()]} de ${dataDocumento.getFullYear()}`;
        const reciboHTML = `
            ${buildHeader(corretorCreci)}
            <div class="recibo-body">
                <div class="date-line">${dataExtenso}</div>
                <h2 class="title">Recibo de Aluguel</h2>
                <p>Recebi do(a) sr(a). <strong>${inquilinoNome}</strong>, o valor do aluguel com vencimento em <strong>${dataVencimento}</strong>.</p>
                <p>Dando plena, total e irrevogável quitação do mês de <strong>${mesReferenciaFormatado}</strong> e demais encargos contratuais descritos abaixo, referente imóvel situado à:</p>
                <div class="address">${enderecoImovel}</div>
                <div class="value-table">
                    <div class="row"><span>Valor aluguel:</span><span>${formatCurrency(valorAluguel)}</span></div>
                    ${valorCondominio > 0 ? `<div class="row"><span class="${condoOp === 'subtract' ? 'negative' : ''}">Valor Condomínio:</span><span class="${condoOp === 'subtract' ? 'negative' : ''}">${condoOp === 'subtract' ? formatNegative(valorCondominio) : formatCurrency(valorCondominio)}</span></div>` : ''}
                    ${valorIptu > 0 ? `<div class="row"><span class="${iptuOp === 'subtract' ? 'negative' : ''}">IPTU:</span><span class="${iptuOp === 'subtract' ? 'negative' : ''}">${iptuOp === 'subtract' ? formatNegative(valorIptu) : formatCurrency(valorIptu)}</span></div>` : ''}
                    ${valorAgua > 0 ? `<div class="row"><span class="${aguaOp === 'subtract' ? 'negative' : ''}">Consumo de Água:</span><span class="${aguaOp === 'subtract' ? 'negative' : ''}">${aguaOp === 'subtract' ? formatNegative(valorAgua) : formatCurrency(valorAgua)}</span></div>` : ''}
                    ${valorJuros > 0 ? `<div class="row"><span>Juros e Multa:</span><span>${formatCurrency(valorJuros)}</span></div>` : ''}
                    ${descontoPontualidade > 0 ? `<div class="row"><span class="negative">Desconto de Pontualidade:</span><span class="negative">${formatNegative(descontoPontualidade)}</span></div>` : ''}
                    ${compensacaoValor > 0 ? `<div class="row"><span class="negative">${compensacaoDesc || 'Compensação Extra'}:</span><span class="negative">${formatNegative(compensacaoValor)}</span></div>` : ''}
                    ${encargosExtra > 0 ? `<div class="row"><span>Outros Encargos:</span><span>${formatCurrency(encargosExtra)}</span></div>` : ''}
                    <div class="row total"><span>TOTAL GERAL:</span><span>${formatCurrency(valorTotal)}</span></div>
                </div>
                <div class="signature-area">
                    <div class="signature-line"></div>
                    <div class="locador-name">Sávio JF Costa</div>
                    <div class="locador-title">LOCADOR</div>
                </div>
            </div>
            ${buildFooter("Sávio Costa", corretorCreci)}
        `;
        showReceipt(reciboHTML);
    }

    function generateOwnerReceipt(event) {
        event.preventDefault();
        const proprietarioNome = document.getElementById('owner-proprietario-input').value;
        const repasseNome = document.getElementById('owner-repasse-nome').value;
        const dadosRepasse = document.getElementById('owner-dados-repasse').value;
        const enderecoImovel = document.getElementById('owner-endereco-imovel').value;
        const mesReferenciaInput = document.getElementById('owner-mes-referencia').value;
        const dataDocumentoInput = document.getElementById('owner-data-documento').value;
        const valorAluguel = parseFloat(document.getElementById('owner-valor-aluguel').value) || 0;
        const descontoPontualidade = parseFloat(document.getElementById('owner-desconto-pontualidade').value) || 0;
        const valorCondominio = parseFloat(document.getElementById('owner-valor-condominio').value) || 0;
        const valorIptu = parseFloat(document.getElementById('owner-valor-iptu').value) || 0;
        const valorAgua = parseFloat(document.getElementById('owner-valor-agua').value) || 0;
        const valorJuros = parseFloat(document.getElementById('owner-valor-juros').value) || 0;
        const compensacaoDesc = document.getElementById('owner-compensacao-desc').value;
        const compensacaoValor = parseFloat(document.getElementById('owner-compensacao-valor').value) || 0;
        const isPrimeiroAluguel = document.getElementById('owner-primeiro-aluguel').checked;
        const condoOp = document.querySelector('input[name="owner-condo-op"]:checked').value;
        const iptuOp = document.querySelector('input[name="owner-iptu-op"]:checked').value;
        const aguaOp = document.querySelector('input[name="owner-agua-op"]:checked').value;
        let totalPagoInquilino = valorAluguel - descontoPontualidade - compensacaoValor + valorJuros;
        if (valorCondominio > 0) totalPagoInquilino += (condoOp === 'add' ? valorCondominio : -valorCondominio);
        if (valorIptu > 0) totalPagoInquilino += (iptuOp === 'add' ? valorIptu : -valorIptu);
        if (valorAgua > 0) totalPagoInquilino += (aguaOp === 'add' ? valorAgua : -valorAgua);
        let valorCorretagem = 0;
        let corretagemHtml = '';
        if (isPrimeiroAluguel) {
            valorCorretagem = parseFloat(document.getElementById('owner-corretagem-reais').value) || 0;
            corretagemHtml = `<div class="row"><span class="negative">Corretagem (Taxa Fixa):</span><span class="negative">${formatNegative(valorCorretagem)}</span></div>`;
        } else {
            const baseCalculoCorretagem = valorAluguel - descontoPontualidade;
            valorCorretagem = baseCalculoCorretagem * 0.10;
            corretagemHtml = `
                <div class="row"><span>Despesas corretagem (base ${formatCurrency(baseCalculoCorretagem)}):</span></div>
                <div class="row"><span class="negative">Corretagem 10%:</span><span class="negative">${formatNegative(valorCorretagem)}</span></div>
            `;
        }
        const valorRepasse = totalPagoInquilino - valorCorretagem;
        const [anoRef, mesRef] = mesReferenciaInput.split('-');
        const mesReferenciaFormatado = nomeMeses[parseInt(mesRef) - 1];
        const dataDocumento = new Date(dataDocumentoInput + "T12:00:00");
        const dataExtenso = `Barueri SP, ${String(dataDocumento.getDate()).padStart(2, '0')} de ${nomeMeses[dataDocumento.getMonth()]} de ${dataDocumento.getFullYear()}`;
        const reciboHTML = `
            ${buildHeader("207833")}
            <div class="recibo-body">
                <div class="date-line">${dataExtenso}</div>
                <h2 class="title">Recibo de Aluguel e Repasse</h2>
                <p>Enviado ao sr. <strong>${proprietarioNome}</strong> o valor referente ao mês de <strong>${mesReferenciaFormatado}</strong>, dando plena, total e irrevogável quitação de aluguel e demais encargos contratuais escritos abaixo, referente imóvel situado à:</p>
                <div class="address">${enderecoImovel}</div>
                <div class="value-table">
                    <div class="row"><span>Valor aluguel:</span><span>${formatCurrency(valorAluguel)}</span></div>
                    ${valorCondominio > 0 ? `<div class="row"><span class="${condoOp === 'subtract' ? 'negative' : ''}">Valor Condomínio:</span><span class="${condoOp === 'subtract' ? 'negative' : ''}">${condoOp === 'subtract' ? formatNegative(valorCondominio) : formatCurrency(valorCondominio)}</span></div>` : ''}
                    ${valorIptu > 0 ? `<div class="row"><span class="${iptuOp === 'subtract' ? 'negative' : ''}">IPTU:</span><span class="${iptuOp === 'subtract' ? 'negative' : ''}">${iptuOp === 'subtract' ? formatNegative(valorIptu) : formatCurrency(valorIptu)}</span></div>` : ''}
                    ${valorAgua > 0 ? `<div class="row"><span class="${aguaOp === 'subtract' ? 'negative' : ''}">Consumo de Água:</span><span class="${aguaOp === 'subtract' ? 'negative' : ''}">${aguaOp === 'subtract' ? formatNegative(valorAgua) : formatCurrency(valorAgua)}</span></div>` : ''}
                    ${valorJuros > 0 ? `<div class="row"><span>Juros e Multa:</span><span>${formatCurrency(valorJuros)}</span></div>` : ''}
                    ${descontoPontualidade > 0 ? `<div class="row"><span class="negative">Desconto de Pontualidade:</span><span class="negative">${formatNegative(descontoPontualidade)}</span></div>` : ''}
                    ${compensacaoValor > 0 ? `<div class="row"><span class="negative">${compensacaoDesc || 'Compensação Extra'}:</span><span class="negative">${formatNegative(compensacaoValor)}</span></div>` : ''}
                    <div class="row total"><span>TOTAL RECEBIDO:</span><span>${formatCurrency(totalPagoInquilino)}</span></div>
                </div>
                <div class="value-table">
                    ${corretagemHtml}
                    <div class="row"><span class="payment-methods">(&nbsp;&nbsp;) Boleto (&nbsp;&nbsp;) Transferência Bancária ( X ) PIX (&nbsp;&nbsp;) Cartão de Crédito</span></div>
                </div>
                <div class="value-table">
                    <div class="row"><span>Pagamento repasse para:</span><strong>${repasseNome}</strong></div>
                    <div class="row"><span>Valor de Repasse:</span><strong>${formatCurrency(valorRepasse)}</strong></div>
                    <div class="row"><span class="payment-methods">(&nbsp;&nbsp;) Boleto (&nbsp;&nbsp;) Transferência Bancária ( X ) PIX (&nbsp;&nbsp;) Cartão de Crédito</span></div>
                    <div class="row"><span>Dados do Pagamento:</span><strong>${dadosRepasse}</strong></div>
                </div>
            </div>
            ${buildFooter("Sávio Costa", "207833")}
        `;
        showReceipt(reciboHTML);
    }
    
    // --- FUNÇÕES AUXILIARES ---
    function buildHeader(creci) { return `<header class="recibo-header"><div class="header-left"><h2>Recibo de Aluguel</h2></div><div class="header-right"><img src="logo.png" alt="Logo" class="header-logo"></div></header>`; }
    function buildFooter(corretorNome, corretorCreci) { return `<footer class="recibo-footer"><div class="footer-contact"><span>(11) 92007-2265 | (11) 96111-1115</span><span>aconteceonline@outlook.com</span><span>www.xai-imoveis.com.br</span></div><div class="footer-realtor"><span>${corretorNome}</span><br></div></footer>`; }
    function showReceipt(html) {
        tenantFormContainer.classList.add('hidden');
        ownerFormContainer.classList.add('hidden');
        choiceContainer.classList.add('hidden');
        document.getElementById('recibo-content').innerHTML = html;
        receiptOutput.classList.remove('hidden');
    }
});