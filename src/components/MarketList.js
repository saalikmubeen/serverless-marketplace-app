import React, { useEffect, useState, useCallback } from "react";
import { Loading, Card, Tag, Icon } from "element-react";
import { graphqlOperation, API } from "aws-amplify";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import { Link } from "react-router-dom";
import { FcShop } from "react-icons/fc";
import { FaShoppingCart } from "react-icons/fa";

const MarketList = ({ searchResults }) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMarkets = useCallback(() => {
        (async () => {
            const results = await API.graphql(graphqlOperation(listMarkets));
            setMarkets(results.data.listMarkets.items);
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        fetchMarkets();

        const subscription = API.graphql(
            graphqlOperation(onCreateMarket)
        ).subscribe({
            next: (marketData) => {
                const newMarket = marketData.value.data.onCreateMarket;
                const updatedMarkets = [newMarket, ...markets];
                setMarkets(updatedMarkets);
            },
        });

        return () => subscription.unsubscribe();
    }, [fetchMarkets]);

    const marketsToRender = searchResults.length > 0 ? searchResults : markets;

    return (
        <>
            {searchResults.length > 0 ? (
                <h2 className="text-green">
                    <Icon type="success" name="check" className="icon" />
                    {searchResults.length} Results
                </h2>
            ) : (
                <h2 className="header">
                    <FcShop className="icon" size={40} />
                    Markets
                </h2>
            )}

            {loading ? (
                <Loading fullscreen={true} />
            ) : (
                marketsToRender &&
                marketsToRender.map((market) => (
                    <div key={market.id} className="my-2">
                        <Card
                            bodyStyle={{
                                padding: "0.7em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <span className="flex">
                                    <Link
                                        className="link"
                                        to={`/markets/${market.id}`}
                                    >
                                        {market.name}
                                    </Link>

                                    <FaShoppingCart
                                        className="icon"
                                        size={15}
                                        color="orange"
                                    />
                                </span>
                                <div style={{ color: "var(--lightSquidInk)" }}>
                                    {market.owner}
                                </div>
                            </div>
                            <div>
                                {market.tags &&
                                    market.tags.map((tag) => (
                                        <Tag
                                            key={tag}
                                            type="danger"
                                            className="mx-1"
                                        >
                                            {tag}
                                        </Tag>
                                    ))}
                            </div>
                        </Card>
                    </div>
                ))
            )}
        </>
    );
};

export default MarketList;
