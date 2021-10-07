import { useContext, useState } from "react";
import {
    Form,
    Button,
    Dialog,
    Input,
    Select,
    Notification,
} from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../contexts/UserContext";

function NewMarket({
    handleSearch,
    handleClearSearch,
    handleSearchChange,
    isSearching,
    searchTerm,
}) {
    const { user } = useContext(UserContext);

    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [options, setOptions] = useState([]);

    const onSearch = (query) => {
        const filteredOptions = tags
            .map((tag) => ({ value: tag, label: tag }))
            .filter((tag) =>
                tag.label.toLowerCase().includes(query.toLowerCase())
            );
        setOptions(filteredOptions);
    };

    const addMarketHandler = async () => {
        try {
            const input = {
                name: name,
                tags: selectedTags,
                owner: user.username,
            };
            const result = await API.graphql(
                graphqlOperation(createMarket, { input })
            );
            console.log({ result });
            console.info(`Created market: id ${result.data.createMarket.id}`);
            setName("");
            setSelectedTags([]);
            setVisible(false);
            Notification({
                title: "Success",
                message: `Market created successfully`,
                type: "success",
                duration: 3000,
            });
        } catch (err) {
            console.error("Error adding new market", err);
            Notification.error({
                title: "Error",
                message: `${err.message || "Error adding market"}`,
            });
        }
    };

    const tags = [
        "Arts",
        "Web Dev",
        "Technology",
        "Crafts",
        "Entertainment",
        "Sports",
        "Music",
        "Business",
        "Fashion",
        "Food",
        "Health",
        "Travel",
        "Other",
    ];

    return (
        <>
            <div className="market-header">
                <h1 className="market-title">
                    Create Your MarketPlace
                    <Button
                        type="text"
                        icon="edit"
                        className="market-title-button"
                        onClick={() => setVisible(true)}
                    />
                </h1>

                <Form inline={true} onSubmit={handleSearch}>
                    <Form.Item>
                        <Input
                            placeholder="Search Markets..."
                            value={searchTerm}
                            icon="circle-cross"
                            onIconClick={handleClearSearch}
                            onChange={handleSearchChange}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="info"
                            icon="search"
                            onClick={handleSearch}
                            loading={isSearching}
                        >
                            Search
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <Dialog
                title="Create New Market"
                visible={visible}
                onCancel={() => setVisible(false)}
                size="large"
                customClass="dialog"
            >
                <Dialog.Body>
                    <Form labelPosition="top">
                        <Form.Item label="Add Market Name">
                            <Input
                                placeholder="Market Name"
                                trim={true}
                                onChange={(name) => setName(name)}
                                value={name}
                            />
                        </Form.Item>
                        <Form.Item label="Add Tags">
                            <Select
                                multiple={true}
                                filterable={true}
                                placeholder="Market Tags"
                                onChange={(selectedTags) =>
                                    setSelectedTags(selectedTags)
                                }
                                remoteMethod={onSearch}
                                remote={true}
                            >
                                {options.map((option) => (
                                    <Select.Option
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button onClick={() => setVisible(false)}>Cancel</Button>
                    <Button
                        type="primary"
                        disabled={!name}
                        onClick={addMarketHandler}
                    >
                        Add
                    </Button>
                </Dialog.Footer>
            </Dialog>
        </>
    );
}

export default NewMarket;
