import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { Notification, Message } from "element-react";
import { useHistory } from "react-router-dom";
import { createOrder } from "../graphql/mutations";
import { getUser } from "../graphql/queries";

const stripeConfig = {
    currency: "INR",
    publishableAPIKey:
        "pk_test_51H8hlaJw1IphkJ3MAWTSFrRAGHCMouXlpV9U7KBXZDucnorqLqqpaYmcFPlzSD7CRarJTvjkKcukzuKcCoqBOM2x00gncJONo0",
};

const getSellerEmail = async (userId) => {
    const user = await API.graphql(graphqlOperation(getUser, { id: userId }));
    return user.data.getUser.email;
};

const PayButton = ({ user, product }) => {
    const history = useHistory();

    const handleCharge = async (token) => {
        const sellerEmail = await getSellerEmail(product.owner);

        const result = await API.post("serverlessmarketplace", "/charge", {
            body: {
                token: token.id,
                charge: {
                    amount: product.price,
                    currency: stripeConfig.currency,
                    description: `Product Purchased: ${product.name} | ${product.description}`,
                    shipped: product.shipped,
                },
                emails: {
                    buyer: user.attributes.email,
                    seller: sellerEmail,
                },
            },
        });

        const shippingAddress = {
            city: result.result.source.address_city,
            country: result.result.source.address_country,
            address_line1: result.result.source.address_line1,
            address_state: result.result.source.address_state,
            address_zip: result.result.source.address_zip,
        };

        if (result.result.status === "succeeded") {
            await API.graphql(
                graphqlOperation(createOrder, {
                    input: {
                        userId: user.attributes.sub,
                        orderProductId: product.id,
                        shippingAddress: product.shipped
                            ? shippingAddress
                            : null,
                    },
                })
            );

            Notification({
                title: "Order Placed Successfully",
                message: "Your order has been placed successfully",
                type: "success",
                duration: 5000,
            });

            setTimeout(() => {
                history.push("/");
                Message({
                    type: "info",
                    message: "Check your verified email for order details",
                    duration: 5000,
                    showClose: true,
                });
            }, 5000);
        }
    };

    return (
        <StripeCheckout
            token={handleCharge}
            email={user.attributes.email}
            name={product.description}
            amount={product.price}
            currency={stripeConfig.currency}
            stripeKey={stripeConfig.publishableAPIKey}
            shippingAddress={product.shipped}
            billingAddress={product.shipped}
            locale="auto"
            allowRememberMe={false}
        />
    );
};

export default PayButton;
