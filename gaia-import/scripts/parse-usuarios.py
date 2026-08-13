# -*- coding: utf-8 -*-
"""
Extrai CRECI e dados dos corretores das exportações "Usuários" do Kenlo.

Como as outras exportações do Kenlo, o .xls é HTML disfarçado. E como os
usuários vêm divididos em vários arquivos (por perfil: Corretor, Supervisor...),
este script aceita vários e junta tudo, deduplicando por e-mail.

    python scripts/parse-usuarios.py saida.json arq1.xls arq2.xls ...
"""
import html
import json
import re
import sys


def celulas(linha):
    return [
        html.unescape(re.sub(r"<[^>]+>", "", c)).replace("\xa0", " ").strip()
        for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", linha, re.S)
    ]


def limpo(v):
    """Kenlo grava 'Não informado' e '0' como preenchimento — tratados como vazio."""
    v = (v or "").strip()
    return "" if v.lower() in ("", "não informado", "nao informado", "0", "-") else v


def main(saida, arquivos):
    pessoas = {}
    for caminho in arquivos:
        doc = open(caminho, "rb").read().decode("utf-8", errors="replace")
        linhas = re.findall(r"<tr[^>]*>(.*?)</tr>", doc, re.S)
        if len(linhas) < 2:
            print(f"  {caminho}: vazio, ignorado")
            continue
        cab = celulas(linhas[0])
        col = {n: i for i, n in enumerate(cab)}
        novos = 0
        for l in linhas[1:]:
            c = celulas(l)
            if len(c) < len(cab):
                continue
            email = limpo(c[col["E-mail"]]).lower()
            if not email:
                continue
            if email in pessoas:
                continue
            pessoas[email] = {
                "nome": limpo(c[col["Nome Completo"]]),
                "email": email,
                "creci": limpo(c[col["Creci"]]),
                "tipoCreci": limpo(c[col["Tipo de Creci"]]),
                "celular": limpo(c[col["Celular"]]),
                "telefone": limpo(c[col["Telefone Principal"]]),
                "perfil": limpo(c[col["Perfil"]]),
                "status": limpo(c[col["Status"]]),
            }
            novos += 1
        print(f"  {caminho.split(chr(92))[-1]}: {novos} pessoas")

    json.dump(pessoas, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    com_creci = [p for p in pessoas.values() if p["creci"]]
    print(f"\ntotal de pessoas : {len(pessoas)}")
    print(f"  com CRECI      : {len(com_creci)}")
    print(f"  sem CRECI      : {len(pessoas) - len(com_creci)}")
    print(f"saída            : {saida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
