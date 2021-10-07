import { useState, useEffect, useContext, useCallback } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { AmplifyS3Image } from "@aws-amplify/ui-react";
import {
    Table,
    Button,
    Notification,
    MessageBox,
    Message,
    Tabs,
    Icon,
    Form,
    Dialog,
    Input,
    Card,
    Tag,
} from "element-react";
import { formatOrderDate, convertCentsToDollars } from "../utils";
import { UserContext } from "../contexts/UserContext";

export const getUser = /* GraphQL */ `
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            username
            email
            registered
            orders {
                items {
                    id
                    userId
                    createdAt
                    updatedAt
                    product {
                        id
                        description
                        price
                        file
                    }
                    shippingAddress {
                        city
                        country
                        address_line1
                        address_state
                        address_zip
                    }
                }
                nextToken
            }
            createdAt
            updatedAt
        }
    }
`;

const ProfilePage = () => {
    const { user } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [email, setEmail] = useState(user && user.attributes.email);
    const [emailDialog, setEmailDialog] = useState(false);
    const [verificationForm, setVerificationForm] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");

    const fetchUser = useCallback(() => {
        (async () => {
            try {
                const userData = await API.graphql(
                    graphqlOperation(getUser, { id: user.attributes.sub })
                );
                setOrders(userData.data.getUser.orders.items);
            } catch (err) {
                console.log("error fetching user", err);
            }
        })();
    }, [user]);

    const removeUser = () => {
        MessageBox.confirm(
            "This will permanently delete your account. Continue?",
            "Attention!",
            {
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                type: "warning",
            }
        )
            .then(async () => {
                try {
                    await user.deleteUser();
                    Message({
                        type: "info",
                        message: "Profile deleted!",
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .catch(() => {
                Message({
                    type: "info",
                    message: "Profile deletion canceled",
                });
            });
    };

    const updateEmail = async () => {
        try {
            const result = await Auth.updateUserAttributes(user, { email });

            if (result === "SUCCESS") {
                await sendVerificationCode();
            }
        } catch (err) {
            console.error(err);
            Notification.error({
                title: "Error",
                message: `${err.message || "Error updating email"}`,
            });
        }
    };

    const sendVerificationCode = async () => {
        try {
            const result = await Auth.verifyCurrentUserAttribute("email");
            setVerificationForm(true);

            if (result === "SUCCESS") {
                Message({
                    type: "success",
                    message: "Verification code sent!",
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const verifyEmail = async () => {
        try {
            const result = await Auth.verifyCurrentUserAttributeSubmit(
                "email",
                verificationCode
            );

            Notification({
                title: "Success",
                message: "Email successfully verified",
                type: `${result.toLowerCase()}`,
            });

            setVerificationCode("");
            setVerificationForm(false);
            setEmailDialog(false);
        } catch (err) {
            console.error(err);
            Notification.error({
                title: "Error",
                message: `${err.message || "Error updating email"}`,
            });
        }
    };

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const columns = [
        { prop: "name", width: "150" },
        { prop: "value", width: "330" },
        {
            prop: "tag",
            width: "150",
            render: (row) => {
                if (row.name === "Email") {
                    const emailVerified = user.attributes.email_verified;
                    return emailVerified ? (
                        <Tag type="success">Verified</Tag>
                    ) : (
                        <Tag type="danger">Unverified</Tag>
                    );
                }
            },
        },
        {
            prop: "operations",
            render: (row) => {
                switch (row.name) {
                    case "Email":
                        return (
                            <Button
                                type="info"
                                size="small"
                                onClick={() => setEmailDialog(true)}
                            >
                                Edit
                            </Button>
                        );
                    case "Delete Profile":
                        return (
                            <Button
                                type="danger"
                                size="small"
                                onClick={removeUser}
                            >
                                Delete
                            </Button>
                        );
                    default:
                        return;
                }
            },
        },
    ];

    return (
        <>
            <Tabs activeName="1" className="profile-tabs">
                <Tabs.Pane
                    label={
                        <>
                            <Icon name="document" className="icon" />
                            Summary
                        </>
                    }
                    name="1"
                >
                    <h2 className="header">Profile Summary</h2>
                    <Table
                        columns={columns}
                        data={[
                            {
                                name: "Your Id",
                                value: user.attributes.sub,
                            },
                            {
                                name: "Username",
                                value: user.username,
                            },
                            {
                                name: "Email",
                                value: user.attributes.email,
                            },
                            {
                                name: "Phone Number",
                                value: user.attributes.phone_number,
                            },
                            {
                                name: "Delete Profile",
                                value: "Sorry to see you go",
                            },
                        ]}
                        showHeader={false}
                        rowClassName={(row) =>
                            row.name === "Delete Profile" && "delete-profile"
                        }
                    />
                </Tabs.Pane>

                <Tabs.Pane
                    label={
                        <>
                            <Icon name="message" className="icon" />
                            Orders
                        </>
                    }
                    name="2"
                >
                    <h2 className="header">Order History</h2>

                    {orders &&
                        orders.map((order) => (
                            <div className="mb-1" key={order.id}>
                                <Card>
                                    <pre>
                                        <p>Order Id: {order.id}</p>
                                        <AmplifyS3Image
                                            imgKey={order.product.file}
                                        />
                                        <p>
                                            Product Description:{" "}
                                            {order.product.description}
                                        </p>
                                        <p>
                                            Price: $
                                            {convertCentsToDollars(
                                                order.product.price
                                            )}
                                        </p>
                                        <p>
                                            Purchased on{" "}
                                            {formatOrderDate(order.createdAt)}
                                        </p>
                                        {order.shippingAddress && (
                                            <>
                                                Shipping Address
                                                <div className="ml-2">
                                                    <p>
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .address_line1
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .city
                                                        }
                                                        ,{" "}
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .address_state
                                                        }{" "}
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .country
                                                        }{" "}
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .address_zip
                                                        }
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </pre>
                                </Card>
                            </div>
                        ))}
                </Tabs.Pane>
            </Tabs>

            {/* Email Dialog */}
            <Dialog
                size="large"
                customClass="dialog"
                title="Edit Email"
                visible={emailDialog}
                onCancel={() => setEmailDialog(false)}
            >
                <Dialog.Body>
                    <Form labelPosition="top">
                        <Form.Item label="Email">
                            <Input
                                value={email}
                                onChange={(email) => setEmail(email)}
                            />
                        </Form.Item>
                        {verificationForm && (
                            <Form.Item
                                label="Enter Verification Code"
                                labelWidth="120"
                            >
                                <Input
                                    onChange={(verificationCode) =>
                                        setVerificationCode(verificationCode)
                                    }
                                    value={verificationCode}
                                />
                            </Form.Item>
                        )}
                    </Form>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button onClick={() => setEmailDialog(false)}>
                        Cancel
                    </Button>
                    {!verificationForm && (
                        <Button type="primary" onClick={updateEmail}>
                            Update
                        </Button>
                    )}
                    {verificationForm && (
                        <Button type="primary" onClick={verifyEmail}>
                            Submit
                        </Button>
                    )}
                </Dialog.Footer>
            </Dialog>
        </>
    );
};

export default ProfilePage;
