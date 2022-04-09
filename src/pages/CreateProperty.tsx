import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { propertyType } from "../types";

type CreatePropertyProps = {
    url: string,
    items: propertyType[],
    updateItems: () => void
}

const CreateProperty = ({ url, items, updateItems } : CreatePropertyProps ) => {

    const [newCategory, setNewCategory] = useState<{name: string}>();

    const fetchData = useFetch();

    const pushData = () => {
        fetchData(url, "POST", newCategory);
        updateItems();
    }

    const deleteData = (id: number) => {
        fetchData(`${url}/${id}`, "DELETE");
        updateItems();
    }

    return (
        <form>
            {items.map(category => 
                <div>
                    <label htmlFor={category.name}>{category.name}</label>
                    <button type="button" id={category.name} onClick={() => deleteData(category._id)}>Supprimer</button>
                </div>
            )}

            <div>
                <input type="text" name="name" id="name" onChange={e => setNewCategory({name: e.target.value})}/>
                <input type="button" value="Ajouter" onClick={() => newCategory && pushData()}/>
            </div>

        </form>
    )
}

export { CreateProperty }