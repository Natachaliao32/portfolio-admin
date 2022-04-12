import { useState } from "react";

const useFetch = () => {

    // const [data, setData] = useState();

    const fetchData = async (url: string, method: string, dataToSend?: object | FormData) => {

        const body = dataToSend instanceof FormData ? dataToSend : JSON.stringify(dataToSend);
        const headers = dataToSend instanceof FormData ? undefined : {
            'Content-Type': 'application/json; charset=UTF-8',
        };

        let data;

        try {
            const response = await fetch(url, {
                method,
                body,
                headers
            })

            if(!response.ok) {
                alert("Pas de réponse");
                Promise.reject(response)
            };
            
            data = await response.json();
            
        } catch (error) {
            console.log(error);
            alert(error);
        }

        return data;
    }

    return fetchData;
}

export { useFetch }