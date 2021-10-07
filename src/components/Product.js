import React from "react";
import { AmplifyS3Image } from "@aws-amplify/ui-react";
import {
    Notification,
    Popover,
    Button,
    Dialog,
    Card,
    Form,
    Input,
    Radio,
} from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { deleteProduct, updateProduct } from "../graphql/mutations";
import { convertCentsToDollars, convertDollarsToCents } from "../utils";
import PayButton from "./PayButton";
import { Link } from "react-router-dom";

function Product({ product, user }) {
    const isOwner = user.attributes.sub === product.owner;
    const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
    const [updateDialogVisible, setUpdateDialogVisible] = React.useState(false);
    const [description, setDescription] = React.useState(product.description);
    const [price, setPrice] = React.useState(
        convertCentsToDollars(product.price)
    );
    const [shipped, setShipped] = React.useState(product.shipped);

    const handleUpdateProduct = async () => {
        const updatedProduct = {
            id: product.id,
            description,
            price: convertDollarsToCents(price),
            shipped,
        };
        try {
            await API.graphql(
                graphqlOperation(updateProduct, { input: updatedProduct })
            );
            Notification({
                title: "Product Updated",
                message: "Your product has been updated",
                type: "success",
                duration: 5000,
            });
            setUpdateDialogVisible(false);
        } catch (err) {
            Notification({
                title: "Error",
                message: err.message,
                type: "error",
                duration: 5000,
            });
        }
    };

    const handleDeleteProduct = async () => {
        try {
            await API.graphql(
                graphqlOperation(deleteProduct, { input: { id: product.id } })
            );
            Notification({
                title: "Product Deleted",
                message: "Your product has been deleted",
                type: "success",
                duration: 5000,
            });
            setDeleteDialogVisible(false);
        } catch (err) {
            Notification({
                title: "Error",
                message: err.message,
                type: "error",
                duration: 5000,
            });
        }
    };

    return (
        <div className="card-container">
            <Card
                bodyStyle={{
                    padding: 0,
                    minWidth: "200px",
                }}
            >
                <AmplifyS3Image imgKey={product.file} />
                <div className="card-body">
                    <h3 className="m-0">{product.description}</h3>
                    <div className="items-center">
                        {/* <img
                            src={`https://icon.now.sh/${
                                product.shipped ? "markunread_mailbox" : "mail"
                            }`}
                            alt="Shipping Icon"
                            className="icon"
                        /> */}
                        {product.shipped ? "Shipped" : "Emailed"}
                    </div>
                    <div className="text-right">
                        <span className="mx-1">
                            ${convertCentsToDollars(product.price)}
                        </span>
                        {user.attributes.email_verified ? (
                            !isOwner && (
                                <PayButton user={user} product={product} />
                            )
                        ) : (
                            <Link to="/profile" className="link">
                                Verify Email
                            </Link>
                        )}
                    </div>
                </div>
            </Card>

            <div className="text-center">
                {isOwner && (
                    <>
                        {/* delete product dialog */}
                        <Popover
                            placement="top"
                            width="160"
                            trigger="click"
                            visible={deleteDialogVisible}
                            content={
                                <>
                                    <p>Do you want to delete this?</p>
                                    <div className="text-right">
                                        <Button
                                            size="mini"
                                            type="text"
                                            className="m-1"
                                            onClick={() =>
                                                setDeleteDialogVisible(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="mini"
                                            className="m-1"
                                            onClick={() =>
                                                handleDeleteProduct()
                                            }
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </>
                            }
                        >
                            <Button
                                onClick={() => setDeleteDialogVisible(true)}
                                type="danger"
                                icon="delete"
                            />
                        </Popover>

                        {/* update product button */}
                        <Button
                            type="warning"
                            icon="edit"
                            className="m-1"
                            onClick={() => setUpdateDialogVisible(true)}
                        />

                        {/* update product dialog */}
                        <Dialog
                            title="Update Product"
                            size="large"
                            customClass="dialog"
                            visible={updateDialogVisible}
                            onCancel={() => setUpdateDialogVisible(false)}
                        >
                            <Dialog.Body>
                                <Form labelPosition="top">
                                    <Form.Item label="Update Description">
                                        <Input
                                            icon="information"
                                            placeholder="Product Description"
                                            value={description}
                                            trim={true}
                                            onChange={(description) =>
                                                setDescription(description)
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item label="Update Price">
                                        <Input
                                            type="number"
                                            icon="plus"
                                            placeholder="Price ($USD)"
                                            value={price}
                                            onChange={(price) =>
                                                setPrice(price)
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item label="Update Shipping">
                                        <div className="text-center">
                                            <Radio
                                                value="true"
                                                checked={shipped}
                                                onChange={() =>
                                                    setShipped(true)
                                                }
                                            >
                                                Shipped
                                            </Radio>
                                            <Radio
                                                value="false"
                                                checked={!shipped}
                                                onChange={() =>
                                                    setShipped(false)
                                                }
                                            >
                                                Emailed
                                            </Radio>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    onClick={() =>
                                        setUpdateDialogVisible(false)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => handleUpdateProduct()}
                                    disabled={!description || !price}
                                >
                                    Update
                                </Button>
                            </Dialog.Footer>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
}

export default Product;
