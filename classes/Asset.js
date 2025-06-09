const filter = (value, property, result) => {
    let filteredResult = result.filter(status => status[property].toLowerCase().includes(value.toLowerCase()));
    if (!filteredResult?.length) {
        filteredResult = [];
    }

    return filteredResult
};

const data = {
    address_type: [
        {value: '1', label: 'School'},
        {value: '2', label: 'Office'},
        {value: '3', label: 'Home'},
        {value: '4', label: 'Group Home'},
        {value: '5', label: 'Community Mental Health Center'},
        {value: '6', label: 'Other Place of Service'}
    ],
    true_false: [
        {value: '1', label: "Inactive"},
        {value: '2', label: "Active"}
    ],
    yes_no: [
        {value: '1', label: "Yes"},
        {value: '0', label: "No"}
    ],
    sex: [
        {value: '1', label: 'Male'},
        {value: '2', label: 'Female'},
        {value: '3', label: 'Other'},
    ]
};

const Asset = class {
    constructor() {
    }

    static getData(dataName, value = null, property = 'label') {
        let result = data[dataName];

        if (property && value) {
            result = filter(value, property, result);
        }

        return result;
    }

    static getAllData() {
        return data;
    }
};

module.exports = Asset;