import { useContext, useEffect, useState, useCallback } from "react";
import { Loading, Tabs, Icon } from "element-react";
import { Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import { UserContext } from "../contexts/UserContext";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import {
    onDeleteProduct,
    onUpdateProduct,
    onCreateProduct,
} from "../graphql/subscriptions";
import { formatMarketDate } from "../utils";

const MarketPage = (props) => {
    const [loading, setLoading] = useState(true);
    const [market, setMarket] = useState([]);
    const [isOwner, setIsOwner] = useState(false);

    const { user } = useContext(UserContext);
    const { marketId } = props.match.params;

    const fetchMarket = useCallback(() => {
        (async () => {
            try {
                const result = await API.graphql(
                    graphqlOperation(getMarket, {
                        id: marketId,
                    })
                );
                setMarket(result.data.getMarket);
                setLoading(false);
                setIsOwner(result.data.getMarket.owner === user.username);
            } catch (err) {
                console.log("error fetching market", err);
                setLoading(false);
            }
        })();
    }, [marketId, user]);

    useEffect(() => {
        fetchMarket();
    }, [fetchMarket]);

    useEffect(() => {
        const updateProductSubscription = API.graphql(
            graphqlOperation(onUpdateProduct, {
                owner: user.attributes.sub,
            })
        ).subscribe({
            next: (eventData) => {
                const result = eventData.value.data.onUpdateProduct;
                const updatedProducts =
                    market &&
                    market.products.items.map((product) => {
                        if (product.id === result.id) {
                            return result;
                        }
                        return product;
                    });
                setMarket({
                    ...market,
                    products: { ...market.products, items: updatedProducts },
                });
            },
        });

        const deleteProductSubscription = API.graphql(
            graphqlOperation(onDeleteProduct, {
                owner: user.attributes.sub,
            })
        ).subscribe({
            next: (eventData) => {
                const result = eventData.value.data.onDeleteProduct;
                const updatedProducts =
                    market &&
                    market.products.items.filter((product) => {
                        return product.id !== result.id;
                    });
                setMarket({
                    ...market,
                    products: { ...market.products, items: updatedProducts },
                });
            },
        });

        const createProductSubscription = API.graphql(
            graphqlOperation(onCreateProduct, {
                owner: user.attributes.sub,
            })
        ).subscribe({
            next: (eventData) => {
                const result = eventData.value.data.onCreateProduct;
                setMarket({
                    ...market,
                    products: {
                        ...market.products,
                        items: [...market.products.items, result],
                    },
                });
            },
        });

        return () => {
            updateProductSubscription.unsubscribe();
            deleteProductSubscription.unsubscribe();
            createProductSubscription.unsubscribe();
        };
    }, [market, user]);

    return loading ? (
        <Loading fullscreen={true} />
    ) : (
        <>
            {/* Back Button */}
            <Link className="link" to="/">
                Back to Markets List
            </Link>

            {/* Market MetaData */}
            <span className="items-center pt-2">
                <h2 className="mb-mr">{market.name}</h2>- {market.owner}
            </span>
            <div className="items-center pt-2">
                <span
                    style={{
                        color: "var(--lightSquidInk)",
                        paddingBottom: "1em",
                    }}
                >
                    <Icon name="date" className="icon" />
                    {formatMarketDate(market.createdAt)}
                </span>
            </div>

            {/* New Product */}
            <Tabs type="border-card" value={isOwner ? "1" : "2"}>
                {isOwner && (
                    <Tabs.Pane
                        label={
                            <>
                                <Icon name="plus" className="icon" />
                                Add Product
                            </>
                        }
                        name="1"
                    >
                        {user.attributes.email_verified ? (
                            <NewProduct
                                marketId={props.match.params.marketId}
                            />
                        ) : (
                            <Link to="/profile" className="header">
                                Verify Your Email Before Adding Products
                            </Link>
                        )}
                    </Tabs.Pane>
                )}

                {/* Products List */}
                <Tabs.Pane
                    label={
                        <>
                            <Icon name="menu" className="icon" />
                            Products ({market.products.items.length})
                        </>
                    }
                    name="2"
                >
                    <div className="product-list">
                        {market.products.items.map((product) => (
                            <Product
                                key={product.id}
                                product={product}
                                user={user}
                            />
                        ))}
                    </div>
                </Tabs.Pane>
            </Tabs>
        </>
    );
};

export default MarketPage;
