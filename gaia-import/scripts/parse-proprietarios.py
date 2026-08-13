# -*- coding: utf-8 -*-
"""
Converte a exportação "Proprietários por imóveis" do Kenlo em JSON.

O Kenlo entrega um .xls que na verdade é HTML (<table>), então não abre com
openpyxl/xlrd. Aqui o parse é feito no HTML mesmo.

É esta exportação — e só ela — que traz `Ref. Imóvel` e `Ref. Prop.` na mesma
linha. A listagem de clientes tem o proprietário mas não o imóvel; a de imóveis
tem o imóvel mas não o proprietário.

    python scripts/parse-proprietarios.py <arquivo.xls> <saida.json>
"""
import html
import json
import re
import sys


def celulas(linha_html):
    return [
        html.unescape(re.sub(r"<[^>]+>", "", c)).replace("\xa0", " ").strip()
        for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", linha_html, re.S)
    ]


def telefones(txt):
    """'Celular: (11) 9965-49247 Residencial: (11) 2222-3333' -> lista de números."""
    return [t.strip() for t in re.findall(r"\(\d{2}\)\s*[\d-]{8,12}", txt or "")]


def main(entrada, saida):
    doc = open(entrada, "rb").read().decode("utf-8", errors="replace")
    linhas = re.findall(r"<tr[^>]*>(.*?)</tr>", doc, re.S)
    if not linhas:
        raise SystemExit("nenhuma linha <tr> encontrada")

    cabecalho = celulas(linhas[0])
    col = {nome: i for i, nome in enumerate(cabecalho)}
    obrigatorias = ["Ref. Imóvel", "Ref. Prop.", "Nome", "Telefones"]
    faltando = [c for c in obrigatorias if c not in col]
    if faltando:
        raise SystemExit(f"colunas ausentes: {faltando}\ncabeçalho: {cabecalho}")

    por_imovel = {}
    duplicados = 0
    for linha in linhas[1:]:
        c = celulas(linha)
        if len(c) < len(cabecalho):
            continue
        ref_imovel = c[col["Ref. Imóvel"]].strip().upper()
        nome = c[col["Nome"]].strip()
        if not ref_imovel or not nome:
            continue
        registro = {
            "nome": nome,
            "telefones": telefones(c[col["Telefones"]]),
            "email": c[col["E-mail"]].strip() if "E-mail" in col else "",
            "refProprietario": c[col["Ref. Prop."]].strip(),
            "statusProprietario": c[col["Status Prop."]].strip() if "Status Prop." in col else "",
        }
        # Um imóvel pode ter mais de um dono (casal, espólio, sociedade).
        if ref_imovel in por_imovel:
            por_imovel[ref_imovel].append(registro)
            duplicados += 1
        else:
            por_imovel[ref_imovel] = [registro]

    json.dump(por_imovel, open(saida, "w", encoding="utf-8"), ensure_ascii=False)

    com_tel = sum(1 for v in por_imovel.values() if v[0]["telefones"])
    com_email = sum(1 for v in por_imovel.values() if v[0]["email"])
    print(f"colunas          : {len(cabecalho)}")
    print(f"linhas de dados  : {len(linhas) - 1}")
    print(f"imóveis distintos: {len(por_imovel)}")
    print(f"  com telefone   : {com_tel}")
    print(f"  com e-mail     : {com_email}")
    print(f"  com 2+ donos   : {sum(1 for v in por_imovel.values() if len(v) > 1)}")
    print(f"saída            : {saida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
