import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [pokeArr, setPokeArr] = useState([]);
  const [searchPokeArr, setSearchPokeArr] = useState(null);
  const [nextQuery, setNextQuery] = useState("");
  const [prevQuery, setPrevQuery] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function consumeAPI(url) {
    try {
      setIsLoading(true);
      const res = await fetch(url);
      if (!res.ok)
        throw new Error("Something went wrong with fetching Pokemon");
      const data = await res.json();
      const pokemonData = data.results;
      const pokemonNextURL = data.next;
      const pokemonPrevURL = data.previous;
      const detailPokemon = await Promise.all(
        pokemonData.map(async (item) => {
          const detailRes = await fetch(item.url);
          const detailData = await detailRes.json();
          return detailData;
        })
      );
      setPokeArr(detailPokemon);
      setNextQuery(pokemonNextURL);
      setPrevQuery(pokemonPrevURL);
      setIsLoading(false);
    } catch (err) {
      setError(`Error Happened: ${err.message}`);
      setIsLoading(false);
    }
  }

  async function nameAPI(url) {
    try {
      if (url === "") return;
      setIsLoading(true);
      setError("");
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("something went wrong with fetching pokemon");
      }
      const data = await res.json();
      const results = data;
      setSearchPokeArr(results);
      setQuery("");
      setIsLoading(false);
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      setSearchPokeArr(null);
      setQuery("");
    } finally {
      setIsLoading(false);
    }
  }

  // useEffect(() => {
  //   nameAPI(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
  // }, [query]);

  useEffect(() => {
    consumeAPI(`https://pokeapi.co/api/v2/pokemon/`);
  }, []);

  function handleNext() {
    if (nextQuery) {
      consumeAPI(nextQuery);
    }
  }

  function handlePrev() {
    if (prevQuery) {
      consumeAPI(prevQuery);
    }
  }

  function searchQuery() {
    if (query) {
      nameAPI(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    }
  }

  function closeSearchItem() {
    setSearchPokeArr(null);
  }
  return (
    <div className="app">
      <PokedexNav
        query={query}
        setQuery={setQuery}
        onSearchQuery={searchQuery}
      ></PokedexNav>
      <PokedexGrid
        nextQuery={nextQuery}
        onNext={handleNext}
        onPrev={handlePrev}
        pokeArr={pokeArr}
        searchPokeArr={searchPokeArr}
        isLoading={isLoading}
        error={error}
        closeSearchItem={closeSearchItem}
      ></PokedexGrid>
    </div>
  );
}

function PokedexNav({ onSearchQuery, query, setQuery }) {
  return (
    <div className="container-poke">
      <nav className="navbar">
        <h1>POKEDEX</h1>
        <div className="search-container">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          ></input>
          <button onClick={onSearchQuery} className="btn">
            🔍
          </button>
        </div>
      </nav>
    </div>
  );
}

function PokedexGrid({
  pokeArr,
  onNext,
  nextQuery,
  searchPokeArr,
  onPrev,
  isLoading,
  error,
  closeSearchItem,
}) {
  return (
    <>
      {isLoading && <Loader></Loader>}
      {!isLoading && !error && (
        <PokedexGridSearchContainer
          searchPokeArr={searchPokeArr}
          closeSearchItem={closeSearchItem}
        ></PokedexGridSearchContainer>
      )}
      {error && <ErrorMessage error={error}></ErrorMessage>}
      <ButtonSection
        onNext={onNext}
        onPrev={onPrev}
        nextQuery={nextQuery}
      ></ButtonSection>
      <PokedexGridItemContainer pokeArr={pokeArr}></PokedexGridItemContainer>
    </>
  );
}

function PokedexGridItemContainer({ pokeArr }) {
  return (
    <ul className="poke-grid">
      {pokeArr.map((item) => (
        <PokedexGridItem key={item.name} item={item}></PokedexGridItem>
      ))}
    </ul>
  );
}

function PokedexGridItem({ item }) {
  return (
    <li className="poke-box">
      <div className="poke-name-bg">
        <img src={item?.sprites?.front_default} alt="pokemon"></img>
        <h3>{item?.name}</h3>
      </div>
    </li>
  );
}
function PokedexGridSearchContainer({ searchPokeArr, closeSearchItem }) {
  return (
    <>
      {searchPokeArr ? (
        <>
          <ul className="search-item-container">
            <PokedexGridSearchItem
              searchPokeArr={searchPokeArr}
              closeSearchItem={closeSearchItem}
            ></PokedexGridSearchItem>
          </ul>
        </>
      ) : (
        <ul>
          <PokedexGridSearchText></PokedexGridSearchText>
        </ul>
      )}
    </>
  );
}
function PokedexGridSearchItem({ searchPokeArr, closeSearchItem }) {
  return (
    <li className="poke-box flex">
      <div className="poke-detail">
        <span onClick={closeSearchItem} className="close">
          ❌
        </span>
        <img
          src={searchPokeArr?.sprites?.front_default}
          alt={searchPokeArr?.name}
        ></img>
        <span className="poke-name-bg">{searchPokeArr?.name}</span>
      </div>
      <div className="search-content">
        <p>Weight: {searchPokeArr?.weight} kg</p>
        <p>Height: {searchPokeArr?.height} cm</p>
        <p>Base Experience: {searchPokeArr?.base_experience}</p>
        <p>Pokemon Id: {searchPokeArr?.id}</p>
      </div>
    </li>
  );
}

function PokedexGridSearchText() {
  return <li className="title">Search for a specific pokemon!</li>;
}

function Loader() {
  return (
    <div className="loading-container">
      <div className="loading"></div>
    </div>
  );
}

function ErrorMessage({ error }) {
  return <h3 className="error">{error}</h3>;
}

function ButtonSection({ onNext, onPrev, nextQuery }) {
  return (
    <>
      {nextQuery && (
        <div className="flex">
          <button className="btn-next" onClick={onPrev}>
            prev
          </button>
          <button className="btn-next" onClick={onNext}>
            next
          </button>
        </div>
      )}
    </>
  );
}

export default App;
