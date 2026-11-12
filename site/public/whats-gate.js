/*
 * Pop-up de nome + telefone antes de qualquer botão de WhatsApp do site (pedido do gestor de
 * tráfego, 11/11/2026): o lead é registrado no CRM (mesmo webhook da Laís que o formulário da
 * ficha usa), o evento `lead_whatsapp` vai para o Tag Manager e só então o WhatsApp abre.
 *
 * Carregado uma vez pelo layout e vale para toda página, inclusive links criados por JS: o clique
 * é capturado no document. Se este arquivo falhar ao carregar, os links continuam abrindo o
 * WhatsApp direto (nada quebra, só deixa de registrar). Só vale para wa.me/55<número>: o link
 * de compartilhar (wa.me/?text=…) não tem número e passa direto.
 */
(function () {
  'use strict';
  if (window.__tamadaWhatsGate) return;
  window.__tamadaWhatsGate = true;

  var LEADS_URL = 'https://prod.lastro.services/api/public/v1/leads/webhook/39182584-8027-45d3-a795-e82d4e046b67';
  var STORAGE_KEY = 'tamada_lead';
  var TIMEOUT_ENVIO = 6000;

  var CSS = [
    '.wg-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(21,21,20,.62);opacity:0;transition:opacity .22s}',
    '.wg-overlay.wg-on{opacity:1}',
    '.wg-overlay[hidden]{display:none}',
    '.wg-box{position:relative;width:100%;max-width:440px;max-height:calc(100vh - 40px);overflow:auto;background:#fff;border-radius:4px;padding:34px 30px 28px;box-shadow:0 30px 80px rgba(24,18,15,.35);transform:translateY(14px);transition:transform .3s cubic-bezier(.22,1,.36,1);color:#151514;font-family:inherit}',
    '.wg-overlay.wg-on .wg-box{transform:none}',
    '.wg-close{position:absolute;top:10px;right:12px;width:36px;height:36px;border:0;background:none;font-size:26px;line-height:1;color:#77746c;cursor:pointer}',
    '.wg-close:hover{color:#151514}',
    '.wg-kicker{margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#b21218;font-weight:700}',
    '.wg-title{margin:0 0 8px;font-size:26px;line-height:1.15;font-weight:500}',
    '.wg-sub{margin:0 0 22px;font-size:14px;line-height:1.55;color:#77746c}',
    '.wg-field{display:block;margin-bottom:15px}',
    '.wg-field>span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#353431;font-weight:700;margin-bottom:7px}',
    '.wg-field input{width:100%;box-sizing:border-box;border:1px solid rgba(21,21,20,.14);background:#fdfcfa;padding:14px 15px;font-size:16px;color:#151514;border-radius:0;transition:border-color .2s,box-shadow .2s}',
    '.wg-field input:focus{outline:0;border-color:#b21218;box-shadow:0 0 0 3px rgba(178,18,24,.1)}',
    '.wg-check{display:flex;gap:11px;align-items:flex-start;margin:6px 0 20px;font-size:12.5px;line-height:1.5;color:#77746c;cursor:pointer}',
    '.wg-check input{margin-top:2px;flex:0 0 auto;width:17px;height:17px;accent-color:#b21218}',
    '.wg-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:0;background:#b21218;color:#fff;padding:16px 20px;font-size:15px;font-weight:600;cursor:pointer;transition:background .2s}',
    '.wg-btn:hover{background:#850c12}',
    '.wg-btn:disabled{opacity:.65;cursor:wait}',
    '.wg-erro{margin:12px 0 0;font-size:13px;line-height:1.5;color:#b21218}',
    '.wg-erro[hidden]{display:none}',
    '@media (max-width:640px){.wg-overlay{align-items:flex-end;padding:0}.wg-box{max-width:none;border-radius:14px 14px 0 0;padding:30px 20px calc(24px + env(safe-area-inset-bottom));transform:translateY(40px)}}',
    '@media (prefers-reduced-motion:reduce){.wg-overlay,.wg-box{transition:none}}'
  ].join('');

  var overlay, form, inNome, inFone, inAceite, btn, erro, destinoAtual, ultimoFoco;

  // ---------- helpers ----------
  function alvoWhats(a) {
    if (!a || !a.href) return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (_) { return null; }
    if (u.hostname !== 'wa.me' || !/^\/55\d{10,11}$/.test(u.pathname)) return null;
    return u;
  }

  function lerSalvo() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; } catch (_) { return {}; }
  }
  function gravarSalvo(dados) {
    try {
      var atual = lerSalvo();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, atual, dados, { at: new Date().toISOString() })));
    } catch (_) {}
  }

  function mascaraFone(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return d;
  }
  function digitosFone(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    return d;
  }

  // Contexto do lead: na ficha usa o imóvel e a finalidade em destaque; nas demais, a página.
  function contexto() {
    var ctx = window.__TAMADA_LEAD_CTX__ || null;
    var property = (ctx && ctx.property) || window.__TAMADA_PROPERTY__ || null;
    var path = location.pathname;
    var params = new URLSearchParams(location.search);
    var ehLocacao;
    if (ctx) ehLocacao = !!ctx.ehLocacao;
    else if (property) ehLocacao = !(property.sale > 0) && property.rent > 0;
    else ehLocacao = params.get('purpose') === 'rent';

    var formText;
    if (property) {
      formText = 'Tenho interesse no imóvel ' + property.ref + ' — ' + property.title + ', ' + property.neighborhood + '. (Botão de WhatsApp do site)';
    } else if (path.indexOf('/anuncie') === 0) {
      formText = 'Quer anunciar um imóvel com a Tamada. (Botão de WhatsApp da página Anuncie)';
    } else if (path.indexOf('/financiamento') === 0) {
      formText = 'Quer falar sobre financiamento. (Botão de WhatsApp da página Financiamento)';
    } else if (path.indexOf('/trabalhe-conosco') === 0) {
      formText = 'Quer falar sobre trabalhar na Tamada. (Botão de WhatsApp da página Trabalhe conosco)';
    } else {
      formText = 'Contato pelo botão de WhatsApp do site, na página ' + path + '.';
    }
    return { property: property, ehLocacao: ehLocacao, formText: formText };
  }

  function enviarLead(nome, fone, ctx) {
    var d = digitosFone(fone);
    var corpo = {
      name: nome,
      ddd: d.slice(0, 2),
      phone: d.slice(2),
      formText: ctx.formText,
      link: location.href,
      transactionType: ctx.ehLocacao ? 'rent' : 'buy',
      origin: 'PropWebsiteLais'
    };
    if (ctx.property) corpo.clientListingId = String(ctx.property.codigo || ctx.property.ref);

    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_ENVIO);
    return fetch(LEADS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      keepalive: true,
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { clearTimeout(timer); return r.ok ? 'ok' : 'erro'; })
      .catch(function () { clearTimeout(timer); return 'erro'; });
  }

  function evento(status, ctx) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: status === 'ok' ? 'lead_whatsapp' : 'lead_whatsapp_falha',
      lead_origem: 'botao_whatsapp',
      pagina: location.pathname,
      imovel_ref: ctx.property ? ctx.property.ref : undefined,
      finalidade: ctx.property ? (ctx.ehLocacao ? 'locacao' : 'venda') : undefined
    });
  }

  // Mensagem pronta no WhatsApp: mantém o texto do link; se não tem, cita o imóvel da ficha.
  function destinoFinal(u, ctx) {
    var url = new URL(u.href);
    if (!url.searchParams.get('text') && ctx.property) {
      url.searchParams.set('text', 'Olá! Tenho interesse no imóvel ' + ctx.property.ref + ' (' + location.origin + location.pathname + ').');
    }
    return url.toString();
  }

  // ---------- pop-up ----------
  function montar() {
    if (overlay) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    overlay = document.createElement('div');
    overlay.className = 'wg-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="wg-box" role="dialog" aria-modal="true" aria-labelledby="wgTitulo">' +
        '<button type="button" class="wg-close" aria-label="Fechar">&times;</button>' +
        '<p class="wg-kicker">Atendimento Tamada</p>' +
        '<h2 class="wg-title" id="wgTitulo">Falar no WhatsApp</h2>' +
        '<p class="wg-sub">Informe seu nome e telefone e continue a conversa com a Tamada Imóveis no WhatsApp.</p>' +
        '<form novalidate>' +
          '<label class="wg-field"><span>Nome</span><input name="nome" type="text" autocomplete="name" required maxlength="80"></label>' +
          '<label class="wg-field"><span>Telefone (com DDD)</span><input name="fone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" required maxlength="20"></label>' +
          '<label class="wg-check"><input name="aceite" type="checkbox" required><span>Concordo em ser contatado pela Tamada Imóveis.</span></label>' +
          '<button type="submit" class="wg-btn"><iconify-icon icon="mdi:whatsapp"></iconify-icon><span>Continuar no WhatsApp</span></button>' +
          '<p class="wg-erro" role="alert" hidden></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    form = overlay.querySelector('form');
    inNome = form.elements.nome;
    inFone = form.elements.fone;
    inAceite = form.elements.aceite;
    btn = form.querySelector('.wg-btn');
    erro = form.querySelector('.wg-erro');

    inFone.addEventListener('input', function () { inFone.value = mascaraFone(inFone.value); });
    overlay.querySelector('.wg-close').addEventListener('click', fechar);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) fechar(); });
    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'Tab') prenderFoco(e);
    });
    form.addEventListener('submit', enviar);
  }

  function prenderFoco(e) {
    var els = overlay.querySelectorAll('button:not([disabled]),input');
    if (!els.length) return;
    var primeiro = els[0], ultimo = els[els.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  }

  function abrir(u, origem) {
    montar();
    destinoAtual = u;
    ultimoFoco = origem || document.activeElement;
    var salvo = lerSalvo();
    inNome.value = salvo.name || '';
    inFone.value = salvo.phone ? mascaraFone(salvo.phone) : '';
    inAceite.checked = false;
    mostrarErro('');
    btn.disabled = false;
    overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('wg-on'); });
    setTimeout(function () { (inNome.value ? inFone : inNome).focus(); }, 60);
  }

  function fechar() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('wg-on');
    document.documentElement.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 200);
    if (ultimoFoco && ultimoFoco.focus) { try { ultimoFoco.focus(); } catch (_) {} }
  }

  function mostrarErro(msg) {
    erro.textContent = msg;
    erro.hidden = !msg;
  }

  function enviar(e) {
    e.preventDefault();
    if (btn.disabled) return;
    var nome = inNome.value.trim();
    var fone = inFone.value.trim();
    if (nome.length < 2) { mostrarErro('Informe seu nome.'); inNome.focus(); return; }
    var d = digitosFone(fone);
    if (d.length < 10 || d.length > 11) { mostrarErro('Confira o telefone: informe com DDD, por exemplo (11) 90000-0000.'); inFone.focus(); return; }
    if (!inAceite.checked) { mostrarErro('Marque a caixa para continuar.'); return; }
    mostrarErro('');

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Abrindo o WhatsApp…';
    var ctx = contexto();
    var destino = destinoFinal(destinoAtual, ctx);

    // A aba precisa abrir já, dentro do clique: depois de esperar a rede o navegador bloquearia.
    var aba = null;
    try { aba = window.open('about:blank', '_blank'); } catch (_) {}

    enviarLead(nome, fone, ctx).then(function (status) {
      gravarSalvo({ name: nome, phone: fone, ref: ctx.property ? ctx.property.ref : undefined });
      evento(status, ctx);
      // Falha de envio não trava o cliente: o WhatsApp abre do mesmo jeito.
      if (aba && !aba.closed) {
        try { aba.opener = null; } catch (_) {}
        aba.location.href = destino;
      } else {
        location.href = destino;
      }
      btn.querySelector('span').textContent = 'Continuar no WhatsApp';
      fechar();
    });
  }

  // ---------- captura do clique ----------
  function interceptar(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    var u = alvoWhats(a);
    if (!u) return;
    e.preventDefault();
    abrir(u, a);
  }
  document.addEventListener('click', interceptar, true);
  document.addEventListener('auxclick', function (e) { if (e.button === 1) interceptar(e); }, true);
})();
