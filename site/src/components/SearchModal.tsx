export default function SearchModal() {
  return (
    <dialog className="search-modal" id="searchModal">
      <form method="dialog" className="modal-shell" id="advancedSearch">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              <span>Busca inteligente</span>
            </p>
            <h2>
              Qual lugar combina
              <br />
              <em>com seu momento?</em>
            </h2>
          </div>
          <button className="modal-close" type="button" data-close-search aria-label="Fechar busca">
            <iconify-icon icon="solar:close-circle-linear" />
          </button>
        </div>
        <div className="modal-body">
          <fieldset className="modal-purpose">
            <legend>Finalidade</legend>
            <label>
              <input type="radio" name="modalPurpose" value="sale" defaultChecked />
              <span>Comprar</span>
            </label>
            <label>
              <input type="radio" name="modalPurpose" value="rent" />
              <span>Alugar</span>
            </label>
            <label>
              <input type="radio" name="modalPurpose" value="commercial" />
              <span>Comercial</span>
            </label>
          </fieldset>
          <div className="modal-grid">
            <label className="modal-field full">
              <span>Localização ou código</span>
              <div>
                <iconify-icon icon="solar:map-point-linear" />
                <input id="modalLocation" type="search" placeholder="Ex.: Vila Granada ou AP7842-EIU" />
              </div>
            </label>
            <label className="modal-field">
              <span>Tipo do imóvel</span>
              <select id="modalType">
                <option value="">Todos</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="TWO_STORY_HOUSE">Sobrado</option>
                <option value="HALL">Comercial</option>
                <option value="LAND">Terreno</option>
              </select>
            </label>
            <label className="modal-field">
              <span>Valor máximo</span>
              <select id="modalPrice">
                <option value="">Sem limite</option>
                <option value="260000">R$ 260 mil</option>
                <option value="500000">R$ 500 mil</option>
                <option value="900000">R$ 900 mil</option>
                <option value="2000000">R$ 2 milhões</option>
                <option value="5000000">R$ 5 milhões</option>
              </select>
            </label>
            <fieldset className="modal-field full">
              <legend>Quartos</legend>
              <div className="number-chips" id="bedroomChips">
                <button className="active" type="button" data-value="0">
                  Todos
                </button>
                <button type="button" data-value="1">
                  1
                </button>
                <button type="button" data-value="2">
                  2
                </button>
                <button type="button" data-value="3">
                  3
                </button>
                <button type="button" data-value="4" data-min="">
                  4+
                </button>
              </div>
            </fieldset>
            <fieldset className="modal-field full">
              <legend>Características</legend>
              <div className="feature-chips">
                <label>
                  <input type="checkbox" value="garage" />
                  <span>Com vaga</span>
                </label>
                <label>
                  <input type="checkbox" value="apartment" />
                  <span>Condomínio</span>
                </label>
                <label>
                  <input type="checkbox" value="affordable" />
                  <span>Até R$ 260 mil</span>
                </label>
                <label>
                  <input type="checkbox" value="commercial" />
                  <span>Uso comercial</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="modal-footer">
          <button className="clear-search" id="clearSearch" type="button">
            <iconify-icon icon="solar:restart-linear" /> Limpar filtros
          </button>
          <button className="button button-red button-large" type="submit">
            <span>
              Ver <b id="modalCount">12</b> imóveis
            </span>
            <iconify-icon icon="solar:arrow-right-linear" />
          </button>
        </div>
      </form>
    </dialog>
  )
}
