import { useState } from "react";

const useFetch = () => {

    // const [data, setData] = useState();

    const fetchData = async (url: string, method: string, dataToSend?: object) => {

        const response = await fetch(url, {
            method,
            body: JSON.stringify(dataToSend),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            }
        })

        if(!response.ok) Promise.reject(response);

        const data = await response.json();

        return data;
    }

    return fetchData;
}

export { useFetch }