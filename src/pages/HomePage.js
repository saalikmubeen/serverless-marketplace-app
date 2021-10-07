import { useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";
import { searchMarkets } from "../graphql/queries";

function HomePage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const handleSearchChange = (searchTerm) => {
        setQuery(searchTerm);

        if (searchTerm === "") {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const handleClearSearch = () => {
        setQuery("");
        setIsSearching(false);
        setSearchResults([]);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        const results = await API.graphql(
            graphqlOperation(searchMarkets, {
                filter: {
                    or: [
                        {
                            name: {
                                match: query,
                            },
                        },
                        {
                            tags: {
                                match: query,
                            },
                        },
                        {
                            owner: {
                                match: query,
                            },
                        },
                    ],
                },
                // sort: {
                //     direction: "desc",
                //     field: "createdAt",
                // },
            })
        );
        setSearchResults(results.data.searchMarkets.items);
        console.log(results);
        setIsSearching(false);
    };

    return (
        <div>
            <NewMarket
                handleClearSearch={handleClearSearch}
                handleSearchChange={handleSearchChange}
                handleSearch={handleSearch}
                isSearching={isSearching}
                searchTerm={query}
            />
            <MarketList searchResults={searchResults} />
        </div>
    );
}

export default HomePage;
