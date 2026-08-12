// Recebe o POST que o CRM (triggerRevalidate) manda a cada PATCH/publish/delete
// de imóvel no Sanity. O site é HTML estático gerado no build — não existe
// revalidação de página isolada aqui, então a resposta é sempre a mesma:
// disparar um rebuild completo via Deploy Hook da Vercel. O build roda
// `gerar-catalogo.mjs`, que busca o Sanity de novo do zero, então o conteúdo
// sai atualizado sem precisar tocar em código a cada edição.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const secret = req.headers['x-revalidate-secret'];
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    res.status(401).json({ error: 'invalid secret' });
    return;
  }

  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    res.status(500).json({ error: 'deploy hook not configured' });
    return;
  }

  try {
    const hookRes = await fetch(hookUrl, { method: 'POST' });
    if (!hookRes.ok) {
      res.status(502).json({ error: 'deploy hook trigger failed', status: hookRes.status });
      return;
    }
  } catch (err) {
    res.status(502).json({ error: 'deploy hook trigger failed', detail: String(err) });
    return;
  }

  res.status(200).json({ ok: true, triggered: true });
};
