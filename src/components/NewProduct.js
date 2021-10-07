import { useState } from "react";
import { Form, Button, Input, Notification, Radio } from "element-react";
import { AmplifyS3ImagePicker } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { createProduct } from "../graphql/mutations";
import { convertDollarsToCents } from "../utils";

const NewProduct = ({ marketId }) => {
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [shipped, setShipped] = useState(true);
    const [key, setKey] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleAddProduct = async () => {
        setIsUploading(true);
        const product = {
            description,
            price: convertDollarsToCents(price),
            shipped,
            file: key,
            marketId: marketId,
        };
        try {
            await API.graphql(
                graphqlOperation(createProduct, { input: product })
            );
            Notification({
                title: "Success",
                message: "Product added successfully",
                type: "success",
                duration: 3000,
            });
            setDescription("");
            setPrice(0);
            setShipped(true);
            setKey("");
            setIsUploading(false);
        } catch (err) {
            Notification({
                title: "Error",
                message: "Error adding product",
                type: "error",
                duration: 3000,
            });
            setIsUploading(false);
        }
    };

    return (
        <div className="flex-center">
            <h2 className="header">Add New Product</h2>
            <div>
                <Form className="market-header">
                    <Form.Item label="Add Product Description">
                        <Input
                            type="text"
                            icon="information"
                            placeholder="Description"
                            value={description}
                            onChange={(description) =>
                                setDescription(description)
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Set Product Price">
                        <Input
                            type="number"
                            icon="plus"
                            placeholder="Price ($USD)"
                            value={price}
                            onChange={(price) => setPrice(price)}
                        />
                    </Form.Item>
                    <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
                        <div className="text-center">
                            <Radio
                                value="true"
                                checked={shipped}
                                onChange={() => setShipped(true)}
                            >
                                Shipped
                            </Radio>
                            <Radio
                                value="false"
                                checked={!shipped}
                                onChange={() => setShipped(false)}
                            >
                                Emailed
                            </Radio>
                        </div>
                    </Form.Item>

                    <AmplifyS3ImagePicker
                        fileToKey={(data) => {
                            const keyName = `${Date.now()}_${data.name}`;
                            setKey(keyName);
                            return keyName;
                        }}
                    />

                    <Form.Item>
                        <Button
                            disabled={
                                !key || !description || !price || isUploading
                            }
                            type="primary"
                            onClick={handleAddProduct}
                            loading={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Add Product"}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default NewProduct;
